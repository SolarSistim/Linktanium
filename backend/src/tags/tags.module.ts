import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { Tag } from './tag.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Link } from 'src/links/link.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tag, Link])
  ],
  providers: [TagsService],
  controllers: [TagsController]
})
export class TagsModule {}
