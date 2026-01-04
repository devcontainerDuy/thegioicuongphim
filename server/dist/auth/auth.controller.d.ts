import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
}
