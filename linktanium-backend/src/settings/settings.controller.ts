import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Req
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { Request } from 'express';
import { SettingsService } from './settings.service';
import { ConfigService } from '@nestjs/config';

@Controller('settings')
export class SettingsController {

  constructor(
    private readonly settingsService: SettingsService,
    private readonly configService: ConfigService
  ) {}

  @Get()
  async getSettings(@Query('key') key?: string) {
    return key
      ? this.settingsService.findByKey(key)
      : this.settingsService.findAll();
  }

  @Post()
  async updateSettingByQuery(
    @Query('key') key: string,
    @Query('value') value: string
  ) {
    return this.settingsService.upsertSetting(key, value);
  }

  @Post('upload-image')
@UseInterceptors(FileInterceptor('file'))
async uploadImage(
  @UploadedFile() file: Express.Multer.File,
  @Req() req: Request
) {
  const key = req.body.key;
  const allowedKeys = ['FAVICON_IMAGE', 'LOGO_IMAGE', 'GLOBAL_BACKGROUND_IMAGE'];

  if (!file || !key || !allowedKeys.includes(key)) {
    throw new BadRequestException('Missing or invalid file key');
  }

  const targetDir = this.settingsService.resolveUploadPath(key);
  const ext = path.extname(file.originalname).toLowerCase();

  const sanitizedFilename = path
    .basename(file.originalname, ext)
    .replace(/[^a-z0-9_-]/gi, '_')
    .toLowerCase() + ext;

  let filename = '';

  if (key === 'FAVICON_IMAGE') {
    filename = 'favicon.png';
  } else if (key === 'LOGO_IMAGE') {
    filename = 'logo.png';
  } else if (key === 'GLOBAL_BACKGROUND_IMAGE') {
    if (!['.png', '.jpg', '.jpeg', '.gif'].includes(ext)) {
      throw new BadRequestException('Invalid file type');
    }

    console.log('🗂️ Existing files before cleanup:', fs.readdirSync(targetDir));
    for (const file of fs.readdirSync(targetDir)) {
      if (file.startsWith('background.')) {
        console.log(`🗑️ Deleting old background image: ${file}`);
        fs.unlinkSync(path.join(targetDir, file));
      }
    }
    console.log('✅ Files after cleanup:', fs.readdirSync(targetDir));
    filename = sanitizedFilename;
  }

  const finalPath = path.join(targetDir, filename);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(finalPath, file.buffer);

  console.log('📥 Uploaded file:', file.originalname);
  console.log('💾 Saved as:', filename);
  console.log('📂 Final directory contents:', fs.readdirSync(targetDir));

  return this.settingsService.upsertSetting(key, filename);
}



}
