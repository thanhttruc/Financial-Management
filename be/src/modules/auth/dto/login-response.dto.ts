/**
 * DTO cho response đăng nhập thành công
 */
export class LoginResponseDto {
  accessToken: string;
  user: {
    userId: number;
    email: string;
    fullName: string;
    username: string;
  };
}

