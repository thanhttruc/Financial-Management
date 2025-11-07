import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token không được cung cấp');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production';
      const payload = await this.jwtService.verifyAsync(token, {
        secret,
      });

      // Gắn thông tin user vào request để controller có thể sử dụng
      request['user'] = {
        userId: payload.sub,
        email: payload.email,
        username: payload.username,
      };
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

