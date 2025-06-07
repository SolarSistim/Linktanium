import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ListItem } from "./list-item.entity";
import { ListItemCategory } from "./list-item-category.entity";
import { List } from "./list.entity";
import { CompletedListItem } from "./completed-list-item.entity";

@Injectable()
export class ListItemsService {
  pinned: false;

  constructor(
    @InjectRepository(ListItem)
    private itemRepo: Repository<ListItem>,
    @InjectRepository(ListItemCategory)
    private catRepo: Repository<ListItemCategory>,
    @InjectRepository(List)
    private listRepo: Repository<List>,
    @InjectRepository(CompletedListItem)
    private completedRepo: Repository<CompletedListItem>
  ) {}

  async togglePinned(id: number, pinned: boolean) {
    const item = await this.itemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException("Item not found");

    item.pinned = pinned;
    return this.itemRepo.save(item);
  }

  async addItem(
    listId: number,
    categoryId: number,
    title: string,
    description: string,
    priority: "High" | "Medium" | "Low" = "Medium"
  ) {
    const list = await this.listRepo.findOne({ where: { id: listId } });
    if (!list) throw new NotFoundException("List not found");

    const category = await this.catRepo.findOne({ where: { id: categoryId } });

    const max = await this.itemRepo
      .createQueryBuilder("item")
      .where("item.listId = :listId", { listId })
      .select("MAX(item.position)", "max")
      .getRawOne();

    const item = this.itemRepo.create({
      title,
      description,
      priority,
      list,
      category: category ?? undefined,
      position: (max?.max ?? -1) + 1,
    });

    return this.itemRepo.save(item);
  }

  async moveItemToCategory(itemId: number, newCategoryId: number) {
    const item = await this.itemRepo.findOne({ where: { id: itemId } });
    if (!item) throw new NotFoundException("Item not found");

    const category = await this.catRepo.findOne({
      where: { id: newCategoryId },
    });
    if (!category) throw new NotFoundException("Category not found");

    item.category = category;
    return this.itemRepo.save(item);
  }

  async completeItem(itemId: number) {
    const item = await this.itemRepo.findOne({
      where: { id: itemId },
      relations: ["list", "category"],
    });
    if (!item) throw new NotFoundException("Item not found");

    const completed = this.completedRepo.create({
      title: item.title,
      description: item.description,
      priority: item.priority,
      list: { id: item.list.id } as any,
      category: item.category ? ({ id: item.category.id } as any) : null,
      originalPosition: item.position,
      completedAt: new Date(),
    });

    await this.itemRepo.delete(itemId);
    return this.completedRepo.save(completed);
  }

  async uncompleteItem(completedItemId: number) {
    const completed = await this.completedRepo.findOne({
      where: { id: completedItemId },
      relations: ["list", "category"],
    });
    if (!completed) throw new NotFoundException("Completed item not found");

    let restoredCategory: ListItemCategory | null = null;

    if (completed.category) {
      const existing = await this.catRepo.findOne({
        where: {
          id: completed.category.id,
          list: { id: completed.list.id },
        },
        relations: ["list"],
      });

      if (existing) {
        restoredCategory = existing;
      }
    }

    const item = this.itemRepo.create({
      title: completed.title,
      description: completed.description,
      list: completed.list,
      category: restoredCategory,
      position: completed.originalPosition,
      priority: completed.priority,
    });

    await this.completedRepo.delete(completedItemId);
    return this.itemRepo.save(item);
  }

  async reorderWithCategoryAndPin(
    listId: number,
    reordered: {
      id: number;
      position: number;
      categoryId: number | null;
      pinned: boolean;
    }[]
  ): Promise<void> {
    for (const { id, position, categoryId, pinned } of reordered) {
      const item = await this.itemRepo.findOne({
        where: { id },
        relations: ["category"],
      });
      if (!item) continue;

      item.position = position;
      item.pinned = pinned;

      if (categoryId !== null) {
        const category = await this.catRepo.findOne({
          where: { id: categoryId },
        });
        if (!category)
          throw new BadRequestException(
            `Category with ID ${categoryId} not found`
          );
        item.category = category;
      } else {
        item.category = null;
      }

      await this.itemRepo.save(item);
    }
  }

  async reorderItems(
    listId: number,
    reordered: { id: number; position: number }[]
  ) {
    await Promise.all(
      reordered.map(({ id, position }) =>
        this.itemRepo.update(id, { position })
      )
    );
    return { success: true };
  }

  async sortItems(listId: number, by: "title" | "date") {
    const qb = this.itemRepo
      .createQueryBuilder("item")
      .where("item.listId = :listId", { listId });

    if (by === "title") {
      qb.orderBy("item.title", "ASC");
    } else {
      qb.orderBy("item.createdAt", "ASC");
    }

    return qb.getMany();
  }

  async deleteItem(id: number) {
    const item = await this.itemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException("Item not found");
    return this.itemRepo.delete(id);
  }

  async reorderWithCategory(
    listId: number,
    reordered: { id: number; position: number; categoryId: number }[]
  ): Promise<void> {
    await Promise.all(
      reordered.map(async ({ id, position, categoryId }) => {
        if (categoryId !== 0) {
          const categoryExists = await this.catRepo.exists({
            where: { id: categoryId },
          });
          if (!categoryExists) {
            throw new BadRequestException(
              `Category with ID ${categoryId} not found.`
            );
          }
          await this.itemRepo.update(id, {
            position,
            category: { id: categoryId },
          });
        } else {
          await this.itemRepo.update(id, { position, category: null as any });
        }
      })
    );
  }

  async getItemWithList(id: number) {
    return this.itemRepo.findOne({
      where: { id },
      relations: ["list"],
    });
  }

  async updateItem(
    id: number,
    {
      title,
      description,
      priority,
      categoryId,
      pinned,
    }: {
      title: string;
      description: string;
      priority: "High" | "Medium" | "Low";
      categoryId: number | null;
      pinned: boolean;
    }
  ) {
    const item = await this.itemRepo.findOne({
      where: { id },
      relations: ["category"],
    });
    if (!item) throw new NotFoundException("Item not found");

    item.title = title;
    item.description = description;
    item.priority = priority;
    item.pinned = pinned;

    if (categoryId !== null) {
      const cat = await this.catRepo.findOne({ where: { id: categoryId } });
      item.category = cat ?? null;
    } else {
      item.category = null;
    }

    return this.itemRepo.save(item);
  }

  async getCompletedItemsForList(listId: number) {
    return this.completedRepo.find({
      where: { list: { id: listId } },
      relations: ["category"],
      order: { completedAt: "DESC" },
    });
  }

  async getAllItems() {
    return this.itemRepo.find({
      relations: ["list"],
      order: { createdAt: "DESC" },
    });
  }
}
