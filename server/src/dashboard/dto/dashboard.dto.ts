import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  IsEmail,
} from 'class-validator';
import { StopPriority } from '@prisma/client';

import { PaginationDto } from '../../common/dto/pagination.dto';
export { PaginationDto };

export class DriverQueryDto extends PaginationDto {
  @IsString()
  @IsOptional()
  status?: string;
}

export class OrderQueryDto extends PaginationDto {
  @IsString()
  @IsOptional()
  status?: string;
}

export class CreateOrderDto {
  @IsString()
  customer_name!: string;

  @IsEmail()
  @IsOptional()
  customer_email?: string;

  @IsString()
  @IsOptional()
  customer_phone?: string;

  @IsString()
  address!: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  postal_code?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  packages?: number;

  @IsEnum(StopPriority)
  @IsOptional()
  priority?: StopPriority;

  @IsString()
  @IsOptional()
  time_window_start?: string;

  @IsString()
  @IsOptional()
  time_window_end?: string;

  @IsString()
  @IsOptional()
  delivery_date?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateOrderDto {
  @IsString()
  @IsOptional()
  customer_name?: string;

  @IsEmail()
  @IsOptional()
  customer_email?: string;

  @IsString()
  @IsOptional()
  customer_phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  postal_code?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  packages?: number;

  @IsEnum(StopPriority)
  @IsOptional()
  priority?: StopPriority;

  @IsString()
  @IsOptional()
  time_window_start?: string;

  @IsString()
  @IsOptional()
  time_window_end?: string;

  @IsString()
  @IsOptional()
  delivery_date?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  route_id?: string;

  @IsString()
  @IsOptional()
  driver_id?: string;

  @IsEnum(['unassigned', 'assigned', 'in_progress', 'completed', 'failed'])
  @IsOptional()
  status?: 'unassigned' | 'assigned' | 'in_progress' | 'completed' | 'failed';

  @IsNumber()
  @IsOptional()
  lat?: number;

  @IsNumber()
  @IsOptional()
  lng?: number;

  // Add whitelisted computed fields to avoid 400s from spread objects
  @IsOptional()
  driver_name?: string;

  @IsOptional()
  route_name?: string;

  @IsOptional()
  assigned_to?: string;

  @IsOptional()
  service_time_min?: number;
}

export class CreateDriverDto {
  @IsString()
  full_name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  phone!: string;

  @IsString()
  @IsOptional()
  vehicle_type?: string;

  @IsString()
  @IsOptional()
  vehicle_plate?: string;
}

export class UpdateDriverDto {
  @IsString()
  @IsOptional()
  full_name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(['active', 'idle', 'offline', 'suspended'])
  @IsOptional()
  status?: 'active' | 'idle' | 'offline' | 'suspended';

  @IsString()
  @IsOptional()
  vehicle_type?: string;

  @IsString()
  @IsOptional()
  vehicle_plate?: string;
}

export class ReportQueryDto {
  @IsString()
  @IsOptional()
  start_date?: string;

  @IsString()
  @IsOptional()
  end_date?: string;

  @IsString()
  @IsOptional()
  driver_id?: string;

  @IsString()
  @IsOptional()
  format?: 'json' | 'csv' | 'pdf';
}

export class ChangePlanDto {
  @IsString()
  plan_id!: string;

  @IsString()
  @IsOptional()
  billing_cycle?: 'monthly' | 'annual';

  @IsNumber()
  @IsOptional()
  expected_amount_ngn?: number;
}

export class CreateApiKeyDto {
  @IsString()
  @IsOptional()
  name?: string;
}

export class ReassignStopDto {
  @IsOptional()
  @IsString()
  driver_id?: string;
}
