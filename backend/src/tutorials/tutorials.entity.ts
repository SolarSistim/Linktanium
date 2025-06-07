import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('tutorials')
export class Tutorial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  feature: string;

  @Column({ default: true })
  display: boolean;
}
