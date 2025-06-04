// src/settings/settings.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './settings.entity';
import * as path from 'path';
import * as fs from 'fs';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()

export class SettingsService {

  constructor(
    private configService: ConfigService,
    @InjectRepository(Setting)
    private settingRepo: Repository<Setting>,
  ) {}

  private getBrandingDir(): string {
  return path.join(process.cwd(), this.configService.get<string>('BRANDING_PATH')!);
}

  getTempUploadDir(): string {
  const tempPath = path.join(process.cwd(), this.configService.get<string>('TEMP_UPLOAD_PATH')!);
  fs.mkdirSync(tempPath, { recursive: true });
  return tempPath;
}

  async findAll(): Promise<Setting[]> {
    return this.settingRepo.find();
  }

  async findByKey(key: string): Promise<Setting | null> {
    return this.settingRepo.findOne({ where: { key } });
  }

  async upsertSetting(key: string, value: string): Promise<Setting> {
    const existing = await this.settingRepo.findOne({ where: { key } });
    if (existing) {
      existing.value = value;
      return this.settingRepo.save(existing);
    } else {
      const setting = this.settingRepo.create({ key, value });
      return this.settingRepo.save(setting);
    }
  }

  resolveUploadPath(key: string): string {

    if (key === 'GLOBAL_BACKGROUND_IMAGE') {
      const backgroundPath = this.configService.get<string>('BACKGROUND_PATH');
      if (!backgroundPath) throw new BadRequestException('BACKGROUND_PATH not set');
      const fullPath = path.join(process.cwd(), backgroundPath);
      fs.mkdirSync(fullPath, { recursive: true });
      return fullPath;
    }

    let subfolder = '';
    if (key === 'FAVICON_IMAGE') subfolder = 'favicon';
    else if (key === 'LOGO_IMAGE') subfolder = 'logo';

    else if (key === 'GLOBAL_BACKGROUND_IMAGE') {
      const backgroundPath = this.configService.get<string>('BACKGROUND_PATH');
      if (!backgroundPath) throw new BadRequestException('BACKGROUND_PATH not set');
      const fullPath = path.join(process.cwd(), backgroundPath);
      fs.mkdirSync(fullPath, { recursive: true });
      return fullPath;
    }

    else throw new BadRequestException('Unsupported setting key for upload');
  
    const fullPath = path.join(this.getBrandingDir(), subfolder);
    fs.mkdirSync(fullPath, { recursive: true });
    return fullPath;
  }

  async updateImageSetting(key: 'FAVICON_IMAGE' | 'LOGO_IMAGE', newFilename: string): Promise<Setting> {
    const setting = await this.settingRepo.findOne({ where: { key } });
  
    if (setting && setting.value && setting.value !== newFilename) {
      const oldPath = path.join(this.resolveUploadPath(key), setting.value);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
      setting.value = newFilename;
      return this.settingRepo.save(setting);
    }
  
    return this.upsertSetting(key, newFilename);
  }
  
}
