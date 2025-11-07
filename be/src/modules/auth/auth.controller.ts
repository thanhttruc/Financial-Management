import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Đăng nhập user
   * @param loginDto DTO chứa email và password
   * @returns Object chứa success, message, data (token và user)
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.validateUser(loginDto.email, loginDto.password);
    
    return {
      success: true,
      message: 'Đăng nhập thành công',
      data: result,
    };
  }

  /**
   * Đăng ký user mới
   * @param registerDto DTO chứa thông tin đăng ký
   * @returns Object chứa success, message, data (token và user)
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

