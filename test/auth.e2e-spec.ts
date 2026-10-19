import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import cookieParser from 'cookie-parser';

describe('Auth Endpoints (e2e)', () => {
  let app: INestApplication;
  const testId = Date.now();
  const testUser = {
    username: `e2e_user_${testId}`,
    email: `e2e_${testId}@example.com`,
    password: 'Password123!',
    role: 'USER',
  };

  beforeAll(async () => {
    jest.setTimeout(20000);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'User created successfully');
      expect(response.body.data?.data?.email).toBe(testUser.email);
    });

    it('should reject registering with an already existing email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(400);

      expect(response.body.message).toContain('User already exists');
    });

    it('should reject registration with invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'invaliduser',
          email: 'not-an-email',
          password: 'Password123!',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    let accessToken: string;

    it('should fail login when user does not exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: `nonexistent_${Date.now()}@example.com`,
          password: 'AnyPassword123',
        })
        .expect(400);

      expect(response.body.message).toContain('User not found');
    });

    it('should fail login with wrong password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword!',
        })
        .expect(400);

      expect(response.body.message).toContain('Invalid password');
    });

    it('should log in successfully with valid credentials and return tokens & cookies', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('success', true);

      // Verify Set-Cookie headers
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((c: string) => c.startsWith('access_token='))).toBe(true);
      expect(cookies.some((c: string) => c.startsWith('refresh_token='))).toBe(true);

      accessToken = response.body.accessToken;
    });

    it('should successfully log out when authenticated', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(response.body).toEqual({ message: 'Logged out' });

      // Check cookies cleared
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((c: string) => c.includes('access_token=;'))).toBe(true);
    });
  });
});
