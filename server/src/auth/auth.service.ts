import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        const { email, password, name } = registerDto;

        // Check if user exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new ConflictException('Email đã được sử dụng');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });

        // Generate token
        const token = this.generateToken(user.id, user.email);

        return {
            message: 'Đăng ký thành công',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            access_token: token,
        };
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        // Find user
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
        }

        // Generate token
        const token = this.generateToken(user.id, user.email);

        return {
            message: 'Đăng nhập thành công',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            access_token: token,
        };
    }

    async validateUser(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedException('User không tồn tại');
        }

        return user;
    }

    private generateToken(userId: number, email: string): string {
        const payload = { sub: userId, email };
        return this.jwtService.sign(payload);
    }
}
