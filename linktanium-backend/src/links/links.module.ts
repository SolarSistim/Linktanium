import { Module } from '@nestjs/common';
import { LinksService } from './links.service';
import { LinksController } from './links.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Link } from './link.entity';
import { Tag } from 'src/tags/tag.entity';
import { LinkGroup } from 'src/link-groups/link-groups.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Link, Tag, LinkGroup])],
  providers: [LinksService],
  controllers: [LinksController],
})
export class LinksModule {}
