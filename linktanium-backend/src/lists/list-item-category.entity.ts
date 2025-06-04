// src/lists/list-item-category.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { List } from './list.entity';

@Entity()
export class ListItemCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'int', default: 0 })
  position: number;

  @ManyToOne(() => List, list => list.categories, {
    onDelete: 'CASCADE',
    eager: false,
  })
  list: List;
}
