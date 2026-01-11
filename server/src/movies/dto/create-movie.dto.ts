import { IsString, IsOptional, IsInt, IsEnum, Min } from 'class-validator';

export enum MovieType {
  MOVIE = 'movie',
  SERIES = 'series',
}

export class CreateMovieDto {
  @IsString()
  slug: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  originalName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  thumbUrl?: string;

  @IsString()
  @IsOptional()
  posterUrl?: string;

  @IsString()
  @IsOptional()
  quality?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsInt()
  @IsOptional()
  year?: number;

  @IsEnum(MovieType)
  @IsOptional()
  type?: MovieType;

  @IsInt()
  @IsOptional()
  @Min(1)
  totalEpisodes?: number;

  @IsString()
  @IsOptional()
  currentEpisode?: string;

  @IsString()
  @IsOptional()
  time?: string;

  @IsOptional()
  genres?: any;

  @IsOptional()
  countries?: any;

  @IsOptional()
  category?: any;
}
