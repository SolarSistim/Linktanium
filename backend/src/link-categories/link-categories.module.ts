import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinkCategory } from './link-categories.entity';
import { LinkCategoryService } from './link-categories.service';
import { LinkCategoryController } from './link-categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LinkCategory])],
  providers: [LinkCategoryService],
  controllers: [LinkCategoryController],
  exports: [TypeOrmModule],
})
export class LinkCategoryModule {}
