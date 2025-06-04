import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LinkCategory } from "./link-categories.entity";
import { BadRequestException } from "@nestjs/common";

@Injectable()
export class LinkCategoryService {
  constructor(
    @InjectRepository(LinkCategory)
    private catRepo: Repository<LinkCategory>
  ) {}

  async create(data: Partial<LinkCategory>) {
    const name = data.name?.trim().toLowerCase();

    if (!name) {
      throw new BadRequestException("Category name is required");
    }

    const existing = await this.catRepo
      .createQueryBuilder("category")
      .where("LOWER(category.name) = :name", { name })
      .getOne();

    if (existing) {
      throw new BadRequestException(
        `A category named "${data.name}" already exists.`
      );
    }

    const maxPosition = await this.catRepo
      .createQueryBuilder("category")
      .select("MAX(category.position)", "max")
      .getRawOne();

    const category = this.catRepo.create({
      ...data,
      position: (maxPosition?.max ?? -1) + 1,
    });

    return this.catRepo.save(category);
  }

  async findAllSimple() {
    return this.catRepo.find({
      select: ["id", "name", "position"],
      order: { position: "ASC" },
    });
  }

  async findOneFull(id: number) {
    return this.catRepo.findOne({
      where: { id },
      relations: {
        groups: {
          links: {
            tags: true,
          },
          lists: true,
        },
      },
      order: {
        groups: {
          position: "ASC",
          links: {
            position: "ASC",
          },
        },
      },
    });
  }

  findAll() {
    return this.catRepo.find({
      order: { position: "ASC", groups: { position: "ASC" } },
      relations: [
        "groups",
        "groups.links",
        "groups.links.tags",
        "groups.lists",
      ],
    });
  }

  async reorder(categories: { id: number; position: number }[]) {
    console.log("Updating positions:", categories);
    await Promise.all(
      categories.map(({ id, position }) =>
        this.catRepo.update(id, { position })
      )
    );
    return this.catRepo.find({
      order: { position: "ASC" },
      relations: ["groups", "groups.links", "groups.links.tags"],
    });
  }

  findOne(id: number) {
    return this.catRepo.findOne({ where: { id }, relations: ["groups"] });
  }

  async update(id: number, data: Partial<LinkCategory>) {
    const category = await this.catRepo.findOneBy({ id });
    if (!category) throw new NotFoundException("Category not found");

    if (data.name) {
      const name = data.name.trim().toLowerCase();
      const existing = await this.catRepo
        .createQueryBuilder("category")
        .where("LOWER(category.name) = :name AND category.id != :id", {
          name,
          id,
        })
        .getOne();

      if (existing) {
        throw new BadRequestException(
          `A category named "${data.name}" already exists.`
        );
      }

      category.name = data.name;
    }

    return this.catRepo.save(category);
  }

  async remove(id: number) {
    const category = await this.catRepo.findOneBy({ id });
    if (!category) throw new NotFoundException("Category not found");
    return this.catRepo.remove(category);
  }
}
