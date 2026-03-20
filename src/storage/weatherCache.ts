import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeatherData } from '../types/weather';

const CACHE_KEY = 'thermafit_weather_cache';
const TTL_MS = 30 * 60 * 1000; // 30 minutes
const COORD_THRESHOLD = 0.01; // ~1 km

interface CachedWeather {
  data: WeatherData;
  lat: number;
  lon: number;
}

export async function getCachedWeather(
  lat: number,
  lon: number,
): Promise<WeatherData | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedWeather = JSON.parse(raw);

    const isFresh = Date.now() - cached.data.fetchedAt < TTL_MS;
    const isNearby =
      Math.abs(cached.lat - lat) < COORD_THRESHOLD &&
      Math.abs(cached.lon - lon) < COORD_THRESHOLD;

    return isFresh && isNearby ? cached.data : null;
  } catch {
    return null;
  }
}

export async function setCachedWeather(
  lat: number,
  lon: number,
  data: WeatherData,
): Promise<void> {
  try {
    const cached: CachedWeather = { data, lat, lon };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch {
    // Non-critical
  }
}
