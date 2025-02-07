import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ nullable: true })
  displayName?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column('json', { default: '{}' })
  preferences!: {
    musicVolume?: number;
    sfxVolume?: number;
    theme?: string;
  };

  @Column('json', { default: '[]' })
  achievements!: string[];

  @Column('json', { default: '{}' })
  stats!: {
    totalGamesPlayed: number;
    totalPlayTime: number;
    totalScore: number;
    bestDistance: number;
    totalCollectibles: number;
  };

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 