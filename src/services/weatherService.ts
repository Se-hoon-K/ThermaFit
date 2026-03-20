import { WeatherCondition, WeatherData } from '../types/weather';

const API_KEY: string = process.env.EXPO_PUBLIC_WEATHER_API_KEY ?? '';
const BASE = 'https://api.weatherapi.com/v1';

// WeatherAPI condition codes → our WeatherCondition type
// Full list: https://www.weatherapi.com/docs/weather_conditions.json
function mapCondition(code: number, windKph: number): WeatherCondition {
  // Clear
  if (code === 1000) return windKph > 40 ? 'windy' : 'clear';
  // Partly cloudy / Cloudy / Overcast
  if (code === 1003 || code === 1006 || code === 1009)
    return windKph > 40 ? 'windy' : 'cloudy';
  // Fog / Mist / Freezing fog
  if (code === 1030 || code === 1135 || code === 1147) return 'fog';
  // Rain: drizzle, rain, freezing drizzle, sleet showers, thunderstorm with rain
  if (
    (code >= 1063 && code <= 1072) ||
    (code >= 1150 && code <= 1201) ||
    (code >= 1240 && code <= 1246) ||
    code === 1273 ||
    code === 1276
  )
    return 'rain';
  // Snow: blizzard, snow, ice pellets, snow showers, thunderstorm with snow
  if (
    code === 1066 ||
    code === 1069 ||
    code === 1114 ||
    code === 1117 ||
    (code >= 1204 && code <= 1237) ||
    (code >= 1255 && code <= 1264) ||
    code === 1279 ||
    code === 1282
  )
    return 'snow';
  // Fallback
  return windKph > 40 ? 'windy' : 'cloudy';
}

export async function fetchWeather(
  lat: number,
  lon: number,
): Promise<WeatherData> {
  const url =
    `${BASE}/forecast.json?key=${API_KEY}&q=${lat},${lon}&days=1&aqi=no&alerts=no`;

  const res = await fetch(url);

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) throw new Error('API_KEY_INVALID');
    throw new Error(`WEATHER_FETCH_FAILED:${res.status}`);
  }

  const json = await res.json();

  const current = json.current;
  const location = json.location;
  const windKph: number = current.wind_kph ?? 0;
  const condCode: number = current.condition?.code ?? 1009;
  const condition = mapCondition(condCode, windKph);

  // Rain probability: max chance_of_rain from the next 9 hours
  const now = Date.now();
  const hours: { time: string; chance_of_rain: number }[] =
    json.forecast?.forecastday?.[0]?.hour ?? [];
  const nextNineHours = hours.filter(
    (h) => new Date(h.time).getTime() >= now,
  ).slice(0, 9);
  const rainProbability =
    nextNineHours.length > 0
      ? Math.max(...nextNineHours.map((h) => h.chance_of_rain)) / 100
      : 0;

  // Icon URL — WeatherAPI returns protocol-relative URLs like "//cdn.weatherapi.com/..."
  const rawIcon: string = current.condition?.icon ?? '//cdn.weatherapi.com/weather/64x64/day/116.png';
  const iconUrl = rawIcon.startsWith('//') ? `https:${rawIcon}` : rawIcon;

  return {
    tempC: current.temp_c,
    feelsLikeC: current.feelslike_c,
    condition,
    humidity: current.humidity,
    windSpeedKph: windKph,
    cityName: location.name ?? 'Unknown',
    iconUrl,
    rainProbability,
    fetchedAt: Date.now(),
  };
}
