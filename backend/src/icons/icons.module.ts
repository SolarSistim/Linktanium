import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Icon } from "./icons.entity";
import { IconService } from "./icons.service";
import { IconController } from "./icons.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Icon])],
  providers: [IconService],
  controllers: [IconController],
})
export class IconModule {}
