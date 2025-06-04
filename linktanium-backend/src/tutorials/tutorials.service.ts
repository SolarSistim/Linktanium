import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tutorial } from './tutorials.entity';

@Injectable()
export class TutorialsService {
  constructor(
    @InjectRepository(Tutorial)
    private tutorialsRepo: Repository<Tutorial>,
  ) {}

  findAll(): Promise<Tutorial[]> {
    return this.tutorialsRepo.find();
  }

  findByFeature(feature: string): Promise<Tutorial | null> {
    return this.tutorialsRepo.findOne({ where: { feature } });
  }

  async updateDisplay(id: number, display: boolean): Promise<Tutorial> {
    const tutorial = await this.tutorialsRepo.findOne({ where: { id } });
    if (!tutorial) {
      throw new NotFoundException(`Tutorial with ID ${id} not found`);
    }

    tutorial.display = display;
    return this.tutorialsRepo.save(tutorial);
  }

  async updateAllDisplay(display: boolean): Promise<number> {
  const result = await this.tutorialsRepo
    .createQueryBuilder()
    .update(Tutorial)
    .set({ display })
    .execute();

  return result.affected || 0;
}

}
