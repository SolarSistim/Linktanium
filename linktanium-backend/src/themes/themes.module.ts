import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThemesService } from './themes.service';
import { ThemesController } from './themes.controller';
import { Theme } from './themes.entity';
import { BackgroundImage } from './background-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Theme, BackgroundImage])],
  providers: [ThemesService],
  controllers: [ThemesController]
})
export class ThemesModule {}
