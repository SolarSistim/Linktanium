import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('background_images')
export class BackgroundImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  filename: string;

  @Column()
  uploadedAt: Date;
}