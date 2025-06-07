import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { ListsService } from "./lists.service";
import { BadRequestException } from "@nestjs/common";
import { ListItemsService } from "./list-items.service";
import { InjectRepository } from "@nestjs/typeorm";
import { ListItem } from "./list-item.entity";
import { Repository } from "typeorm";

@Controller("lists")
export class ListsController {
  constructor(
    private readonly listsService: ListsService,
    private readonly listItemsService: ListItemsService,
    @InjectRepository(ListItem)
    private itemRepo: Repository<ListItem>
  ) {}

  @Put("move-reorder-list")
  moveAndReorder(
    @Body()
    body: {
      movedListId: any;
      newGroupId: any;
      reorderedLists: { id: any; position: any }[];
    }
  ) {
    const movedListId = Number(body.movedListId);
    const newGroupId = Number(body.newGroupId);
    const reorderedLists = body.reorderedLists.map((l) => ({
      id: Number(l.id),
      position: Number(l.position),
    }));

    console.log("📥 Backend list move:", {
      movedListId,
      newGroupId,
      reorderedLists,
    });

    if (
      isNaN(movedListId) ||
      isNaN(newGroupId) ||
      reorderedLists.some((l) => isNaN(l.id) || isNaN(l.position))
    ) {
      throw new BadRequestException(
        "Invalid list move/reorder payload: contains NaN"
      );
    }

    return this.listsService.moveAndReorderList(
      movedListId,
      newGroupId,
      reorderedLists
    );
  }

  @Put("reorder-list")
  reorderInGroup(
    @Body() body: { groupId: number; lists: { id: number; position: number }[] }
  ) {
    const groupId = Number(body.groupId);
    const reorderedLists = body.lists.map((l) => ({
      id: Number(l.id),
      position: Number(l.position),
    }));

    console.log("📥 Backend list reorder (PUT /reorder-list):", {
      groupId,
      reorderedLists,
    });

    if (
      isNaN(groupId) ||
      reorderedLists.some((l) => isNaN(l.id) || isNaN(l.position))
    ) {
      throw new BadRequestException("Invalid list reorder payload");
    }

    return this.listsService.reorderListsInGroup(groupId, reorderedLists);
  }

  @Post()
  create(@Body() body: { groupId: number; name: string }) {
    return this.listsService.createList(body.groupId, body.name);
  }

  @Get()
  getAllLists() {
    return this.listsService.getAllLists();
  }

  @Get("group/:groupId")
  getByGroup(@Param("groupId") groupId: string) {
    return this.listsService.getById(+groupId);
  }

  @Get("by-name/:slug")
  getByName(@Param("slug") slug: string) {
    return this.listsService.getByName(slug);
  }

  @Get(":id/completed-items")
  getCompletedItems(@Param("id") id: string) {
    return this.listItemsService.getCompletedItemsForList(+id);
  }

  @Put(":id")
  updateName(@Param("id") id: string, @Body() body: { name: string }) {
    return this.listsService.updateListName(+id, body.name);
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.listsService.deleteList(+id);
  }

  @Get(":id/items")
  getItemsForList(@Param("id") id: string) {
    return this.listsService.getItemsForList(+id);
  }

  @Get(":id/default-category")
  getDefaultCategory(@Param("id") id: string) {
    return this.listsService.getDefaultCategoryForList(+id);
  }

  @Get(":id/categories")
  getCategories(@Param("id") id: string) {
    return this.listsService.getCategoriesForList(+id);
  }

  @Get(":id")
  getById(@Param("id") id: string) {
    return this.listsService.getById(+id);
  }

  @Post(":id/categories")
  async addCategory(@Param("id") id: string, @Body() body: { name: string }) {
    return this.listsService.addCategoryToList(+id, body.name);
  }

  @Put(":id/categories/reorder")
  async reorderCategories(
    @Param("id") listId: string,
    @Body() body: { categories: { id: number; position: number }[] }
  ) {
    const parsedId = Number(listId);
    if (isNaN(parsedId)) {
      throw new BadRequestException("Invalid list ID");
    }

    if (!body.categories || !Array.isArray(body.categories)) {
      throw new BadRequestException("Invalid categories payload");
    }

    return this.listsService.reorderCategories(parsedId, body.categories);
  }

  @Delete(":id/categories/id/:categoryId")
  async deleteCategoryById(
    @Param("id") listId: string,
    @Param("categoryId") categoryId: string
  ) {
    return this.listsService.deleteCategoryById(+listId, +categoryId);
  }

  @Put(":listId/categories/:categoryId")
  updateCategoryName(
    @Param("listId") listId: string,
    @Param("categoryId") categoryId: string,
    @Body() body: { name: string }
  ) {
    return this.listsService.updateCategoryName(
      +listId,
      +categoryId,
      body.name
    );
  }
}
