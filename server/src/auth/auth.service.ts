import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Generate random token
  private generateRandomToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  // Hash token for secure storage
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      include: { role: { include: { permissions: true } } },
    });

    const accessToken = this.generateAccessToken(user.id, user.email);

    return {
      message: 'Đăng ký thành công',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      access_token: accessToken,
    };
  }

  async login(
    loginDto: LoginDto,
    remember: boolean = false,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: { include: { permissions: true } } },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id, user.email);
    const refreshToken = this.generateRandomToken();
    const refreshTokenHash = this.hashToken(refreshToken);

    // Save refresh token to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    const personalAccessToken = await this.prisma.personalAccessToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt,
      },
    });

    // Create session
    await this.prisma.session.create({
      data: {
        userId: user.id,
        tokenId: personalAccessToken.id,
        ipAddress,
        userAgent,
      },
    });

    // Handle remember me
    let rememberToken: string | null = null;
    if (remember) {
      rememberToken = this.generateRandomToken();
      const rememberTokenHash = this.hashToken(rememberToken);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { rememberToken: rememberTokenHash },
      });
    }

    return {
      message: 'Đăng nhập thành công',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
      remember_token: rememberToken,
    };
  }

  async refresh(refreshToken: string, ipAddress?: string) {
    const tokenHash = this.hashToken(refreshToken);

    const token = await this.prisma.personalAccessToken.findFirst({
      where: {
        tokenHash,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: { include: { role: { include: { permissions: true } } } },
      },
    });

    if (!token) {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn. IP: ' + ipAddress,
      );
    }

    // Update session last activity
    await this.prisma.session.updateMany({
      where: { tokenId: token.id },
      data: { lastActivityAt: new Date() },
    });

    // Generate new access token
    const accessToken = this.generateAccessToken(
      token.user.id,
      token.user.email,
    );

    // Optional: Rotate refresh token
    const newRefreshToken = this.generateRandomToken();
    const newTokenHash = this.hashToken(newRefreshToken);

    // Revoke old token
    await this.prisma.personalAccessToken.update({
      where: { id: token.id },
      data: { revoked: true },
    });

    // Create new token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const newToken = await this.prisma.personalAccessToken.create({
      data: {
        userId: token.user.id,
        tokenHash: newTokenHash,
        expiresAt,
      },
    });

    // Update session to new token
    await this.prisma.session.updateMany({
      where: { tokenId: token.id },
      data: { tokenId: newToken.id },
    });

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
      user: {
        id: token.user.id,
        email: token.user.email,
        name: token.user.name,
        avatar: token.user.avatar,
        role: token.user.role,
      },
    };
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);

    const token = await this.prisma.personalAccessToken.findFirst({
      where: { tokenHash },
    });

    if (token) {
      // Revoke token
      await this.prisma.personalAccessToken.update({
        where: { id: token.id },
        data: { revoked: true },
      });

      // Delete session
      await this.prisma.session.deleteMany({
        where: { tokenId: token.id },
      });
    }

    return { message: 'Đăng xuất thành công' };
  }

  async logoutAll(userId: number) {
    // Revoke all tokens
    await this.prisma.personalAccessToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });

    // Delete all sessions
    await this.prisma.session.deleteMany({
      where: { userId },
    });

    // Clear remember token
    await this.prisma.user.update({
      where: { id: userId },
      data: { rememberToken: null },
    });

    return { message: 'Đã đăng xuất tất cả thiết bị' };
  }

  async loginWithRememberToken(
    rememberToken: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const tokenHash = this.hashToken(rememberToken);

    const user = await this.prisma.user.findFirst({
      where: { rememberToken: tokenHash },
      include: { role: { include: { permissions: true } } },
    });

    if (!user) {
      throw new UnauthorizedException('Remember token không hợp lệ');
    }

    // Generate new tokens
    const accessToken = this.generateAccessToken(user.id, user.email);
    const newRefreshToken = this.generateRandomToken();
    const refreshTokenHash = this.hashToken(newRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const personalAccessToken = await this.prisma.personalAccessToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt,
      },
    });

    await this.prisma.session.create({
      data: {
        userId: user.id,
        tokenId: personalAccessToken.id,
        ipAddress,
        userAgent,
      },
    });

    // Rotate remember token
    const newRememberToken = this.generateRandomToken();
    await this.prisma.user.update({
      where: { id: user.id },
      data: { rememberToken: this.hashToken(newRememberToken) },
    });

    return {
      message: 'Đăng nhập thành công',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
      access_token: accessToken,
      refresh_token: newRefreshToken,
      remember_token: newRememberToken,
    };
  }

  async getSessions(userId: number) {
    return this.prisma.session.findMany({
      where: { userId, token: { revoked: false } },
      include: { token: { select: { expiresAt: true, createdAt: true } } },
      orderBy: { lastActivityAt: 'desc' },
    });
  }

  async revokeSession(userId: number, sessionId: number) {
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new UnauthorizedException('Session không tồn tại');
    }

    // Revoke token
    await this.prisma.personalAccessToken.update({
      where: { id: session.tokenId },
      data: { revoked: true },
    });

    // Delete session
    await this.prisma.session.delete({
      where: { id: sessionId },
    });

    return { message: 'Đã thu hồi phiên đăng nhập' };
  }

  async bulkRevoke(userId: number, sessionIds: number[]) {
    const sessions = await this.prisma.session.findMany({
      where: {
        id: { in: sessionIds },
        userId: userId,
      },
    });

    const tokenIds = sessions.map((s) => s.tokenId);

    // Revoke all tokens
    await this.prisma.personalAccessToken.updateMany({
      where: { id: { in: tokenIds } },
      data: { revoked: true },
    });

    // Delete session records
    await this.prisma.session.deleteMany({
      where: {
        id: { in: sessionIds },
        userId: userId,
      },
    });

    return { message: `Đã thu hồi ${sessions.length} phiên đăng nhập` };
  }

  async validateUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: { include: { permissions: true } } },
    });

    if (!user) {
      throw new UnauthorizedException('User không tồn tại');
    }

    return user;
  }

  private generateAccessToken(userId: number, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload, { expiresIn: '1h' });
  }
}
