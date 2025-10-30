import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO cho đăng nhập
 */
export class LoginDto {
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString()
  password: string;
}

