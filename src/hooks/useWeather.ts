import { useState, useEffect, useCallback } from 'react';
import { WeatherData } from '../types/weather';
import { fetchWeather } from '../services/weatherService';
import { getCachedWeather, setCachedWeather } from '../storage/weatherCache';
import { Coords } from './useLocation';

export function useWeather(coords: Coords | null) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch_ = useCallback(
    async (forceRefresh = false) => {
      if (!coords) return;
      setLoading(true);
      setError(null);

      // Check cache first (unless user explicitly refreshed)
      if (!forceRefresh) {
        const cached = await getCachedWeather(coords.latitude, coords.longitude);
        if (cached) {
          setWeather(cached);
          setLoading(false);
          return;
        }
      }

      try {
        const data = await fetchWeather(coords.latitude, coords.longitude);
        setWeather(data);
        await setCachedWeather(coords.latitude, coords.longitude, data);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'UNKNOWN';
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [coords],
  );

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  // refresh() always bypasses cache
  const refresh = useCallback(() => fetch_(true), [fetch_]);

  return { weather, error, loading, refresh };
}
