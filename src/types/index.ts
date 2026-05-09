export interface District {
  Id: number;
  Name: string;
  Latitude: number;
  Longitude: number;
}

export interface City {
  cityId: number;
  cityName: string;
  districts: District[];
}

export interface RouteCoordinate {
  x: number; // longitude
  y: number; // latitude
}

export interface SpeedTunnel {
  id: number;
  name: string;
  provinceName: string;
  districtName: string | null;
  speedLimit: number;
  vehicleType: number;
  length: number;
  startLonX: number;
  startLatY: number;
  endLonX: number;
  endLatY: number;
  coordinates: RouteCoordinate[];
}

export interface RadarPoint {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
  radarType?: number;        // API'den gelen radar türü kodu
  controlPointTypeId?: number; // Kontrol noktası türü
  isRadarli?: boolean;       // Radar var mı (true) / kontrol noktası mı (false)
  speedLimit?: number;       // Varsa hız limiti
  [key: string]: unknown;
}

export interface CityBreakdown {
  City: string;
  Radarli: number;
  Radarsiz: number;
}

export interface RouteData {
  FromDistrict: string;
  ToDistrict: string;
  RadarCount: number;
  ControlPointCount: number;
  CorridorCount: number;
  Cities: CityBreakdown[];
  Radars: RadarPoint[];
  SpeedTunnels: SpeedTunnel[];
  Coordinates: RouteCoordinate[];
}

export interface RouteSelection {
  fromCity: City | null;
  fromDistrict: District | null;
  toCity: City | null;
  toDistrict: District | null;
}

export interface AlertSettings {
  enabled: boolean;
  soundEnabled: boolean;
  speechEnabled: boolean;
  distanceThreshold: number;
}

export interface FavoriteRoute {
  id: string;
  label: string;
  fromCityId: number;
  fromCityName: string;
  fromDistrictId: number;
  fromDistrictName: string;
  fromLatitude: number;
  fromLongitude: number;
  toCityId: number;
  toCityName: string;
  toDistrictId: number;
  toDistrictName: string;
  toLatitude: number;
  toLongitude: number;
}
