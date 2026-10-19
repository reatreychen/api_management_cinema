import { Test, TestingModule } from '@nestjs/testing';
import { JwtUtil } from './jwt.util';
import { JwtService } from '@nestjs/jwt';

describe('JwtUtil', () => {
  let jwtUtil: JwtUtil;
  let jwtService: jest.Mocked<Partial<JwtService>>;

  const originalEnv = process.env;

  beforeEach(async () => {
    process.env = {
      ...originalEnv,
      SECRET_KEY_ACCESS_TOKEN: 'access-secret-123',
      SECRET_KEY_REFRESH_TOKEN: 'refresh-secret-123',
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('signed-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtUtil,
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    jwtUtil = module.get<JwtUtil>(JwtUtil);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should be defined', () => {
    expect(jwtUtil).toBeDefined();
  });

  describe('generateAccessToken', () => {
    it('should sign access token with user id, role, secret and 5h expiration', () => {
      const token = jwtUtil.generateAccessToken('user-1', 'ADMIN');

      expect(jwtService.sign).toHaveBeenCalledWith(
        { id: 'user-1', role: 'ADMIN' },
        {
          secret: 'access-secret-123',
          expiresIn: '5h',
        },
      );
      expect(token).toBe('signed-token');
    });
  });

  describe('generateRefreshToken', () => {
    it('should sign refresh token with user id, secret and 7d expiration', () => {
      const token = jwtUtil.generateRefreshToken('user-1');

      expect(jwtService.sign).toHaveBeenCalledWith(
        { id: 'user-1' },
        {
          secret: 'refresh-secret-123',
          expiresIn: '7d',
        },
      );
      expect(token).toBe('signed-token');
    });
  });
});
