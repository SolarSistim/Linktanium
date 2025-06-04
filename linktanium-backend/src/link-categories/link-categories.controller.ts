import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { LinkCategoryService } from './link-categories.service';
import { LinkCategory } from './link-categories.entity';

@Controller('link-categories')
export class LinkCategoryController {
  constructor(private readonly service: LinkCategoryService) {}

  @Get('simple')
  findAllSimple() {
    return this.service.findAllSimple();
  }

  @Get(':id/full')
  findOneFull(@Param('id') id: number) {
    return this.service.findOneFull(+id);
  }


  @Post()
  create(@Body() data: Partial<LinkCategory>) {
    return this.service.create(data);
  }

  @Get()
  findAll(): Promise<LinkCategory[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(+id);
  }

  @Put('reorder')
  reorder(@Body() categories: { id: number, position: number }[]) {
    return this.service.reorder(categories);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() data: Partial<LinkCategory>) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
