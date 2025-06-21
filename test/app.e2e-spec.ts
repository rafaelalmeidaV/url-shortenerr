import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('URL Shortener E2E', () => {
  let app: INestApplication;
  let jwtToken: string;
  let userId: string;
  let shortCode: string;

  beforeAll(async () => {
    const builder = Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [__dirname + '/../src/**/*.entity.ts'],
          synchronize: true,
        }),
      ],
    });

    builder.overrideModule(AppModule); // se necessário

    const moduleFixture: TestingModule = await builder.compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication Flow', () => {
    it('/auth/register (POST) - should register new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user).toMatchObject({
        email: registerDto.email,
        name: registerDto.name,
      });

      jwtToken = response.body.access_token;
      userId = response.body.user.id;
    });

    it('/auth/login (POST) - should login user', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user.email).toBe(loginDto.email);
    });
  });

  describe('URL Shortening Flow', () => {
    it('/shorten (POST) - should create short URL without authentication', async () => {
      const createUrlDto = {
        originalUrl: 'https://www.google.com',
      };

      const response = await request(app.getHttpServer())
        .post('/shorten')
        .send(createUrlDto)
        .expect(201);

      expect(response.body).toMatchObject({
        originalUrl: createUrlDto.originalUrl,
        userId: null,
      });
      expect(response.body.shortCode).toBeDefined();
    });

    it('/shorten (POST) - should create short URL with authentication', async () => {
      const createUrlDto = {
        originalUrl: 'https://www.github.com',
        customAlias: 'github',
      };

      const response = await request(app.getHttpServer())
        .post('/shorten')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createUrlDto)
        .expect(201);

      expect(response.body).toMatchObject({
        originalUrl: createUrlDto.originalUrl,
        shortCode: createUrlDto.customAlias,
        userId: userId,
      });

      shortCode = response.body.shortCode;
    });

    it('/my-urls (GET) - should return user URLs', async () => {
      const response = await request(app.getHttpServer())
        .get('/my-urls')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].userId).toBe(userId);
    });

    it('/:shortCode (GET) - should redirect to original URL', async () => {
      await request(app.getHttpServer())
        .get(`/${shortCode}`)
        .expect(301);
    });

    it('/urls/:shortCode (PUT) - should update URL', async () => {
      const updateUrlDto = {
        originalUrl: 'https://www.updated-github.com',
      };

      const response = await request(app.getHttpServer())
        .put(`/urls/${shortCode}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(updateUrlDto)
        .expect(200);

      expect(response.body.originalUrl).toBe(updateUrlDto.originalUrl);
    });

    it('/urls/:shortCode (DELETE) - should delete URL', async () => {
      await request(app.getHttpServer())
        .delete(`/urls/${shortCode}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);
    });
  });
});
