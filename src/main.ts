import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

function validateEnv() {
  const required = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];

  if (process.env.NODE_ENV === 'production') {
    for (const key of required) {
      if (!process.env[key]) {
        console.error(
          `[FATAL] Missing required environment variable: ${key}. ` +
          `Cannot start in production mode without it.`,
        );
        process.exit(1);
      }
    }
    if (
      process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET
    ) {
      console.error(
        '[FATAL] JWT_SECRET and JWT_REFRESH_SECRET must be different.',
      );
      process.exit(1);
    }
  }
}

async function bootstrap() {
  validateEnv();

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const corsOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
  if (process.env.NODE_ENV === 'production' && corsOrigins.length === 0) {
    throw new Error('CORS_ORIGINS must be configured in production');
  }
  app.enableCors({
    origin: corsOrigins.length ? corsOrigins : true,
    credentials: true,
  });

  app.setGlobalPrefix('api', {
    exclude: ['auth/register', 'auth/login', 'auth/refresh'],
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`KingsDomino server running on port ${port}`);
}
bootstrap();
