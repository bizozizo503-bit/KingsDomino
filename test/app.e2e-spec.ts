import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.setGlobalPrefix('api', {
      exclude: ['auth/register', 'auth/login', 'auth/refresh'],
    });
    await app.init();
  });

  it('boots and protects API routes with JWT', async () => {
    // Protected route without token -> 401
    await request(app.getHttpServer()).get('/api/rooms').expect(401);

    // Invalid registration payload -> 400 (ValidationPipe working)
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'x' })
      .expect(400);

    // Unknown route -> 404
    await request(app.getHttpServer()).get('/api/does-not-exist').expect(404);
  });

  afterAll(async () => {
    await app.close();
  });
});