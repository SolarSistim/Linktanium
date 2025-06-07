import { Entity, PrimaryGeneratedColumn, Column, OneToMany  } from 'typeorm';
import { LinkGroup } from '../link-groups/link-groups.entity';

@Entity('link_categories')
export class LinkCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: 0 })
  position: number;

  @OneToMany(() => LinkGroup, group => group.category)
  groups: LinkGroup[];
}
