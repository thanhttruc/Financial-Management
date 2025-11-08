import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Server is running' })
  getHello() {
    return {
      success: true,
      message: 'Financial Management API is running',
      version: '1.0',
      endpoints: {
        docs: '/api',
        health: '/api/health',
      },
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Check server health status' })
  @ApiResponse({ status: 200, description: 'Server health check' })
  healthCheck() {
    return {
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      status: 'OK',
    };
  }
}

