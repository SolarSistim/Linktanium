import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Tag } from './tag.entity';
import { Link } from 'src/links/link.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagRepo: Repository<Tag>,
    @InjectRepository(Link)
    private linkRepo: Repository<Link>,
  ) {}

  create(tagData: Partial<Tag>) {
    const tag = this.tagRepo.create(tagData);
    return this.tagRepo.save(tag);
  }

  async findAllWithCounts(search?: string) {
    const qb = this.tagRepo
      .createQueryBuilder('tag')
      .leftJoin('tag.links', 'link')
      .loadRelationCountAndMap('tag.linkCount', 'tag.links');
  
    if (search) {
      qb.where('LOWER(tag.name) LIKE :search', { search: `%${search.toLowerCase()}%` });
    }
  
    const tags = await qb.getMany();
  
    return tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      linkCount: (tag as any).linkCount ?? 0,
    }));
  }

  findOne(id: number) {
    return this.tagRepo.findOneBy({ id });
  }

  async update(id: number, data: Partial<Tag>) {
    const tag = await this.tagRepo.findOneBy({ id });
    if (!tag) throw new NotFoundException('Tag not found');
    Object.assign(tag, data);
    return this.tagRepo.save(tag);
  }

  async remove(id: number) {
    const tag = await this.tagRepo.findOne({ where: { id } });
    if (!tag) throw new NotFoundException('Tag not found');
  
    await this.tagRepo.manager.transaction(async (manager) => {
      const linkRepo = manager.getRepository(Link);
      const tagRepo = manager.getRepository(Tag);
  
      // Load all links that reference this tag
      const linksWithTag = await linkRepo
        .createQueryBuilder('link')
        .leftJoinAndSelect('link.tags', 'tag')
        .where('tag.id = :id', { id })
        .getMany();
  
      // Remove the tag from each link and save
      for (const link of linksWithTag) {
        link.tags = link.tags.filter(t => t.id !== id);
        await linkRepo.save(link);
      }
  
      // Now delete the tag safely
      await tagRepo.remove(tag);
    });
  
    return { message: `Tag ${id} removed.` };
  }
  
  async findLinksByTag(id: number): Promise<Link[]> {
    const tag = await this.tagRepo.findOne({
      where: { id },
      relations: ['links', 'links.tags', 'links.group'],
    });
  
    if (!tag) throw new NotFoundException(`Tag with id ${id} not found`);
  
    return tag.links;
  }
  
}
