import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import type { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<Partial<AuthService>>;

  const mockResponse = () => {
    const res: Partial<Response> = {
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };
    return res as Response;
  };

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login, set cookies, and return response format', async () => {
      const loginDto = { email: 'user@example.com', password: 'password123' };
      const loginResult = {
        message: 'Login successful',
        data: { _id: '123', email: 'user@example.com' },
        accessToken: 'access-jwt-token',
        refreshToken: 'refresh-jwt-token',
        success: true,
      };

      (authService.login as jest.Mock).mockResolvedValue(loginResult);
      const res = mockResponse();

      const result = await controller.login(loginDto, res);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        'access-jwt-token',
        expect.objectContaining({
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        }),
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh-jwt-token',
        expect.objectContaining({
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        }),
      );
      expect(result).toEqual({
        message: 'Login successful',
        data: loginResult.data,
        accessToken: 'access-jwt-token',
        refreshToken: 'refresh-jwt-token',
        success: true,
        error: false,
      });
    });
  });

  describe('register', () => {
    it('should call authService.register with dto and return result', async () => {
      const registerDto = {
        username: 'newuser',
        email: 'user@example.com',
        password: 'password123',
        role: 'USER' as const,
      };
      const expectedResult = {
        message: 'User created successfully',
        data: { _id: '123', username: 'newuser' },
        success: true,
      };

      (authService.register as jest.Mock).mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('logout', () => {
    it('should call authService.logout, clear cookies, and return success message', async () => {
      const req = { user: { id: 'user-id-123' } };
      const res = mockResponse();

      (authService.logout as jest.Mock).mockResolvedValue({
        message: 'Logout successful',
        data: { _id: 'user-id-123' },
        success: true,
      });

      const result = await controller.logout(req, res);

      expect(authService.logout).toHaveBeenCalledWith('user-id-123');
      expect(res.clearCookie).toHaveBeenCalledWith(
        'access_token',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(res.clearCookie).toHaveBeenCalledWith(
        'refresh_token',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(result).toEqual({ message: 'Logged out' });
    });
  });
});
