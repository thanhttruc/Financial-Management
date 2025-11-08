import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * GlobalExceptionFilter: Xử lý tất cả các exception trong ứng dụng
 * Format response theo chuẩn: { success: false, message: "..." }
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Đã xảy ra lỗi, vui lòng thử lại.';

    // Xử lý HttpException (các exception từ NestJS)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Xử lý NotFoundException đặc biệt
      if (exception instanceof NotFoundException) {
        // Nếu response là object và có message, sử dụng message đó
        if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
          const responseObj = exceptionResponse as any;
          if (responseObj.message) {
            message = Array.isArray(responseObj.message)
              ? responseObj.message[0]
              : responseObj.message;
          } else if (responseObj.error) {
            message = responseObj.error;
          } else {
            // Nếu không có message, tạo message mặc định
            message = `Route ${request.method} ${request.url} không tồn tại`;
          }
        } else if (typeof exceptionResponse === 'string') {
          message = exceptionResponse;
        } else {
          message = `Route ${request.method} ${request.url} không tồn tại`;
        }
      } else {
        // Xử lý các HttpException khác
        if (typeof exceptionResponse === 'string') {
          message = exceptionResponse;
        } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
          const responseObj = exceptionResponse as any;
          // Kiểm tra nếu có message trong response
          if (responseObj.message) {
            // Nếu message là array (từ class-validator), lấy phần tử đầu tiên
            message = Array.isArray(responseObj.message)
              ? responseObj.message[0]
              : responseObj.message;
          } else if (responseObj.error) {
            message = responseObj.error;
          }
        }
      }
    } else if (exception instanceof Error) {
      // Xử lý Error thông thường
      message = exception.message || message;
    }

    // Format response theo chuẩn của project
    const errorResponse = {
      success: false,
      message: message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}

