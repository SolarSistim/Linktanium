import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { Link } from '../links/link.entity';
import { LinkCategory } from 'src/link-categories/link-categories.entity';
import { List } from 'src/lists/list.entity';

@Entity('link_groups')
export class LinkGroup {

  @OneToMany(() => List, list => list.group, {
  cascade: true,
  eager: false,
  })
  lists: List[];

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => LinkCategory, category => category.groups, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  category: LinkCategory;

  @OneToMany(() => Link, link => link.group, {
    cascade: true,
    eager: false
  })
  links: Link[];

  @Column({ default: 0 })
  position: number;
}
