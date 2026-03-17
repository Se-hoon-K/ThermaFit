import Constants from 'expo-constants';
import { WeatherCondition, WeatherData } from '../types/weather';

const API_KEY: string =
  (Constants.expoConfig?.extra?.owmApiKey as string) ?? '';
const BASE = 'https://api.openweathermap.org/data/2.5';

function mapCondition(main: string, windKph: number): WeatherCondition {
  switch (main) {
    case 'Clear':
      return windKph > 40 ? 'windy' : 'clear';
    case 'Clouds':
      return windKph > 40 ? 'windy' : 'cloudy';
    case 'Rain':
    case 'Drizzle':
    case 'Thunderstorm':
      return 'rain';
    case 'Snow':
      return 'snow';
    case 'Mist':
    case 'Fog':
    case 'Haze':
    case 'Smoke':
      return 'fog';
    default:
      return windKph > 40 ? 'windy' : 'cloudy';
  }
}

export async function fetchWeather(
  lat: number,
  lon: number,
): Promise<WeatherData> {
  const [currentRes, forecastRes] = await Promise.all([
    fetch(
      `${BASE}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=en`,
    ),
    fetch(
      `${BASE}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&cnt=3`,
    ),
  ]);

  if (!currentRes.ok) {
    if (currentRes.status === 401) throw new Error('API_KEY_INVALID');
    throw new Error(`WEATHER_FETCH_FAILED:${currentRes.status}`);
  }

  const current = await currentRes.json();
  const windKph: number = (current.wind?.speed ?? 0) * 3.6;
  const owmMain: string = current.weather?.[0]?.main ?? 'Clouds';
  const condition = mapCondition(owmMain, windKph);

  let rainProbability = 0;
  if (forecastRes.ok) {
    const forecast = await forecastRes.json();
    const pops: number[] = (forecast.list ?? []).map(
      (entry: { pop?: number }) => entry.pop ?? 0,
    );
    rainProbability = pops.length > 0 ? Math.max(...pops) : 0;
  }

  return {
    tempC: current.main.temp,
    feelsLikeC: current.main.feels_like,
    condition,
    humidity: current.main.humidity,
    windSpeedKph: windKph,
    cityName: current.name ?? 'Unknown',
    iconCode: current.weather?.[0]?.icon ?? '01d',
    rainProbability,
    fetchedAt: Date.now(),
  };
}
