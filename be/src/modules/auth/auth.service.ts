import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterDto } from './dto/register.dto';

/**
 * AuthService: Xử lý logic xác thực người dùng
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validate user và so sánh mật khẩu
   * @param loginDto - Thông tin đăng nhập (email, password)
   * @returns JWT Token và User Object nếu thành công
   * @throws UnauthorizedException nếu email hoặc mật khẩu không đúng
   */
  async validateUser(loginDto: LoginDto): Promise<LoginResponseDto> {
    // Tìm user theo email, bao gồm cả password field
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      select: ['userId', 'email', 'fullName', 'username', 'password'],
    });

    // Kiểm tra user có tồn tại không
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');
    }

    // So sánh mật khẩu đã mã hóa
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');
    }

    // Tạo JWT token
    const payload = { sub: user.userId, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    // Trả về token và thông tin user (không bao gồm password)
    return {
      accessToken,
      user: {
        userId: user.userId,
        email: user.email,
        fullName: user.fullName,
        username: user.username,
      },
    };
  }

  /**
   * Đăng ký người dùng mới
   * @param registerDto - Thông tin đăng ký (fullName, email, password, confirmPassword)
   * @returns JWT Token và User Object nếu thành công
   * @throws BadRequestException nếu password và confirmPassword không trùng khớp
   * @throws ConflictException nếu email đã tồn tại
   */
  async register(registerDto: RegisterDto): Promise<LoginResponseDto> {
    // 1. Kiểm tra password và confirmPassword có trùng khớp không
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException({ error: 'Passwords do not match.' });
    }

    // 2. Kiểm tra Email đã tồn tại trong DB
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException({ error: 'This email is already registered.' });
    }

    // 3. Mã hóa mật khẩu
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // 4. Tạo username từ email (lấy phần trước @)
    const username = registerDto.email.split('@')[0];

    // 5. Tạo user mới
    const newUser = this.userRepository.create({
      fullName: registerDto.fullName,
      email: registerDto.email,
      username: username,
      password: hashedPassword,
      totalBalance: 0.0,
    });

    // 6. Lưu user vào database
    const savedUser = await this.userRepository.save(newUser);

    // 7. Tạo JWT token
    const payload = { sub: savedUser.userId, email: savedUser.email };
    const accessToken = this.jwtService.sign(payload);

    // 8. Trả về token và thông tin user (không bao gồm password)
    return {
      accessToken,
      user: {
        userId: savedUser.userId,
        email: savedUser.email,
        fullName: savedUser.fullName,
        username: savedUser.username,
      },
    };
  }
}

