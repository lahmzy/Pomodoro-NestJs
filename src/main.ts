import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 1. Get the ConfigService instance
  const configService = app.get(ConfigService);
  
  // 2. Setup standard middleware
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());

  // 3. Dynamic CORS configuration
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000'], // Allow both Prod and Local
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Essential for cookies and Auth headers
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // 4. Listen on the correct port
  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();