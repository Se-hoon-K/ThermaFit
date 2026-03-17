import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeatherData } from '../types/weather';
import { LayerSuggestion } from '../types/layers';
import { UserPreferences } from '../types/preferences';

const WIDGET_KEY = 'thermafit_widget_snapshot';

export interface WidgetSnapshot {
  weather: WeatherData;
  suggestion: LayerSuggestion;
  preferences: UserPreferences;
}

/**
 * Writes the latest data to shared storage so the home screen widget can read it.
 * On iOS this would also write to App Groups UserDefaults via a native module.
 * For now we use AsyncStorage as the cross-process bridge on Android and a
 * shared UserDefaults group on iOS (handled via the native widget extension).
 */
export async function writeWidgetSnapshot(snapshot: WidgetSnapshot): Promise<void> {
  try {
    await AsyncStorage.setItem(WIDGET_KEY, JSON.stringify(snapshot));
  } catch {
    // Non-critical — widget will just show stale data
  }
}

export async function readWidgetSnapshot(): Promise<WidgetSnapshot | null> {
  try {
    const raw = await AsyncStorage.getItem(WIDGET_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
