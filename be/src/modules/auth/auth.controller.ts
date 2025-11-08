import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RegisterDto } from './dto/register.dto';

/**
 * AuthController: Xử lý các HTTP request liên quan đến xác thực
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint đăng nhập
   * POST /auth/login
   * @param loginDto - Thông tin đăng nhập (email, password)
   * @returns JWT Token và User Object
   * @throws UnauthorizedException (401) nếu xác thực thất bại
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.validateUser(loginDto);
    return {
      success: true,
      message: 'Đăng nhập thành công',
      data: result,
    };
  }

  /**
   * Endpoint đăng ký
   * POST /auth/register
   * @param registerDto - Thông tin đăng ký (fullName, email, password, confirmPassword)
   * @returns JWT Token và User Object
   * @throws BadRequestException (400) nếu password và confirmPassword không trùng khớp
   * @throws ConflictException (409) nếu email đã tồn tại
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return {
      success: true,
      message: 'Đăng ký thành công',
      data: result,
    };
  }
}

