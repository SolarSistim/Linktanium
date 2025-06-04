import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { List } from "./list.entity";
import { LinkGroup } from "../link-groups/link-groups.entity";
import { ListItemCategory } from "./list-item-category.entity";
import { ListItem } from "./list-item.entity";

@Injectable()
export class ListsService {
  @InjectRepository(ListItem)
  private itemRepo: Repository<ListItem>;

  constructor(
    @InjectRepository(List)
    private listRepo: Repository<List>,
    @InjectRepository(LinkGroup)
    private groupRepo: Repository<LinkGroup>,
    @InjectRepository(ListItemCategory)
    private categoryRepo: Repository<ListItemCategory>
  ) {}

  async createList(groupId: number, name: string) {
    const existing = await this.listRepo.findOne({
      where: {
        name,
        group: { id: groupId },
      },
      relations: ["group"],
    });
    if (existing) {
      throw new BadRequestException(
        "A list with this name already exists in this group"
      );
    }
    if (existing) throw new BadRequestException("List name already exists");

    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new BadRequestException("Group not found");

    const maxPosition = await this.listRepo
      .createQueryBuilder("list")
      .where("list.groupId = :groupId", { groupId })
      .select("MAX(list.position)", "max")
      .getRawOne();

    const list = this.listRepo.create({
      name,
      group,
      position: (maxPosition?.max ?? -1) + 1,
    });

    const savedList = await this.listRepo.save(list);

    const category = this.categoryRepo.create({
      name: "My List",
      list: savedList,
      position: 0,
    });
    await this.categoryRepo.save(category);

    return savedList;
  }

  async getCategoriesForList(listId: number) {
    return this.categoryRepo.find({
      where: { list: { id: listId } },
      order: { position: "ASC" },
    });
  }

  async getById(id: number) {
    const list = await this.listRepo.findOne({
      where: { id },
      relations: ["group"],
    });
    if (!list) throw new NotFoundException("List not found");
    return list;
  }

  async getByName(slug: string) {
    const list = await this.listRepo.findOne({
      where: { name: slug },
      relations: ["group"],
    });
    if (!list) throw new NotFoundException("List not found");
    return list;
  }

  async updateListName(id: number, newName: string) {
    const currentList = await this.listRepo.findOne({
      where: { id },
      relations: ["group"],
    });
    if (!currentList) throw new NotFoundException("List not found");

    const existing = await this.listRepo.findOne({
      where: {
        name: newName,
        group: { id: currentList.group.id },
      },
      relations: ["group"],
    });

    if (existing && existing.id !== id) {
      throw new BadRequestException(
        "Another list already has this name in this group"
      );
    }

    await this.listRepo.update(id, { name: newName });
    return { success: true };
  }

  async deleteList(id: number) {
    return this.listRepo.delete(id);
  }

  async moveAndReorderList(
    movedListId: number,
    newGroupId: number,
    reorderedLists: { id: number; position: number }[]
  ) {
    console.log("🧠 Incoming payload to moveAndReorderList", {
      movedListId,
      newGroupId,
      reorderedLists,
    });

    const id = Number(movedListId);
    const groupId = Number(newGroupId);

    if (isNaN(id)) throw new BadRequestException("movedListId is NaN");
    if (isNaN(groupId)) throw new BadRequestException("newGroupId is NaN");

    const list = await this.listRepo.findOne({ where: { id } });
    if (!list) throw new NotFoundException("List not found");

    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException("Group not found");

    list.group = group;

    const newPosition = reorderedLists.find((l) => l.id === id)?.position;
    if (typeof newPosition === "number") {
      list.position = newPosition;
    }

    await this.listRepo.save(list);

    await Promise.all(
      reorderedLists
        .filter((l) => l.id !== id)
        .map((l) => this.listRepo.update(l.id, { position: l.position }))
    );

    return { success: true };
  }

  async reorderListsInGroup(
    groupId: number,
    reorderedLists: { id: number; position: number }[]
  ): Promise<void> {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) {
      throw new BadRequestException(`Group with ID ${groupId} not found`);
    }

    await Promise.all(
      reorderedLists.map(async (list) => {
        const lid = Number(list.id);
        const pos = Number(list.position);
        if (isNaN(lid) || isNaN(pos)) {
          console.warn("⚠️ Skipping invalid list in reorder (in group)", list);
          return;
        }
        await this.listRepo.update(lid, { position: pos });
      })
    );
  }

  async getItemsForList(listId: number) {
    return this.itemRepo.find({
      where: { list: { id: listId } },
      relations: ["category"],
      order: { position: "ASC" },
    });
  }

  async getDefaultCategoryForList(listId: number) {
    const categories = await this.categoryRepo.find({
      where: { list: { id: listId } },
      order: { position: "ASC" },
    });
    return categories.length > 0 ? categories[0] : null;
  }

  async addCategoryToList(listId: number, name: string) {
    const list = await this.listRepo.findOne({ where: { id: listId } });
    if (!list) throw new NotFoundException("List not found");

    const existing = await this.categoryRepo.findOne({
      where: { list: { id: listId }, name },
    });

    if (existing) {
      throw new BadRequestException(
        "A category with this name already exists in this list"
      );
    }

    const maxPosition = await this.categoryRepo
      .createQueryBuilder("category")
      .where("category.listId = :listId", { listId })
      .select("MAX(category.position)", "max")
      .getRawOne();

    const category = this.categoryRepo.create({
      name,
      list,
      position: (maxPosition?.max ?? -1) + 1,
    });

    return this.categoryRepo.save(category);
  }

  async reorderCategories(
    listId: number,
    categories: { id: number; position: number }[]
  ): Promise<{ success: boolean }> {
    for (const cat of categories) {
      await this.categoryRepo.update(
        { id: cat.id, list: { id: listId } },
        { position: cat.position }
      );
    }

    return { success: true };
  }

  async deleteCategoryById(listId: number, categoryId: number) {
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId, list: { id: listId } },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return this.categoryRepo.delete(category.id);
  }

  async updateCategoryName(
    listId: number,
    categoryId: number,
    newName: string
  ) {
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId, list: { id: listId } },
    });
    if (!category) throw new NotFoundException("Category not found");

    category.name = newName;
    return this.categoryRepo.save(category);
  }

  async getAllLists() {
    return this.listRepo.find({
      relations: ["group"],
      order: { position: "ASC" },
    });
  }
}
