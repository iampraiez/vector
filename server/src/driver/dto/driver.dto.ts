import { IsString, IsNumber, IsOptional, IsEnum, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateStatusDto {
  @IsEnum(['active', 'idle', 'offline', 'suspended'])
  status!: any;
}

export class UpdateLocationDto {
  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;
}

export class CompleteDeliveryDto {
  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photo_urls?: string[];

  @IsString()
  @IsOptional()
  signature_url?: string;
}

export class FailDeliveryDto {
  @IsString()
  reason!: string;
  
  @IsString()
  @IsOptional()
  notes?: string;
}

export class OnboardingDto {
  @IsString()
  vehicle_type!: string;

  @IsString()
  vehicle_plate!: string;
}
