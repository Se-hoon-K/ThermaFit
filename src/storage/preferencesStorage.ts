import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences, DEFAULT_PREFERENCES } from '../types/preferences';
import { syncPreferences } from '../services/syncService';

const KEY = 'thermafit_preferences';

export async function loadPreferences(): Promise<UserPreferences> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(prefs));
  // Fire-and-forget — sync error must never break local save
  syncPreferences(prefs).catch(() => {});
}
