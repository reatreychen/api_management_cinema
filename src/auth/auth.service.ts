import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtUtil } from './util/jwt.util';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  // inject user service
  constructor(
    private readonly userService: UserService,
    private readonly jwtUtil: JwtUtil,
  ) { }

  async register(dto: RegisterDto) {
    try {
      //user exist
      const userExist = await this.userService.findByEmail(dto.email);
      if (userExist) {
        throw new HttpException('User already exists', 400);
      }
      const user = await this.userService.create(dto);
      if (!user) {
        throw new HttpException('User not created', 400);
      }
      return {
        message: 'User created successfully',
        data: user,
        success: true
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.userService.findByEmail(loginDto.email);
      if (!user) {
        throw new HttpException('User not found', 404);
      }
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.data.password);
      if (!isPasswordValid) {
        throw new HttpException('Invalid password', 400);
      }
      const accessToken = this.jwtUtil.generateAccessToken(user.data._id.toString(), user.data.role);
      const refreshToken = this.jwtUtil.generateRefreshToken(user.data._id.toString());

      await this.userService.updateRefreshToken(user.data._id.toString(), refreshToken);

      // Exclude password and refreshToken from user data
      const { password, refreshToken: userRefreshToken, ...userData } = user.data.toObject ? user.data.toObject() : user.data;
      return {
        message: 'Login successful',
        data: user,
        accessToken,
        refreshToken,
        success: true
      };
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }

  async refreshToken(refreshToken: string) {
    let payload: any;
    try {
      payload = jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN!);
    } catch (error) {
      throw new HttpException(error.message, 400);
    }

    const { data: user } = await this.userService.findOne(payload.userId);
    if (!user || user.refreshToken !== refreshToken) {
      throw new HttpException('Refresh token not valid', 401);
    }
    const newAccessToken = this.jwtUtil.generateAccessToken(user.id, user.role);

    return {
      accessToken: newAccessToken,
    };
  }

  async logout(userId: string) {
    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new HttpException('User not found', 404);
      }
      return {
        message: 'Logout successful',
        data: user,
        success: true
      };
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }
}
