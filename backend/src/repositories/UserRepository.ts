import { Repository } from 'typeorm';
import { User } from '../models/User';
import { AppDataSource } from '../data-source';

export class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repository.createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.password',
        'user.lastLoginAt',
        'user.createdAt',
        'user.updatedAt'
      ])
      .where('user.username = :username', { username })
      .getOne();
  }

  async findById(id: number): Promise<User | null> {
    return this.repository.createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.password',
        'user.lastLoginAt',
        'user.createdAt',
        'user.updatedAt'
      ])
      .where('user.id = :id', { id })
      .getOne();
  }
} 