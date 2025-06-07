import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ImportExportController } from "./import-export.controller";
import { Link } from "src/links/link.entity";
import { LinkCategory } from "src/link-categories/link-categories.entity";
import { LinkGroup } from "src/link-groups/link-groups.entity";
import { Theme } from "src/themes/themes.entity";
import { BackgroundImage } from "src/themes/background-image.entity";
import { List } from "src/lists/list.entity";
import { ListItem } from "src/lists/list-item.entity";
import { ListItemCategory } from "src/lists/list-item-category.entity";
import { Icon } from "src/icons/icons.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Link,
      LinkCategory,
      LinkGroup,
      Theme,
      BackgroundImage,
      List,
      ListItem,
      ListItemCategory,
      Icon,
    ]),
  ],
  controllers: [ImportExportController],
})
export class ImportExportModule {}
