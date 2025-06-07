import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Link } from '../links/link.entity';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Link, link => link.tags)
  links: Link[];
}
