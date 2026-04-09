import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { loadManualLocation } from '../storage/locationStorage';

export type LocationSource = 'gps' | 'manual';

export interface LocationState {
  query: string;         // "lat,lon" or city name — passed directly to WeatherAPI
  source: LocationSource;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const requestGPS = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return false;

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation({
        query: `${loc.coords.latitude},${loc.coords.longitude}`,
        source: 'gps',
      });
      setError(null);
      return true;
    } catch {
      return false;
    }
  }, []);

  const init = useCallback(async () => {
    setLoading(true);
    const gpsOk = await requestGPS();

    if (!gpsOk) {
      // GPS failed — try saved manual location
      const saved = await loadManualLocation();
      if (saved) {
        setLocation({ query: saved, source: 'manual' });
        setError(null);
      } else {
        // No fallback — prompt user to enter one
        setError('LOCATION_UNAVAILABLE');
      }
    }
    setLoading(false);
  }, [requestGPS]);

  useEffect(() => {
    init();
  }, [init]);

  const setManualLocation = useCallback((query: string) => {
    setLocation({ query, source: 'manual' });
    setError(null);
  }, []);

  const retryGPS = useCallback(async () => {
    setLoading(true);
    const ok = await requestGPS();
    if (!ok) {
      const saved = await loadManualLocation();
      if (saved) {
        setLocation({ query: saved, source: 'manual' });
      } else {
        setError('LOCATION_UNAVAILABLE');
      }
    }
    setLoading(false);
  }, [requestGPS]);

  return { location, error, loading, setManualLocation, retryGPS };
}
