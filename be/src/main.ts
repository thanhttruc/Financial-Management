import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cấu hình CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

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

