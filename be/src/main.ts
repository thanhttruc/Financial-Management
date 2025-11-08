import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix cho tất cả routes
  app.setGlobalPrefix('api');

  // Cấu hình CORS - Cho phép nhiều origins trong development
  const allowedOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:1574', 'http://localhost:5174'];

  app.enableCors({
    origin: (origin, callback) => {
      // Cho phép requests không có origin (mobile apps, Postman, etc.) trong development
      if (!origin && process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      // Cho phép localhost với bất kỳ port nào trong development
      if (process.env.NODE_ENV === 'development' && origin && origin.includes('localhost')) {
        return callback(null, true);
      }
      // Kiểm tra origin có trong danh sách allowed
      if (origin && allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('Financial Management API')
    .setDescription('API documentation cho ứng dụng quản lý tài chính')
    .setVersion('1.0')
    .addTag('users', 'API quản lý người dùng')
    .addTag('accounts', 'API quản lý tài khoản')
    .addTag('transactions', 'API quản lý giao dịch')
    .addTag('categories', 'API quản lý danh mục')
    .addTag('bills', 'API quản lý hóa đơn')
    .addTag('goals', 'API quản lý mục tiêu')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 8000;
  await app.listen(port);
  console.log(`🚀 Server đang chạy tại: http://localhost:${port}`);
  console.log(`📚 Swagger API docs: http://localhost:${port}/api`);
}

bootstrap();

