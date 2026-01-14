export interface WeatherData {
  locationName: string;
  temperature: string;
  condition: string;
  humidity: string;
  windSpeed: string;
  sourceUrl?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}
