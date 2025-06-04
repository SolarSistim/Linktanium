// src/lists/list-items.controller.ts
import {
  Controller,
  Post,
  Put,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { ListItemsService } from './list-items.service';
import { BadRequestException } from '@nestjs/common';
import { Get } from '@nestjs/common';

@Controller('items')
export class ListItemsController {


  constructor(private readonly itemsService: ListItemsService) {}

@Post()
  create(
    @Body()
    body: {
      listId: number;
      categoryId: number;
      title: string;
      description: string;
      priority?: 'High' | 'Medium' | 'Low'; // ✅ optional in case it's not provided
    },
  ) {
    return this.itemsService.addItem(
      body.listId,
      body.categoryId,
      body.title,
      body.description,
      body.priority || 'Medium', // ✅ default if missing
    );
  }

  @Post('complete/:id')
  complete(@Param('id') id: string) {
    return this.itemsService.completeItem(+id);
  }

  @Post('uncomplete/:id')
  uncomplete(@Param('id') id: string) {
    return this.itemsService.uncompleteItem(+id);
  }

  @Put('move')
  moveCategory(
    @Body() body: { itemId: number; newCategoryId: number },
  ) {
    return this.itemsService.moveItemToCategory(body.itemId, body.newCategoryId);
  }

  @Delete(':id')
    delete(@Param('id') id: string) {
      return this.itemsService.deleteItem(+id);
    }

@Put('reorder')
async reorderItems(
  @Body() body: { items: { id: number; position: number; categoryId: number | null; pinned: boolean }[] }
) {
  if (!body.items || body.items.length === 0) {
    throw new BadRequestException('No items to reorder provided.');
  }

  const firstItemId = body.items[0].id;
  const firstItem = await this.itemsService.getItemWithList(firstItemId);

  if (!firstItem || !firstItem.list || !firstItem.list.id) {
    throw new BadRequestException('Could not determine the list ID for the items.');
  }

  const listId = firstItem.list.id;

  return this.itemsService.reorderWithCategoryAndPin(listId, body.items);
}

    
    @Put(':id')
updateItem(@Param('id') id: string, @Body() body: {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  categoryId: number | null;
  pinned: boolean;
}) {
  return this.itemsService.updateItem(+id, body);
}

      @Put(':id/pin')
      togglePinned(@Param('id') id: string, @Body() body: { pinned: boolean }) {
        return this.itemsService.togglePinned(+id, body.pinned);
      }

      @Get()
      getAllItems() {
        return this.itemsService.getAllItems();
      }

}
