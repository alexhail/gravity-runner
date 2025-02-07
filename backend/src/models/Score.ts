import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('scores')
export class Score {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  score!: number;

  @Column()
  gameTime!: number;

  @Column()
  collectibles!: number;

  @Column()
  distance!: number;

  @CreateDateColumn()
  createdAt!: Date;
} 