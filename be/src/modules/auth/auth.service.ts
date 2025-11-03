import { Injectable, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

/**
 * Service xử lý logic đăng ký và đăng nhập
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * Đăng ký tài khoản mới
   */
  async register(registerDto: RegisterDto) {
    const { fullName, email, password, confirmPassword } = registerDto;

    // Kiểm tra mật khẩu và xác nhận mật khẩu
    if (password !== confirmPassword) {
      throw new BadRequestException({ error: 'Passwords do not match.' });
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException({ error: 'This email is already registered.' });
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo username từ email
    const username = this.generateUsernameFromEmail(email);

    // Tạo user mới
    const user = this.userRepository.create({
      fullName,
      email,
      username,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    // Tạo JWT token
    const token = this.jwtService.sign({
      sub: user.userId,
      email: user.email,
    });

    // Trả về response theo đúng format yêu cầu
    return {
      message: 'Registration successful',
      user: {
        id: user.userId,
        fullName: user.fullName,
        email: user.email,
      },
      token,
    };
  }

  /**
   * Đăng nhập
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Normalize email (lowercase) để tránh case sensitivity
    const normalizedEmail = email.toLowerCase().trim();

    // Tìm user theo email, đảm bảo select được trường password (đã đặt select: false ở entity)
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('LOWER(user.email) = :email', { email: normalizedEmail })
      .getOne();

    if (!user) {
      console.log(`[AuthService] Login failed: User not found for email: ${normalizedEmail}`);
      throw new UnauthorizedException({ error: 'Email hoặc mật khẩu không đúng.' });
    }

    // Kiểm tra mật khẩu
    if (!user.password) {
      console.log(`[AuthService] Login failed: User ${user.userId} has no password`);
      throw new UnauthorizedException({ error: 'Email hoặc mật khẩu không đúng.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log(`[AuthService] Login failed: Invalid password for user ${user.userId}`);
      throw new UnauthorizedException({ error: 'Email hoặc mật khẩu không đúng.' });
    }

    console.log(`[AuthService] Login successful for user: ${user.email} (ID: ${user.userId})`);

    // Tạo JWT token
    const accessToken = this.jwtService.sign({
      sub: user.userId,
      email: user.email,
    });

    // Trả về response theo đúng format yêu cầu
    return {
      accessToken,
      user: {
        id: user.userId,
        fullName: user.fullName,
        email: user.email,
      },
    };
  }

  /**
   * Tạo username từ email
   */
  private generateUsernameFromEmail(email: string): string {
    const baseUsername = email.split('@')[0];
    const timestamp = Date.now();
    return `${baseUsername}_${timestamp}`;
  }
}

