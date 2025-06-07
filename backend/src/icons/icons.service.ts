import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Icon } from "./icons.entity";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class IconService {
  private iconDir = path.join(
    process.cwd(),
    process.env.ICON_PATH || "frontend/public/assets/icons"
  );

  constructor(
    @InjectRepository(Icon)
    private iconRepo: Repository<Icon>
  ) {}

  async findAll(): Promise<Icon[]> {
    return this.iconRepo.find();
  }

  async create(data: Partial<Icon>, file: Express.Multer.File): Promise<Icon> {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    const filename = file.originalname;
    const dest = path.join(this.iconDir, filename);

    if (fs.existsSync(dest)) {
      throw new BadRequestException(
        `An icon named "${filename}" already exists. Please rename your file.`
      );
    }

    fs.mkdirSync(this.iconDir, { recursive: true });

    fs.writeFileSync(dest, file.buffer);

    const icon = this.iconRepo.create({
      title: data.title,
      filename,
      description: data.description,
    });

    return this.iconRepo.save(icon);
  }

  async update(id: number, data: Partial<Icon>): Promise<Icon> {
    const icon = await this.iconRepo.findOneBy({ id });
    if (!icon) throw new NotFoundException("Icon not found");

    Object.assign(icon, data);
    return this.iconRepo.save(icon);
  }

  async remove(id: number): Promise<{ message: string }> {
    const icon = await this.iconRepo.findOneBy({ id });
    if (!icon) throw new NotFoundException("Icon not found");

    const filePath = path.join(this.iconDir, icon.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await this.iconRepo.remove(icon);

    return { message: "Icon deleted successfully" };
  }
}
