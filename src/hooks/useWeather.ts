import { useState, useEffect, useCallback } from 'react';
import { WeatherData } from '../types/weather';
import { fetchWeather } from '../services/weatherService';
import { getCachedWeather, setCachedWeather } from '../storage/weatherCache';
import { saveLastQuery } from '../storage/locationStorage';
import { LocationState } from './useLocation';

export function useWeather(location: LocationState | null) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetch_ = useCallback(
    async (forceRefresh = false) => {
      if (!location) return;
      setLoading(true);
      setError(null);

      // Check cache first (unless user explicitly refreshed)
      if (!forceRefresh) {
        const cached = await getCachedWeather(location.query);
        if (cached) {
          setWeather(cached);
          setLoading(false);
          return;
        }
      }

      try {
        const data = await fetchWeather(location.query);
        setWeather(data);
        await setCachedWeather(location.query, data);
        await saveLastQuery(location.query);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'UNKNOWN';
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [location],
  );

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  const refresh = useCallback(() => fetch_(true), [fetch_]);

  return { weather, error, loading, refresh };
}
