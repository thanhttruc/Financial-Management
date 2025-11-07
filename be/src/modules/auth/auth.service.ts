import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Xác thực user bằng email và password
   * @param email Email của user
   * @param password Mật khẩu chưa mã hóa
   * @returns Object chứa JWT token và user object nếu thành công
   * @throws UnauthorizedException nếu email hoặc password không đúng
   */
  async validateUser(email: string, password: string): Promise<{ token: string; user: Omit<User, 'password'> }> {
    // Tìm user theo email
    const user = await this.userService.findByEmail(email);

    // Nếu không tìm thấy user hoặc password không khớp
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');
    }

    // Tạo payload cho JWT token
    const payload = {
      sub: user.userId,
      email: user.email,
      username: user.username,
    };

    // Tạo JWT token
    const token = this.jwtService.sign(payload);

    // Loại bỏ password khỏi user object trước khi trả về
    const { password: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
    };
  }

  /**
   * Đăng ký user mới
   * @param registerDto DTO chứa thông tin đăng ký
   * @returns Object chứa JWT token và user object nếu thành công
   * @throws BadRequestException nếu password và confirmPassword không khớp
   * @throws ConflictException nếu email đã tồn tại
   */
  async register(registerDto: RegisterDto): Promise<{ token: string; user: Omit<User, 'password'> }> {
    // Kiểm tra password và confirmPassword có khớp không
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException({ error: 'Passwords do not match.' });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException({ error: 'This email is already registered.' });
    }

    // Mã hóa mật khẩu
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // Tạo user mới
    const newUser = await this.userService.create({
      email: registerDto.email,
      username: registerDto.username,
      fullName: registerDto.fullName,
      password: hashedPassword,
      totalBalance: 0,
    });

    // Tạo payload cho JWT token
    const payload = {
      sub: newUser.userId,
      email: newUser.email,
      username: newUser.username,
    };

    // Tạo JWT token
    const token = this.jwtService.sign(payload);

    // Loại bỏ password khỏi user object trước khi trả về
    const { password: _, ...userWithoutPassword } = newUser;

    return {
      token,
      user: userWithoutPassword,
    };
  }
}

