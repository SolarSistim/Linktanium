import { Express } from "express";
import { BadRequestException } from "@nestjs/common";
import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { IconService } from "./icons.service";
import { Icon } from "./icons.entity";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("icons")
export class IconController {
  constructor(private readonly service: IconService) {}

  @Get()
  findAll(): Promise<Icon[]> {
    return this.service.findAll();
  }

  @Post()
  @UseInterceptors(FileInterceptor("file"))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() data: Partial<Icon>
  ) {
    return this.service.create(data, file);
  }

  @Put(":id")
  update(@Param("id") id: number, @Body() data: Partial<Icon>) {
    return this.service.update(+id, data);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    const parsedId = Number(id);
    if (isNaN(parsedId)) {
      throw new BadRequestException("Invalid icon ID");
    }
    return this.service.remove(parsedId);
  }
}
