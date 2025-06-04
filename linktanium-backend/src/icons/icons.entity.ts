import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("icons")
export class Icon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  filename: string;

  @Column({ nullable: true })
  description: string;
}
