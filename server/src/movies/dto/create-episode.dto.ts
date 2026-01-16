import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateEpisodeDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  linkEmbed?: string;

  @IsString()
  @IsOptional()
  linkM3u8?: string;

  @IsString()
  @IsOptional()
  serverName?: string;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}
