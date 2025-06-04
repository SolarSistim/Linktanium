import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinkGroup } from './link-groups.entity';
import { LinkGroupsService } from './link-groups.service';
import { LinkGroupsController } from './link-groups.controller';
import { LinkCategory } from 'src/link-categories/link-categories.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LinkGroup, LinkCategory])],
  providers: [LinkGroupsService],
  controllers: [LinkGroupsController],
})
export class LinkGroupsModule {}
