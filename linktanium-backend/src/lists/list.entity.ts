import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  Index
} from 'typeorm';
import { LinkGroup } from '../link-groups/link-groups.entity';
import { ListItem } from './list-item.entity';
import { ListItemCategory } from './list-item-category.entity';

@Entity()
@Index(['name', 'group'], { unique: true })
export class List {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  icon: string;

  @ManyToOne(() => LinkGroup, group => group.lists, { onDelete: 'CASCADE' })
  group: LinkGroup;

  @OneToMany(() => ListItem, item => item.list, { cascade: true })
  listItems: ListItem[];

  @OneToMany(() => ListItemCategory, category => category.list, { cascade: true })
  categories: ListItemCategory[];

  @Column({ default: 0 })
  position: number;

  @CreateDateColumn()
  createdAt: Date;
}
