import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LinkGroup } from "./link-groups.entity";
import { LinkCategory } from "src/link-categories/link-categories.entity";
import { BadRequestException } from "@nestjs/common";

@Injectable()
export class LinkGroupsService {
  constructor(
    @InjectRepository(LinkGroup)
    private groupRepo: Repository<LinkGroup>,
    @InjectRepository(LinkCategory)
    private categoryRepo: Repository<LinkCategory>
  ) {}

  async create(data: Partial<LinkGroup> & { categoryId: number }) {
    if (!data.categoryId) {
      throw new BadRequestException("categoryId is required");
    }

    const name = data.name?.trim();

    const category = await this.categoryRepo.findOne({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new BadRequestException(
        `Category with ID ${data.categoryId} not found`
      );
    }

    const group = this.groupRepo.create({
      name,
      category,
      position: data.position ?? 0,
    });

    await this.groupRepo.save(group);

    return this.groupRepo.findOne({
      where: { id: group.id },
      relations: ["category"],
    });
  }

  async reorderGroups(
    categoryId: number,
    groups: { id: number; position: number }[]
  ) {
    const updatePromises = groups.map((group) =>
      this.groupRepo.update(group.id, { position: group.position })
    );
    await Promise.all(updatePromises);
    return { success: true };
  }

  async reorder(groups: { id: number; position: number }[]) {
    for (const { id, position } of groups) {
      await this.groupRepo.update(id, { position });
    }
    return { success: true };
  }

  findAll() {
    return this.groupRepo.find({ relations: ["links"] });
  }

  findOne(id: number) {
    return this.groupRepo.findOne({ where: { id }, relations: ["links"] });
  }

  async update(id: number, data: Partial<LinkGroup> & { categoryId?: number }) {
    const group = await this.groupRepo.findOne({ where: { id } });
    if (!group) throw new NotFoundException("Group not found");

    if (data.name !== undefined) {
      group.name = data.name;
    }

    if (data.categoryId !== undefined) {
      const category = await this.categoryRepo.findOne({
        where: { id: data.categoryId },
      });
      if (!category)
        throw new BadRequestException(
          `Category with ID ${data.categoryId} not found`
        );
      group.category = category;
    }

    if (data.position !== undefined) {
      group.position = data.position;
    }

    return this.groupRepo.save(group);
  }

  async remove(id: number) {
    const group = await this.groupRepo.findOneBy({ id });
    if (!group) throw new NotFoundException("Group not found");
    return this.groupRepo.remove(group);
  }
}
