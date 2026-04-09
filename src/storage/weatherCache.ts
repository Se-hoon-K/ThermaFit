import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeatherData } from '../types/weather';

const CACHE_KEY = 'thermafit_weather_cache';
const TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CachedWeather {
  query: string;
  data: WeatherData;
}

export async function getCachedWeather(query: string): Promise<WeatherData | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedWeather = JSON.parse(raw);

    const isFresh = Date.now() - cached.data.fetchedAt < TTL_MS;
    const isSameLocation = cached.query === query;

    return isFresh && isSameLocation ? cached.data : null;
  } catch {
    return null;
  }
}

export async function setCachedWeather(query: string, data: WeatherData): Promise<void> {
  try {
    const cached: CachedWeather = { query, data };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch {
    // Non-critical
  }
}
