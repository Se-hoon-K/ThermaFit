import { useState, useEffect, useCallback } from 'react';
import { WeatherData } from '../types/weather';
import { fetchWeather } from '../services/weatherService';
import { Coords } from './useLocation';

export function useWeather(coords: Coords | null) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch_ = useCallback(async () => {
    if (!coords) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(coords.latitude, coords.longitude);
      setWeather(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'UNKNOWN';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [coords]);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  return { weather, error, loading, refresh: fetch_ };
}
