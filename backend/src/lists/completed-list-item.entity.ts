import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { List } from './list.entity';
import { ListItemCategory } from './list-item-category.entity';
import { ListItemPriority } from './list-item.entity';

@Entity()
export class CompletedListItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'varchar',
    default: 'Medium',
  })
  priority: ListItemPriority;

  @ManyToOne(() => List, { onDelete: 'CASCADE' })
  list: List;

  @ManyToOne(() => ListItemCategory, { nullable: true, onDelete: 'SET NULL' })
  category: ListItemCategory | null;

  @Column()
  originalPosition: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'datetime' })
completedAt: Date;
}
