import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from '../shared/decorators/public.decorator';
import { AcessJwtGuard } from './guards/access-jwt.guard';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  // inject service
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @Public()
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);

    const isProd = process.env.NODE_ENV === 'production';

    // cookie options
    const cookieOptions = {
      httpOnly: true,
      // In production, cookies used across origins must be Secure and SameSite=None
      secure: isProd, // set true in production (requires HTTPS)
      sameSite: isProd ? ('none' as const) : ('lax' as const),
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      // domain: isProd ? 'your-production-domain.com' : undefined,
      // path: '/',
    };

    // set tokens in cookies (httpOnly)
    res.cookie('access_token', result.accessToken, cookieOptions);
    res.cookie('refresh_token', result.refreshToken, cookieOptions);

    return {
      message: 'Login successful',
      data: result.data,
      accessToken: result.accessToken, // Return token for frontend usage
      refreshToken: result.refreshToken,
      success: true,
      error: false,
    };
  }

  @Post('register')
  @Public()
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @Post('logout')
  @UseGuards(AcessJwtGuard)
  async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.id);

    // Clear cookies on logout
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('access_token', { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax' });
    res.clearCookie('refresh_token', { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax' });

    return { message: 'Logged out' };
  }
}
