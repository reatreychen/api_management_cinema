import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtUtil } from './util/jwt.util';
import { BadRequestException, HttpException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  sign: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userService: jest.Mocked<Partial<UserService>>;
  let jwtUtil: jest.Mocked<Partial<JwtUtil>>;

  const mockUser = {
    _id: 'user-id-123',
    username: 'testuser',
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    role: 'USER' as const,
    refreshToken: 'valid-refresh-token',
    toObject: () => ({
      _id: 'user-id-123',
      username: 'testuser',
      email: 'test@example.com',
      password: '$2b$10$hashedpassword',
      role: 'USER',
      refreshToken: 'valid-refresh-token',
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    userService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      updateRefreshToken: jest.fn(),
      findOne: jest.fn(),
    };

    jwtUtil = {
      generateAccessToken: jest.fn().mockReturnValue('mock-access-token'),
      generateRefreshToken: jest.fn().mockReturnValue('mock-refresh-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: userService,
        },
        {
          provide: JwtUtil,
          useValue: jwtUtil,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    const registerDto = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123',
      role: 'USER' as const,
    };

    it('should successfully register a new user', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(null);
      (userService.create as jest.Mock).mockResolvedValue({
        message: 'User created successfully',
        data: mockUser,
        success: true,
      });

      const result = await authService.register(registerDto);

      expect(userService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(userService.create).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({
        message: 'User created successfully',
        data: {
          message: 'User created successfully',
          data: mockUser,
          success: true,
        },
        success: true,
      });
    });

    it('should throw BadRequestException if user already exists', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue({
        message: 'User fetched successfully',
        data: mockUser,
        success: true,
      });

      await expect(authService.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(userService.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if userService.create fails', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(null);
      (userService.create as jest.Mock).mockResolvedValue(null);

      await expect(authService.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully log in with valid credentials', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue({
        data: mockUser,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login(loginDto);

      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(jwtUtil.generateAccessToken).toHaveBeenCalledWith(
        mockUser._id,
        mockUser.role,
      );
      expect(jwtUtil.generateRefreshToken).toHaveBeenCalledWith(mockUser._id);
      expect(userService.updateRefreshToken).toHaveBeenCalledWith(
        mockUser._id,
        'mock-refresh-token',
      );
      expect(result).toEqual({
        message: 'Login successful',
        data: { data: mockUser },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        success: true,
      });
    });

    it('should throw HttpException 400 when user is not found', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(HttpException);
    });

    it('should throw HttpException 400 when password is invalid', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue({
        data: mockUser,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(HttpException);
    });
  });

  describe('refreshToken', () => {
    const validRefreshToken = 'valid-token';
    const originalEnv = process.env.SECRET_KEY_REFRESH_TOKEN;

    beforeEach(() => {
      process.env.SECRET_KEY_REFRESH_TOKEN = 'secret-refresh';
    });

    afterEach(() => {
      process.env.SECRET_KEY_REFRESH_TOKEN = originalEnv;
    });

    it('should return new accessToken when refreshToken is valid', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ userId: 'user-id-123' });
      (userService.findOne as jest.Mock).mockResolvedValue({
        data: { id: 'user-id-123', role: 'USER', refreshToken: validRefreshToken },
      });

      const result = await authService.refreshToken(validRefreshToken);

      expect(jwt.verify).toHaveBeenCalledWith(
        validRefreshToken,
        process.env.SECRET_KEY_REFRESH_TOKEN,
      );
      expect(userService.findOne).toHaveBeenCalledWith('user-id-123');
      expect(jwtUtil.generateAccessToken).toHaveBeenCalledWith(
        'user-id-123',
        'USER',
      );
      expect(result).toEqual({ accessToken: 'mock-access-token' });
    });

    it('should throw HttpException if jwt verification fails', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(authService.refreshToken('expired-token')).rejects.toThrow(
        HttpException,
      );
    });

    it('should throw HttpException 401 if user refreshToken does not match', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ userId: 'user-id-123' });
      (userService.findOne as jest.Mock).mockResolvedValue({
        data: { id: 'user-id-123', role: 'USER', refreshToken: 'different-token' },
      });

      await expect(authService.refreshToken(validRefreshToken)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('logout', () => {
    it('should successfully log out when user exists', async () => {
      (userService.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.logout('user-id-123');

      expect(userService.findOne).toHaveBeenCalledWith('user-id-123');
      expect(result).toEqual({
        message: 'Logout successful',
        data: mockUser,
        success: true,
      });
    });

    it('should throw HttpException 404 when user is not found', async () => {
      (userService.findOne as jest.Mock).mockResolvedValue(null);

      await expect(authService.logout('unknown-id')).rejects.toThrow(
        HttpException,
      );
    });
  });
});
