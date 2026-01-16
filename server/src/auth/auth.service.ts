import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, In } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterDto, LoginDto } from './dto';
import { User } from '../users/entities/user.entity';
import { PersonalAccessToken } from './entities/personal-access-token.entity';
import { Session } from './entities/session.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PersonalAccessToken)
    private tokenRepository: Repository<PersonalAccessToken>,
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
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

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
    });
    
    const savedUser = await this.userRepository.save(newUser);
    
    // Fetch full user with role for return
    const user = await this.userRepository.findOne({
        where: { id: savedUser.id },
        relations: ['role', 'role.permissions']
    });

    const accessToken = this.generateAccessToken(user!.id, user!.email);

    return {
      message: 'Đăng ký thành công',
      user: {
        id: user!.id,
        email: user!.email,
        name: user!.name,
        role: user!.role,
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

    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role', 'role.permissions'],
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

    const newToken = this.tokenRepository.create({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt,
    });
    const personalAccessToken = await this.tokenRepository.save(newToken);

    // Create session
    const newSession = this.sessionRepository.create({
      userId: user.id,
      tokenId: personalAccessToken.id,
      ipAddress,
      userAgent,
    });
    await this.sessionRepository.save(newSession);

    // Handle remember me
    let rememberToken: string | null = null;
    if (remember) {
      rememberToken = this.generateRandomToken();
      const rememberTokenHash = this.hashToken(rememberToken);
      await this.userRepository.update(user.id, { rememberToken: rememberTokenHash });
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

    const token = await this.tokenRepository.findOne({
      where: {
        tokenHash,
        revoked: false,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user', 'user.role', 'user.role.permissions'],
    });

    if (!token) {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn. IP: ' + ipAddress,
      );
    }

    // Update session last activity
    await this.sessionRepository.update({ tokenId: token.id }, { lastActivityAt: new Date() });

    // Generate new access token
    const accessToken = this.generateAccessToken(
      token.user.id,
      token.user.email,
    );

    // Optional: Rotate refresh token
    const newRefreshToken = this.generateRandomToken();
    const newTokenHash = this.hashToken(newRefreshToken);

    // Revoke old token
    await this.tokenRepository.update(token.id, { revoked: true });

    // Create new token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const newToken = this.tokenRepository.create({
      userId: token.user.id,
      tokenHash: newTokenHash,
      expiresAt,
    });
    const savedNewToken = await this.tokenRepository.save(newToken);

    // Update session to new token
    await this.sessionRepository.update({ tokenId: token.id }, { tokenId: savedNewToken.id });

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

    const token = await this.tokenRepository.findOne({
      where: { tokenHash },
    });

    if (token) {
      // Revoke token
      await this.tokenRepository.update(token.id, { revoked: true });

      // Delete session
      await this.sessionRepository.delete({ tokenId: token.id });
    }

    return { message: 'Đăng xuất thành công' };
  }

  async logoutAll(userId: number) {
    // Revoke all tokens
    await this.tokenRepository.update({ userId }, { revoked: true });

    // Delete all sessions
    await this.sessionRepository.delete({ userId });

    // Clear remember token
    await this.userRepository.update(userId, { rememberToken: null });

    return { message: 'Đã đăng xuất tất cả thiết bị' };
  }

  async loginWithRememberToken(
    rememberToken: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const tokenHash = this.hashToken(rememberToken);

    const user = await this.userRepository.findOne({
      where: { rememberToken: tokenHash },
      relations: ['role', 'role.permissions'],
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

    const newToken = this.tokenRepository.create({
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt,
    });
    const personalAccessToken = await this.tokenRepository.save(newToken);

    const newSession = this.sessionRepository.create({
        userId: user.id,
        tokenId: personalAccessToken.id,
        ipAddress,
        userAgent,
    });
    await this.sessionRepository.save(newSession);

    // Rotate remember token
    const newRememberToken = this.generateRandomToken();
    await this.userRepository.update(user.id, { rememberToken: this.hashToken(newRememberToken) });

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
    return this.sessionRepository.find({
      where: { userId, token: { revoked: false } }, // relations in where conditions work since TypeORM 0.3 if relation is loaded or check if supported.
      // Wait, filtering by relation property in `where` is supported.
      relations: ['token'],
      order: { lastActivityAt: 'DESC' },
      // Select specific fields manually or via map after fetch, or use select if needed.
    });
  }

  async revokeSession(userId: number, sessionId: number) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new UnauthorizedException('Session không tồn tại');
    }

    // Revoke token
    await this.tokenRepository.update(session.tokenId, { revoked: true });

    // Delete session
    await this.sessionRepository.delete(sessionId);

    return { message: 'Đã thu hồi phiên đăng nhập' };
  }

  async bulkRevoke(userId: number, sessionIds: number[]) {
    const sessions = await this.sessionRepository.find({
      where: {
        id: In(sessionIds),
        userId: userId,
      },
    });

    const tokenIds = sessions.map((s) => s.tokenId);

    // Revoke all tokens
    if (tokenIds.length > 0) {
        await this.tokenRepository.update({ id: In(tokenIds) }, { revoked: true });
    }

    // Delete session records
    if (sessionIds.length > 0) {
        await this.sessionRepository.delete({
            id: In(sessionIds),
            userId: userId,
        });
    }

    return { message: `Đã thu hồi ${sessions.length} phiên đăng nhập` };
  }

  async validateUser(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissions'],
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
