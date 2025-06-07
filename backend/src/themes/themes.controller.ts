import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ThemesService } from "./themes.service";

@Controller("themes")
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {
    console.log("🔥 ThemesController loaded");
  }

  @Get()
  findAll() {
    return this.themesService.findAll();
  }

  @Get("list-images")
  async listImages() {
    console.log("📨 /themes/list-images hit");
    const images = await this.themesService.listImages();
    return { images };
  }

  @Get(":name")
  findByName(@Param("name") name: string) {
    return this.themesService.findByName(name);
  }

  @Post()
  saveTheme(@Body() body: { name: string; data: any }) {
    return this.themesService.saveTheme(body.name, body.data);
  }

  @Delete(":name")
  deleteTheme(@Param("name") name: string) {
    return this.themesService.deleteByName(name);
  }

  @Post("upload-image")
  @UseInterceptors(FileInterceptor("file"))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    console.log("📸 upload-image hit:", file?.originalname);
    return this.themesService.uploadImage(file);
  }

  @Get("test")
  testRoute() {
    console.log("🧪 /themes/test hit");
    return { ok: true };
  }

  @Delete("delete-image/:filename")
  async deleteImage(@Param("filename") filename: string) {
    return this.themesService.deleteImage(filename);
  }
}
