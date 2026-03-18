import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class SignInDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsOptional()
  device_id?: string;
}

export class SignUpDriverDto {
  @IsString()
  @IsNotEmpty()
  company_code!: string;

  @IsString()
  @IsNotEmpty()
  full_name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password!: string;

  @IsString()
  @IsOptional()
  vehicle_type?: string;

  @IsString()
  @IsOptional()
  vehicle_plate?: string;
}

export class SignUpFleetDto {
  @IsString()
  @IsNotEmpty()
  full_name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password!: string;

  @IsString()
  @IsNotEmpty()
  company_name!: string;

  @IsString()
  @IsOptional()
  company_size?: string;

  @IsString()
  @IsNotEmpty()
  plan_id!: string;
}

export class VerifyEmailDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class ResendVerificationDto {
  @IsEmail()
  email!: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  new_password!: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refresh_token!: string;

  @IsString()
  @IsOptional()
  device_id?: string;
}

export class UpdateDriverProfileDto {
  @IsString()
  @IsNotEmpty()
  vehicle_type!: string;

  @IsString()
  @IsNotEmpty()
  vehicle_make!: string;

  @IsString()
  @IsNotEmpty()
  vehicle_model!: string;

  @IsString()
  @IsNotEmpty()
  vehicle_plate!: string;

  @IsString()
  @IsNotEmpty()
  vehicle_color!: string;

  @IsString()
  @IsNotEmpty()
  license_number!: string;
}
