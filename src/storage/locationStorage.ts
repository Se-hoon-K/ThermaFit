import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'thermafit_manual_location';
const LAST_QUERY_KEY = 'thermafit_last_query';

export async function loadManualLocation(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export async function saveManualLocation(query: string): Promise<void> {
  await AsyncStorage.setItem(KEY, query);
}

export async function clearManualLocation(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

/** Persists the last successfully-used location query for background refresh tasks. */
export async function saveLastQuery(query: string): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_QUERY_KEY, query);
  } catch {
    // Non-critical
  }
}

export async function loadLastQuery(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LAST_QUERY_KEY);
  } catch {
    return null;
  }
}
