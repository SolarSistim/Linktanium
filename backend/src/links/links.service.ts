import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Link } from "./link.entity";
import { Tag } from "src/tags/tag.entity";
import { LinkGroup } from "src/link-groups/link-groups.entity";
import { BadRequestException } from "@nestjs/common";

interface LinkDTO {
  name?: string;
  url?: string;
  icon?: string;
  description?: string;
  tags?: string[];
  groupId?: number | null;
}

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private linkRepo: Repository<Link>,
    @InjectRepository(Tag)
    private tagRepo: Repository<Tag>,
    @InjectRepository(LinkGroup)
    private groupRepo: Repository<LinkGroup>
  ) {}

  async moveAndReorder(
    movedLinkId: number,
    newGroupId: number,
    reorderedLinks: { id: number; position: number }[]
  ) {
    const movedLink = await this.linkRepo.findOne({
      where: { id: movedLinkId },
    });
    if (!movedLink) {
      throw new NotFoundException("Link not found");
    }

    movedLink.group = { id: newGroupId } as any;
    await this.linkRepo.save(movedLink);

    await Promise.all(
      reorderedLinks.map((link) =>
        this.linkRepo.update(link.id, { position: link.position })
      )
    );

    return { success: true };
  }

  async create(linkData: LinkDTO) {
    const tagNames = linkData.tags || [];
    const groupId = linkData.groupId;

    const tags = await Promise.all(
      tagNames.map(async (name: string) => {
        const existing = await this.tagRepo.findOne({ where: { name } });
        if (!existing)
          throw new BadRequestException(`Tag '${name}' does not exist`);
        return existing;
      })
    );

    if (!groupId) {
      throw new BadRequestException(
        "Link must be associated with a group (groupId is required)"
      );
    }

    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group)
      throw new BadRequestException(`Group with ID ${groupId} not found`);

    const maxPosition = await this.linkRepo
      .createQueryBuilder("link")
      .where("link.groupId = :groupId", { groupId })
      .select("MAX(link.position)", "max")
      .getRawOne();

    const position = (maxPosition?.max ?? -1) + 1;

    const link = this.linkRepo.create({
      ...linkData,
      tags,
      group,
      position,
    });

    return this.linkRepo.save(link);
  }

  async reorder(links: { id: number; position: number }[]) {
    for (const { id, position } of links) {
      await this.linkRepo.update(id, { position });
    }
    return { success: true };
  }

  async findAll(options?: {
    tagId?: number;
    search?: string;
  }): Promise<Link[]> {
    const { tagId, search } = options || {};

    const qb = this.linkRepo
      .createQueryBuilder("link")
      .leftJoinAndSelect("link.group", "group")
      .leftJoinAndSelect("link.tags", "tag");

    if (tagId) {
      qb.andWhere("tag.id = :tagId", { tagId });
    }

    if (search) {
      const terms = search
        .toLowerCase()
        .split(/\s+/)
        .filter((term) => term.trim().length > 0);

      for (const [index, term] of terms.entries()) {
        qb.andWhere(
          `(LOWER(link.name) LIKE :term${index} OR LOWER(link.url) LIKE :term${index} OR LOWER(link.description) LIKE :term${index})`,
          { [`term${index}`]: `%${term}%` }
        );
      }
    }

    return qb.orderBy("link.position", "ASC").getMany();
  }

  findOne(id: number) {
    return this.linkRepo.findOne({
      where: { id },
      relations: ["group"],
    });
  }

  async update(id: number, data: LinkDTO) {
    console.log("Incoming update request:", { id, data });
    const link = await this.linkRepo.findOne({
      where: { id },
      relations: ["tags", "group"],
    });
    if (!link) throw new Error(`Link with ID ${id} not found`);

    console.log("Found link before update:", link);

    if (data.name !== undefined) link.name = data.name;
    if (data.url !== undefined) link.url = data.url;
    if (data.description !== undefined) link.description = data.description;
    if (data.icon !== undefined) link.icon = data.icon;

    if (data.groupId !== undefined) {
      if (data.groupId === null) {
        link.group = null as unknown as LinkGroup;
      } else {
        const group = await this.groupRepo.findOne({
          where: { id: data.groupId },
        });
        if (!group) throw new Error(`Group with ID ${data.groupId} not found`);
        link.group = group;
      }
    }

    if (data.tags !== undefined) {
      const tags = await Promise.all(
        data.tags.map(async (name: string) => {
          const existing = await this.tagRepo.findOne({ where: { name } });
          if (!existing)
            throw new BadRequestException(`Tag '${name}' does not exist`);
          return existing;
        })
      );
      link.tags = tags;
    }

    console.log("Link before save:", link);

    return this.linkRepo.save(link);
  }

  remove(id: number) {
    return this.linkRepo.delete(id);
  }
}
