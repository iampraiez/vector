import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateCompanySettingsDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  billing_email?: string;

  @IsString()
  @IsOptional()
  contact_email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  timezone?: string;
}

export class UpdateNotificationsDto {
  @IsBoolean()
  @IsOptional()
  email?: boolean;

  @IsBoolean()
  @IsOptional()
  sms?: boolean;

  @IsBoolean()
  @IsOptional()
  push?: boolean;

  @IsBoolean()
  @IsOptional()
  driverAlerts?: boolean;

  @IsBoolean()
  @IsOptional()
  deliveryUpdates?: boolean;

  @IsBoolean()
  @IsOptional()
  paymentAlerts?: boolean;

  @IsBoolean()
  @IsOptional()
  weeklyReport?: boolean;
}

export class CreateApiKeyDto {
  @IsString()
  name!: string;
}
