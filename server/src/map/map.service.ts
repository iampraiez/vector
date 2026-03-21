import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeocodeDto, DirectionsDto, ReverseGeocodeDto } from './dto/map.dto';

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

interface GeoapifyOptimizationAction {
  type: 'pickup' | 'delivery' | 'start' | 'end';
  shipment_id?: string;
  location_index: number;
}

interface GeoapifyOptimizationResponse {
  features: Array<{
    properties: {
      actions: GeoapifyOptimizationAction[];
    };
  }>;
}

@Injectable()
export class MapService {
  private readonly logger = new Logger(MapService.name);
  private readonly apiKey: string;
  private readonly geocodeBase = 'https://api.geoapify.com/v1/geocode/search';
  private readonly reverseGeocodeBase =
    'https://api.geoapify.com/v1/geocode/reverse';
  private readonly routingBase = 'https://api.geoapify.com/v1/routing';
  private readonly optimizationBase =
    'https://api.geoapify.com/v1/routeoptimization';

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
    if (dto.filter) url.searchParams.set('filter', dto.filter);
    if (dto.bias) url.searchParams.set('bias', dto.bias);
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

  async reverseGeocode(dto: ReverseGeocodeDto): Promise<GeocodeResult> {
    this.requireKey();

    const url = new URL(this.reverseGeocodeBase);
    url.searchParams.set('lat', dto.lat.toString());
    url.searchParams.set('lon', dto.lng.toString());
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
      this.logger.error('Reverse geocoding network error', err);
      throw new BadRequestException('Reverse geocoding request failed.');
    }

    if (!data.results || data.results.length === 0) {
      throw new BadRequestException(
        `Could not reverse geocode coordinates: ${dto.lat}, ${dto.lng}`,
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

  async optimizeRoute(
    agentLocation: { lat: number; lng: number },
    stops: Array<{ id: string; lat: number; lng: number }>,
  ): Promise<string[]> {
    this.requireKey();

    if (stops.length === 0) return [];
    if (stops.length === 1) return [stops[0].id];

    const body = {
      mode: 'drive',
      agents: [
        {
          start_location: [agentLocation.lng, agentLocation.lat],
          id: 'agent_1',
        },
      ],
      shipments: stops.map((s) => ({
        id: s.id,
        pickup: {
          location: [s.lng, s.lat],
        },
        delivery: {
          location: [s.lng, s.lat],
        },
      })),
    };

    const url = `${this.optimizationBase}?apiKey=${this.apiKey}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = (await res.json()) as GeoapifyOptimizationResponse;
      if (!data.features || data.features.length === 0) {
        throw new BadRequestException('Route optimization failed.');
      }

      const actions = data.features[0].properties.actions;
      const sequence = actions
        .filter((a) => a.type === 'pickup' && a.shipment_id)
        .map((a) => a.shipment_id as string);

      return sequence;
    } catch (err) {
      this.logger.error('Optimization network error', err);
      throw new BadRequestException('Optimization request failed.');
    }
  }
}
