import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        user: {
            id: number;
            email: string;
            name: string | null;
            role: string;
        };
        access_token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        message: string;
        user: {
            id: number;
            email: string;
            name: string | null;
            role: string;
        };
        access_token: string;
    }>;
    validateUser(userId: number): Promise<{
        email: string;
        password: string;
        name: string | null;
        id: number;
        avatar: string | null;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private generateToken;
}
