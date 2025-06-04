// src/lists/lists.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { List } from "./list.entity";
import { ListItem } from "./list-item.entity";
import { ListItemCategory } from "./list-item-category.entity";
import { CompletedListItem } from "./completed-list-item.entity";
import { ListsService } from "./lists.service";
import { ListItemsService } from "./list-items.service";
import { ListsController } from "./lists.controller";
import { ListItemsController } from "./list-items.controller";
import { LinkGroup } from "../link-groups/link-groups.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      List,
      ListItem,
      ListItemCategory,
      CompletedListItem,
      LinkGroup,
    ]),
  ],
  providers: [ListsService, ListItemsService],
  controllers: [ListsController, ListItemsController],
})
export class ListsModule {}
