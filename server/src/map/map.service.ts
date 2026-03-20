import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeocodeDto, DirectionsDto } from './dto/map.dto';

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

export interface DirectionsResult {
  polylinePoints: Array<[number, number]>;
  distanceKm: number;
  durationMin: number;
}

@Injectable()
export class MapService {
  private readonly logger = new Logger(MapService.name);
  private readonly apiKey: string;
  private readonly geocodeBase = 'https://api.geoapify.com/v1/geocode/search';
  private readonly routingBase = 'https://api.geoapify.com/v1/routing';

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get<string>('GEOAPIFY_API_KEY') ?? '';
    if (!this.apiKey) {
      this.logger.warn(
        'GEOAPIFY_API_KEY is not set — map endpoints will always fail.',
      );
    }
  }

  private requireKey(): void {
    if (!this.apiKey) {
      throw new BadRequestException('Map service is not configured.');
    }
  }

  async geocode(dto: GeocodeDto): Promise<GeocodeResult> {
    this.requireKey();

    const url = new URL(this.geocodeBase);
    url.searchParams.set('text', dto.address);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');
    url.searchParams.set('apiKey', this.apiKey);

    let data: {
      results?: Array<{ lat: number; lon: number; formatted: string }>;
    };
    try {
      const res = await fetch(url.toString());
      data = (await res.json()) as typeof data;
    } catch (err) {
      this.logger.error('Geocoding network error', err);
      throw new BadRequestException('Geocoding request failed.');
    }

    if (!data.results || data.results.length === 0) {
      throw new BadRequestException(
        `Could not geocode address: "${dto.address}"`,
      );
    }

    const first = data.results[0];
    return {
      lat: first.lat,
      lng: first.lon,
      formattedAddress: first.formatted,
    };
  }

  async getDirections(dto: DirectionsDto): Promise<DirectionsResult> {
    this.requireKey();

    if (dto.waypoints.length < 2) {
      throw new BadRequestException('At least two waypoints are required.');
    }

    const url = new URL(this.routingBase);
    const waypointsParam = dto.waypoints
      .map((wp) => `${wp.lat},${wp.lng}`)
      .join('|');
    url.searchParams.set('waypoints', waypointsParam);
    url.searchParams.set('mode', 'drive');
    url.searchParams.set('apiKey', this.apiKey);

    let data: {
      features?: Array<{
        properties: { distance: number; time: number };
        geometry: { coordinates: Array<[number, number]> };
      }>;
    };
    try {
      const res = await fetch(url.toString());
      data = (await res.json()) as typeof data;
    } catch (err) {
      this.logger.error('Directions network error', err);
      throw new BadRequestException('Directions request failed.');
    }

    if (!data.features || data.features.length === 0) {
      throw new BadRequestException('No route found for the given waypoints.');
    }

    const feature = data.features[0];
    const { distance, time } = feature.properties;

    return {
      polylinePoints: feature.geometry.coordinates,
      distanceKm: Math.round((distance / 1000) * 10) / 10,
      durationMin: Math.ceil(time / 60),
    };
  }
}
