export type WeatherCondition =
  | 'clear'
  | 'cloudy'
  | 'rain'
  | 'snow'
  | 'windy'
  | 'fog';

export interface WeatherData {
  tempC: number;
  feelsLikeC: number;
  condition: WeatherCondition;
  humidity: number;
  windSpeedKph: number;
  cityName: string;
  iconCode: string;
  rainProbability: number; // 0–1, from forecast endpoint
  fetchedAt: number; // Date.now() timestamp
}

export const CONDITION_ICONS: Record<WeatherCondition, string> = {
  clear: '☀️',
  cloudy: '☁️',
  rain: '🌧️',
  snow: '❄️',
  windy: '💨',
  fog: '🌫️',
};
