import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { List } from './list.entity';
import { ListItemCategory } from './list-item-category.entity';

export type ListItemPriority = 'High' | 'Medium' | 'Low'; // ✅ Optional: Type alias

@Entity()
export class ListItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  get name(): string {
    return this.title;
  }

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'varchar',
    default: 'Medium',
  })
  priority: ListItemPriority;

  @ManyToOne(() => List, list => list.listItems, { onDelete: 'CASCADE' })
  list: List;

  @ManyToOne(() => ListItemCategory, { nullable: true, onDelete: 'SET NULL' })
  category: ListItemCategory | null;

  @Column({ default: 0 })
  position: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  pinned: boolean;

  @Column({ default: false })
  completed: boolean;
}