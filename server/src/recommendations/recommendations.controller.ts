import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { RecommendationsService } from './recommendations.service';

interface AuthenticatedRequest extends Request {
    user?: { userId: number; email: string; role: string };
}

@Controller('recommendations')
export class RecommendationsController {
    constructor(private readonly recommendationsService: RecommendationsService) { }

    @Get('trending')
    getTrending(@Query('limit') limit?: string) {
        return this.recommendationsService.getTrending(Number(limit) || 10);
    }

    @Get('latest')
    getLatest(@Query('limit') limit?: string) {
        return this.recommendationsService.getLatest(Number(limit) || 10);
    }

    @Get('similar/:movieId')
    getSimilar(
        @Param('movieId') movieId: string,
        @Query('limit') limit?: string
    ) {
        return this.recommendationsService.getSimilar(Number(movieId), Number(limit) || 10);
    }

    @Get('for-you')
    @UseGuards(AuthGuard('jwt'))
    getForYou(@Req() req: AuthenticatedRequest, @Query('limit') limit?: string) {
        return this.recommendationsService.getForYou(req.user!.userId, Number(limit) || 10);
    }
}
