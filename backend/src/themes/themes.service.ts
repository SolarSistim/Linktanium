import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Theme } from "./themes.entity";
import * as path from "path";
import * as fs from "fs";
import { BackgroundImage } from "./background-image.entity";
import { NotFoundException } from "@nestjs/common";
import {
  ConflictException,
  InternalServerErrorException,
} from "@nestjs/common";

@Injectable()
export class ThemesService {
  constructor(
    @InjectRepository(Theme) private themeRepo: Repository<Theme>,
    @InjectRepository(BackgroundImage)
    private bgImageRepo: Repository<BackgroundImage>
  ) {}

  findAll(): Promise<Theme[]> {
    return this.themeRepo.find();
  }

  findByName(name: string): Promise<Theme | null> {
    return this.themeRepo.findOne({ where: { name } });
  }

  async saveTheme(name: string, data: any): Promise<Theme> {
    let theme = await this.findByName(name);
    const stringified = JSON.stringify(data);

    if (theme) {
      theme.data = stringified;
    } else {
      theme = this.themeRepo.create({ name, data: stringified });
    }
    return this.themeRepo.save(theme);
  }

  async deleteByName(name: string): Promise<void> {
    await this.themeRepo.delete({ name });
  }

  async uploadImage(
    file: Express.Multer.File
  ): Promise<{ message: string; filename: string }> {
    const imageDir = this.getBackgroundImageDir();
    const targetPath = path.join(imageDir, file.originalname);

    if (fs.existsSync(targetPath)) {
      console.log(`⚠️ Skipping duplicate: ${file.originalname}`);
      return {
        message: "File already exists, skipping.",
        filename: file.originalname,
      };
    }

    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }

    fs.writeFileSync(targetPath, file.buffer);

    const newImage = this.bgImageRepo.create({
      filename: file.originalname,
      uploadedAt: new Date(),
    });

    try {
      await this.bgImageRepo.save(newImage);
    } catch (err) {
      if (err.code === "SQLITE_CONSTRAINT") {
        console.warn(`🟡 DB entry already exists for: ${file.originalname}`);
      } else {
        throw err;
      }
    }
    console.log(`✅ Image saved: ${file.originalname}`);

    return {
      message: "File uploaded successfully",
      filename: file.originalname,
    };
  }

  async listImages(): Promise<BackgroundImage[]> {
    const images = await this.bgImageRepo.find({
      order: {
        uploadedAt: "DESC",
      },
    });
    console.log("🔍 listImages DB result:", images);
    return images;
  }

  private getBackgroundImageDir(): string {
    const backgroundPath = process.env.BACKGROUND_PATH;

    console.log("🌍 NODE_ENV:", process.env.NODE_ENV);
    console.log("📂 BACKGROUND_PATH:", backgroundPath);

    if (!backgroundPath) {
      throw new Error("BACKGROUND_PATH is not defined in .env");
    }

    return path.join(process.cwd(), backgroundPath);
  }

  async deleteImage(filename: string): Promise<{ message: string }> {
    const imageDir = this.getBackgroundImageDir();
    const targetPath = path.join(imageDir, filename);

    const record = await this.bgImageRepo.findOne({ where: { filename } });
    if (!record) {
      throw new NotFoundException("Image record not found in DB");
    }

    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }

    await this.bgImageRepo.remove(record);
    return { message: `Deleted ${filename}` };
  }

  async createBackgroundImage(
    file: Express.Multer.File
  ): Promise<BackgroundImage> {
    const filename = file.originalname;
    const uploadedAt = new Date();

    const image = this.bgImageRepo.create({ filename, uploadedAt });

    try {
      return await this.bgImageRepo.save(image);
    } catch (err) {
      if (err.code === "SQLITE_CONSTRAINT") {
        throw new ConflictException(
          "An image with that filename already exists."
        );
      }
      throw new InternalServerErrorException(
        "Failed to save background image."
      );
    }
  }
}
