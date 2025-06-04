import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('themes')
export class Theme {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column('text')
  data: string;
}