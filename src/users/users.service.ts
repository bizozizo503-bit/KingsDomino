import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findByUsernameWithPassword(username: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password_hash')
      .where('user.username = :username', { username })
      .getOne();
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByIdOrFail(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }
    return user;
  }

  async create(data: {
    username: string;
    email?: string;
    password_hash: string;
    display_name?: string;
  }): Promise<User> {
    const existing = await this.findByUsername(data.username);
    if (existing) {
      throw new ConflictException('اسم المستخدم مستخدم بالفعل');
    }

    const user = this.usersRepository.create({
      ...data,
      display_name: data.display_name || data.username,
    });
    return this.usersRepository.save(user);
  }

  async updateProfile(
    userId: string,
    data: { display_name?: string },
  ): Promise<User> {
    const user = await this.findByIdOrFail(userId);
    if (data.display_name) {
      user.display_name = data.display_name;
    }
    return this.usersRepository.save(user);
  }
}
