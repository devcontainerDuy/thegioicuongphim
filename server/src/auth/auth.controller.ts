import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Body('remember') remember: boolean = false,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString();
    const userAgent = req.headers['user-agent'];

    const result = await this.authService.login(
      loginDto,
      remember,
      ip,
      userAgent,
    );

    // Set refresh token as HttpOnly cookie
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Set remember token if present
    if (result.remember_token) {
      res.cookie('remember_token', result.remember_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
      });
    }

    // Don't return tokens in body (they're in cookies)
    const { refresh_token, remember_token, ...responseData } = result;
    return responseData;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return { error: 'No refresh token provided', statusCode: 401 };
    }

    const ip = req.ip || req.headers['x-forwarded-for']?.toString();
    const result = await this.authService.refresh(refreshToken, ip);

    // Update refresh token cookie (rotation)
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const { refresh_token, ...responseData } = result;
    return responseData;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    res.clearCookie('refresh_token');
    res.clearCookie('remember_token');

    return { message: 'Đăng xuất thành công' };
  }

  @Post('logout-all')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = (req.user as any).id;
    const result = await this.authService.logoutAll(userId);

    res.clearCookie('refresh_token');
    res.clearCookie('remember_token');

    return result;
  }

  @Post('remember')
  @HttpCode(HttpStatus.OK)
  async loginWithRemember(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rememberToken = req.cookies?.remember_token;
    if (!rememberToken) {
      return { error: 'No remember token provided', statusCode: 401 };
    }

    const ip = req.ip || req.headers['x-forwarded-for']?.toString();
    const userAgent = req.headers['user-agent'];

    const result = await this.authService.loginWithRememberToken(
      rememberToken,
      ip,
      userAgent,
    );

    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.cookie('remember_token', result.remember_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 90 * 24 * 60 * 60 * 1000,
    });

    const { refresh_token, remember_token, ...responseData } = result;
    return responseData;
  }

  @Get('sessions')
  @UseGuards(AuthGuard('jwt'))
  async getSessions(@Req() req: Request) {
    const userId = (req.user as any).userId;
    return this.authService.getSessions(userId);
  }

  @Delete('sessions/:id')
  @UseGuards(AuthGuard('jwt'))
  async revokeSession(@Req() req: Request, @Param('id') id: string) {
    const userId = (req.user as any).userId;
    return this.authService.revokeSession(userId, Number(id));
  }

  @Delete('sessions-bulk')
  @UseGuards(AuthGuard('jwt'))
  async bulkRevokeSessions(@Req() req: Request, @Body('ids') ids: number[]) {
    const userId = (req.user as any).userId;
    return this.authService.bulkRevoke(userId, ids);
  }
}
