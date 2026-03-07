import { IsString, IsOptional } from 'class-validator';

export class UpdateCompanySettingsDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  billing_email?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  // More fields could be added
}

export class CreateApiKeyDto {
  @IsString()
  name!: string;
}
