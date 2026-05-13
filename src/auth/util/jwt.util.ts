// auth/jwt.util.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtUtil {
  constructor(private jwtService: JwtService) { }

  generateAccessToken(userId: string, role: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.jwtService.sign(
      { id: userId, role },
      {
        secret: process.env.SECRET_KEY_ACCESS_TOKEN,
        expiresIn: '5h',
      },
    );
  }

  generateRefreshToken(userId: string) {
    return this.jwtService.sign(
      { id: userId },
      {
        secret: process.env.SECRET_KEY_REFRESH_TOKEN,
        expiresIn: '7d',
      },
    );
  }

}
