import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinksModule } from './links/links.module';
import { TagsModule } from './tags/tags.module';
import { LinkGroupsModule } from './link-groups/link-groups.module';
import { LinkCategoryModule } from './link-categories/link-categories.module';
import { SettingsModule } from './settings/settings.module';
import { IconModule } from './icons/icons.module';
import { ConfigModule } from '@nestjs/config';
import { ThemesModule } from './themes/themes.module';
import { ImportExportController } from './import-export/import-export.controller';
import { ImportExportModule } from './import-export/import-export.module';
import { TutorialsModule } from './tutorials/tutorials.module';
// Lists
import { ListsModule } from './lists/lists.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'linktanium.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SettingsModule,
    LinksModule,
    TagsModule,
    LinkGroupsModule,
    LinkCategoryModule,
    SettingsModule,
    IconModule,
    ThemesModule,
    ImportExportModule,
    TutorialsModule,
    ListsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
