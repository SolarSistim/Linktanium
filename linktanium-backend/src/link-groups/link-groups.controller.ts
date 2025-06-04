import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { LinkGroupsService } from './link-groups.service';
import { LinkGroup } from './link-groups.entity';

@Controller('link-groups')
export class LinkGroupsController {
  constructor(private readonly linkGroupsService: LinkGroupsService) {}

  @Post('reorder')
async reorderGroups(
  @Body('categoryId') categoryId: number,
  @Body('groups') groups: { id: number; position: number }[],
) {
  return this.linkGroupsService.reorderGroups(categoryId, groups);
}

  @Post()
  create(@Body() group: { name: string; categoryId: number }) {
    return this.linkGroupsService.create(group);
  }

  @Get()
  findAll(): Promise<LinkGroup[]> {
    return this.linkGroupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.linkGroupsService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() data: Partial<LinkGroup>) {
    return this.linkGroupsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.linkGroupsService.remove(id);
  }
}
