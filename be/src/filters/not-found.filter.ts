import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * NotFoundFilter: Xử lý các route không tồn tại (404)
 */
@Catch()
export class NotFoundFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // Kiểm tra nếu route không tồn tại
    if (!request.route) {
      response.status(404).json({
        success: false,
        message: `Route ${request.method} ${request.url} không tồn tại`,
        statusCode: 404,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

    // Nếu có exception khác, ném lại để GlobalExceptionFilter xử lý
    throw exception;
  }
}

