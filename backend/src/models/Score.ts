import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('scores')
export class Score {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  userId?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ nullable: true })
  guestUsername?: string;

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