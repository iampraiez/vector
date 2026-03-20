import { IsString, IsNotEmpty } from 'class-validator';
import { IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GeocodeDto {
  @IsString()
  @IsNotEmpty()
  address: string;
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
