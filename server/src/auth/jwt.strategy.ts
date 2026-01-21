import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('jwt.secret') ||
        'thegioicuongphim-secret-key-2026',
    });
  }

  async validate(payload: any) {
    console.log('JwtStrategy Payload:', payload);
    const user = await this.authService.validateUser(payload.sub);

    if (!user) {
      console.log('JwtStrategy: User not found for payload', payload);
      return null; // Or throw UnauthorizedException
    }

    // Must return an object that matches the structure expected by guards/interceptors
    // and specifically the User entity structure where possible.
    // The previous code returned { userId: ... } which caused mismatch.
    // We return the full user object (or at least id).
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.role?.permissions,
    };
  }
}
