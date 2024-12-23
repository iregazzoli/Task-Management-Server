import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  status: string;
}
