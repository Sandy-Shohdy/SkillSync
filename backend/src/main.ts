import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

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
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });
  const port = process.env.PORT ?? 3000;
  console.log(`[main.ts] About to listen on port ${port}`);
  await app.listen(port);
  console.log(`[main.ts] Application listening on port ${port}`);
}
bootstrap().catch((error) => {
  console.error('[main.ts] Bootstrap failed:', error);
  process.exit(1);
});

