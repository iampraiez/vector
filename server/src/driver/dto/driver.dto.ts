import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
  IsBoolean,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateStatusDto {
  @IsEnum(['active', 'idle', 'offline', 'suspended'])
  status!: 'active' | 'idle' | 'offline' | 'suspended';
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

export class ExportHistoryDto {
  @IsString()
  range!: string;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;
}

export class OptimizeRouteDto {
  @IsArray()
  @IsString({ each: true })
  stopIds!: string[];

  @IsNumber()
  currentLat!: number;

  @IsNumber()
  currentLng!: number;

  /** When true, writes optimized `sequence` (and route distance/duration) to the database. */
  @IsBoolean()
  @IsOptional()
  persist?: boolean;
}

export class CreateOptimizedRouteDto {
  @IsArray()
  @IsString({ each: true })
  stopIds!: string[];

  @IsString()
  @IsOptional()
  name?: string;
}

export class AdHocStopDto {
  @IsString()
  @IsOptional()
  customerName?: string;

  @IsString()
  @IsOptional()
  customerEmail?: string;

  @IsString()
  @IsOptional()
  customerPhone?: string;

  @IsString()
  address!: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  packages?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  externalId?: string;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsString()
  @IsOptional()
  delivery_date?: string;

  @IsString()
  @IsOptional()
  time_window_start?: string;

  @IsString()
  @IsOptional()
  time_window_end?: string;
}

export class CreateAdHocRouteDto {
  @IsString()
  name!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdHocStopDto)
  stops!: AdHocStopDto[];
}

export class UpdateDriverProfileDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  full_name?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+\d{1,3}\d{10}$/, {
    message: 'Phone number must be in format +2349166072665',
  })
  phone?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(30)
  vehicle_type?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(30)
  vehicle_make?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(30)
  vehicle_model?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(15)
  vehicle_plate?: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(20)
  vehicle_color?: string;

  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(30)
  license_number?: string;
}

export class UploadAvatarDto {
  @IsString()
  @IsNotEmpty()
  file_url!: string;
}

export class UpdateDriverSettingsDto {
  @IsBoolean()
  @IsOptional()
  notifications_enabled?: boolean;

  @IsBoolean()
  @IsOptional()
  sound_enabled?: boolean;

  @IsBoolean()
  @IsOptional()
  vibration_enabled?: boolean;

  @IsBoolean()
  @IsOptional()
  dark_mode?: boolean;

  @IsBoolean()
  @IsOptional()
  compact_view?: boolean;

  // Mobile App Settings
  @IsBoolean()
  @IsOptional()
  push?: boolean;

  @IsBoolean()
  @IsOptional()
  email?: boolean;

  @IsBoolean()
  @IsOptional()
  sms?: boolean;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  units?: string;

  @IsBoolean()
  @IsOptional()
  autoOptimize?: boolean;

  @IsBoolean()
  @IsOptional()
  voiceGuidance?: boolean;
}
