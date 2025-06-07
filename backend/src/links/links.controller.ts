import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { LinksService } from './links.service';
import { Link } from './link.entity';

@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Put('move-and-reorder')
  async moveAndReorder(
    @Body() payload: { 
      movedLinkId: number,
      newGroupId: number,
      reorderedLinks: { id: number, position: number }[]
    }
  ) {
    return this.linksService.moveAndReorder(payload.movedLinkId, payload.newGroupId, payload.reorderedLinks);
  }

  @Post()
  create(@Body() link: any) {
    return this.linksService.create(link);
  }  

  @Get()
  findAll(
    @Query('tag') tagId?: number,
    @Query('search') search?: string,
  ) {
    return this.linksService.findAll({ tagId, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.linksService.findOne(+id);
  }

  @Put('reorder')
  reorder(@Body() links: { id: number, position: number }[]) {
    return this.linksService.reorder(links);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.linksService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.linksService.remove(+id);
  }
}
