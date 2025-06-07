import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TutorialsService } from './tutorials.service';
import { TutorialsController } from './tutorials.controller';
import { Tutorial } from './tutorials.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tutorial])],
  controllers: [TutorialsController],
  providers: [TutorialsService],
})
export class TutorialsModule {}
