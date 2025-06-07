import { Controller, Post, Body, Get, Param, Put, Delete, Query } from '@nestjs/common';
import { TagsService } from './tags.service';
import { Tag } from './tag.entity';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  create(@Body() tag: Partial<Tag>) {
    return this.tagsService.create(tag);
  }

  @Get()
  findAll(@Query('search') search?: string) {
    return this.tagsService.findAllWithCounts(search);
  }

  @Get(':id/links')
  findLinksByTag(@Param('id') id: number) {
    return this.tagsService.findLinksByTag(id);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.tagsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() data: Partial<Tag>) {
    return this.tagsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.tagsService.remove(id);
  }
}
