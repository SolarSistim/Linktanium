import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import { Tag } from '../tags/tag.entity';
import { LinkGroup } from 'src/link-groups/link-groups.entity';

@Entity()
export class Link {
  
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column({ nullable: true })
icon: string;

  @ManyToMany(() => Tag, tag => tag.links, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE'
  })
  @JoinTable()
  tags: Tag[];

  @ManyToOne(() => LinkGroup, group => group.links, {
    onDelete: 'CASCADE',
  })
  group: LinkGroup;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 0 })
  position: number;

}
