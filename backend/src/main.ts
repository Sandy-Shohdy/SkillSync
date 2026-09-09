import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // Ensure uploads directory exists
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
  app.useStaticAssets(uploadsDir, { prefix: '/uploads/' });
  
  const port = process.env.PORT ?? 3000;
  console.log(`[main.ts] About to listen on port ${port}`);
  
  const server = await app.listen(port, '0.0.0.0');
  console.log(`[main.ts] Application listening on port ${port}`);
  console.log(`[main.ts] Server is ready to accept connections`);
  
  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('[main.ts] SIGTERM received, closing server');
    server.close(() => {
      console.log('[main.ts] Server closed');
      process.exit(0);
    });
  });
}

bootstrap().catch((error) => {
  console.error('[main.ts] Bootstrap failed:', error);
  console.error(error.stack);
  process.exit(1);
});

