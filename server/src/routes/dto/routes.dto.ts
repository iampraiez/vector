import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsNumber,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RouteStatus } from '@prisma/client';

export class RouteStopDto {
  @IsString()
  stop_id!: string;

  @IsNumber()
  sequence!: number;
}

export class CreateRouteDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  driver_id?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RouteStopDto)
  @IsOptional()
  stops?: RouteStopDto[];
}

export class UpdateRouteDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  driver_id?: string;

  @IsEnum(RouteStatus)
  @IsOptional()
  status?: RouteStatus;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RouteStopDto)
  @IsOptional()
  stops?: RouteStopDto[];
}

export class AssignRouteDto {
  @IsString()
  driver_id!: string;
}
