import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GeocodeDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  filter?: string;

  @IsString()
  @IsOptional()
  bias?: string;
}

export class WaypointDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

export class DirectionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WaypointDto)
  waypoints: WaypointDto[];
}

export class ReverseGeocodeDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}
