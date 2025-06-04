import {
  Controller,
  Get,
  Res,
  HttpException,
  HttpStatus,
  Post,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { Response } from "express";
import * as unzipper from "unzipper";
import * as archiver from "archiver";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { FileInterceptor } from "@nestjs/platform-express";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Link } from "src/links/link.entity";
import { LinkCategory } from "src/link-categories/link-categories.entity";
import { LinkGroup } from "src/link-groups/link-groups.entity";
import { BackgroundImage } from "src/themes/background-image.entity";
import { Theme } from "src/themes/themes.entity";
import { parse as json2csv } from "json2csv";
import { parse } from "csv-parse/sync";
import { diskStorage } from "multer";
import { List } from "src/lists/list.entity";
import { ListItem } from "src/lists/list-item.entity";
import { ListItemCategory } from "src/lists/list-item-category.entity";
import { Icon } from "src/icons/icons.entity";

@Controller()
export class ImportExportController {
  constructor(
    @InjectRepository(Link) private linkRepo: Repository<Link>,
    @InjectRepository(LinkCategory)
    private categoryRepo: Repository<LinkCategory>,
    @InjectRepository(LinkGroup) private groupRepo: Repository<LinkGroup>,
    @InjectRepository(Theme) private themeRepo: Repository<Theme>,
    @InjectRepository(BackgroundImage)
    private bgImageRepo: Repository<BackgroundImage>,
    @InjectRepository(List) private listRepo: Repository<List>,
    @InjectRepository(ListItem) private listItemRepo: Repository<ListItem>,
    @InjectRepository(ListItemCategory)
    private listItemCategoryRepo: Repository<ListItemCategory>,
    @InjectRepository(Icon) private iconRepo: Repository<Icon>
  ) {}

  private readonly DB_PATH = path.join(process.cwd(), "quickdash.db");
  private readonly EXPORT_DIRS = [
    {
      name: "branding/favicon",
      path: path.resolve(
        process.cwd(),
        "../quickdash-frontend/public/assets/branding/favicon"
      ),
    },
    {
      name: "branding/logo",
      path: path.resolve(
        process.cwd(),
        "../quickdash-frontend/public/assets/branding/logo"
      ),
    },
    {
      name: "icons",
      path: path.resolve(
        process.cwd(),
        "../quickdash-frontend/public/assets/icons"
      ),
    },
    {
      name: "theme/background",
      path: path.resolve(
        process.cwd(),
        "../quickdash-frontend/public/assets/theme/background"
      ),
    },
  ];

  @Get("/export-full-backup")
  async export(@Res() res: Response) {
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("error", (err) => {
      console.error("❌ Archive error:", err);
      throw new HttpException(
        "Failed to create archive",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    });

    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": "attachment; filename=quickdash-backup.zip",
    });

    archive.pipe(res);

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "quickdash-export-"));

    const linkData = await this.linkRepo.find({ relations: ["group", "tags"] });
    const linkCategoryData = await this.categoryRepo.find();
    const linkGroupData = await this.groupRepo.find({
      relations: ["category"],
    });
    const themeData = await this.themeRepo.find();
    const bgImageData = await this.bgImageRepo.find();
    const listData = await this.listRepo.find({ relations: ["group"] });
    const listItemData = await this.listItemRepo.find({
      relations: ["list", "category"],
    });
    const listItemCategoryData = await this.listItemCategoryRepo.find({
      relations: ["list"],
    });
    const iconData = await this.iconRepo.find();

    const tables = [
      {
        name: "link",
        data: linkData.map(
          ({ id, name, url, icon, description, position, group, tags }) => ({
            id,
            name,
            url,
            icon,
            description,
            position,
            groupId: group?.id ?? null,
            tags: JSON.stringify(
              tags.map((tag) => ({ id: tag.id, name: tag.name }))
            ),
          })
        ),
      },
      { name: "link_category", data: linkCategoryData },
      {
        name: "link_group",
        data: linkGroupData.map(({ id, name, position, category }) => ({
          id,
          name,
          position,
          categoryId: category?.id ?? null,
        })),
      },
      { name: "themes", data: themeData },
      { name: "background_images", data: bgImageData },
      {
        name: "list",
        data: listData.map(({ id, name, icon, position, group }) => ({
          id,
          name,
          icon,
          position,
          groupId: group?.id ?? null,
        })),
      },
      {
        name: "list_item",
        data: listItemData.map(
          ({
            id,
            name,
            description,
            priority,
            position,
            pinned,
            completed,
            list,
            category,
          }) => ({
            id,
            name,
            description,
            priority,
            position,
            pinned,
            completed,
            listId: list?.id ?? null,
            categoryId: category?.id ?? null,
          })
        ),
      },
      {
        name: "list_item_category",
        data: listItemCategoryData.map(({ id, name, position, list }) => ({
          id,
          name,
          position,
          listId: list?.id ?? null,
        })),
      },
      { name: "icons", data: iconData },
    ];

    for (const table of tables) {
      try {
        const csv = json2csv(table.data, {
          fields: table.data.length > 0 ? Object.keys(table.data[0]) : ["id"], // fallback minimal header
        });

        const filePath = path.join(tempDir, `${table.name}.csv`);
        fs.writeFileSync(filePath, csv);
        archive.file(filePath, { name: `quickdash-backup/${table.name}.csv` });
      } catch (err) {
        console.error(`❌ Failed to export ${table.name}:`, err);
      }
    }

    for (const dir of this.EXPORT_DIRS) {
      if (fs.existsSync(dir.path)) {
        archive.directory(dir.path, `quickdash-backup/${dir.name}`);
      } else {
        console.warn(`⚠️ Missing asset directory: ${dir.path}`);
      }
    }

    await archive.finalize();

    setTimeout(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }, 5000);
  }

  @Post("/import-full-backup")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = path.join(process.cwd(), "temp-uploads");
          fs.mkdirSync(uploadDir, { recursive: true });
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          cb(null, "import.zip");
        },
      }),
    })
  )
  async import(@UploadedFile() file: Express.Multer.File) {
    if (!file?.path) {
      throw new HttpException(
        "No file uploaded or file path missing",
        HttpStatus.BAD_REQUEST
      );
    }

    const tempDir = path.join(process.cwd(), "temp-import");
    fs.rmSync(tempDir, { recursive: true, force: true });
    fs.mkdirSync(tempDir, { recursive: true });

    await fs
      .createReadStream(file.path)
      .pipe(unzipper.Extract({ path: tempDir }))
      .promise();

    const folder = path.join(tempDir, "quickdash-backup");

    await this.linkRepo.clear();
    await this.categoryRepo.clear();
    await this.groupRepo.clear();
    await this.themeRepo.clear();
    await this.bgImageRepo.clear();
    await this.listItemRepo.clear();
    await this.listItemCategoryRepo.clear();
    await this.listRepo.clear();
    await this.iconRepo.clear();

    const importCsv = (filePath: string) => {
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ Skipping missing file: ${filePath}`);
        return [];
      }

      const content = fs.readFileSync(filePath, "utf8");
      const records = parse(content, { columns: true, skip_empty_lines: true });

      return records.map((row) => {
        const transformed: Record<string, any> = {};
        for (const key in row) {
          const val = row[key];
          if (val === "" || val === "null") {
            transformed[key] = null;
          } else if (!isNaN(val) && val.trim() !== "") {
            transformed[key] = Number(val);
          } else {
            transformed[key] = val;
          }
        }
        return transformed;
      });
    };

    await this.categoryRepo.save(
      importCsv(path.join(folder, "link_category.csv"))
    );
    const groupRecords = importCsv(path.join(folder, "link_group.csv")).map(
      (row) => {
        const { categoryId, ...rest } = row;
        return {
          ...rest,
          category: categoryId ? { id: categoryId } : null,
        };
      }
    );
    await this.groupRepo.save(groupRecords);
    const linkRecords = importCsv(path.join(folder, "link.csv")).map((row) => {
      const { groupId, tags, ...rest } = row;
      const parsedTags = tags ? JSON.parse(tags) : [];
      return {
        ...rest,
        group: groupId ? { id: Number(groupId) } : null,
        tags: parsedTags,
      };
    });
    await this.linkRepo.save(linkRecords);
    await this.themeRepo.save(importCsv(path.join(folder, "themes.csv")));
    await this.bgImageRepo.save(
      importCsv(path.join(folder, "background_images.csv"))
    );

    const listRecords = importCsv(path.join(folder, "list.csv")).map((row) => {
      const { groupId, ...rest } = row;
      return {
        ...rest,
        group: groupId ? { id: Number(groupId) } : null,
      };
    });
    await this.listRepo.save(listRecords);

    const listItemCategoryRecords = importCsv(
      path.join(folder, "list_item_category.csv")
    ).map((row) => {
      const { listId, ...rest } = row;
      return {
        ...rest,
        list: listId ? { id: Number(listId) } : null,
      };
    });
    await this.listItemCategoryRepo.save(listItemCategoryRecords);

    const listItemRecords = importCsv(path.join(folder, "list_item.csv")).map(
      (row) => {
        const { name, listId, categoryId, ...rest } = row;

        return {
          title: name ?? null, // ✅ map 'name' → 'title'
          ...rest,
          list: listId ? { id: Number(listId) } : null,
          category: categoryId ? { id: Number(categoryId) } : null,
        };
      }
    );
    await this.listItemRepo.save(listItemRecords);
    await this.iconRepo.save(importCsv(path.join(folder, "icons.csv")));

    const copyDir = (src: string, dest: string) => {
      fs.rmSync(dest, { recursive: true, force: true });
      fs.mkdirSync(dest, { recursive: true });
      fs.cpSync(src, dest, { recursive: true });
    };

    copyDir(
      path.join(folder, "icons"),
      path.resolve(process.cwd(), "../quickdash-frontend/public/assets/icons")
    );
    copyDir(
      path.join(folder, "branding/favicon"),
      path.resolve(
        process.cwd(),
        "../quickdash-frontend/public/assets/branding/favicon"
      )
    );
    copyDir(
      path.join(folder, "branding/logo"),
      path.resolve(
        process.cwd(),
        "../quickdash-frontend/public/assets/branding/logo"
      )
    );
    copyDir(
      path.join(folder, "theme/background"),
      path.resolve(
        process.cwd(),
        "../quickdash-frontend/public/assets/theme/background"
      )
    );

    fs.rmSync(tempDir, { recursive: true, force: true });
    fs.unlinkSync(file.path);

    return { message: "Import completed successfully" };
  }
}
