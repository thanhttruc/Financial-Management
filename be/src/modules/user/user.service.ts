import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Tìm user theo email
   * @param email Email của user
   * @returns User object hoặc null nếu không tìm thấy
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      select: ['userId', 'email', 'username', 'fullName', 'phoneNumber', 'profilePictureUrl', 'totalBalance', 'password', 'createdAt', 'updatedAt'],
    });
  }

  /**
   * Tạo user mới
   * @param userData Dữ liệu user để tạo
   * @returns User object đã được tạo
   */
  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }
}

