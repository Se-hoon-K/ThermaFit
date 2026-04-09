/**
 * Background fetch task — runs every ~30 minutes when the app is closed
 * to keep the home screen widget data fresh.
 *
 * IMPORTANT: TaskManager.defineTask must be called at module-load time.
 * This file is imported in index.js before registerRootComponent so the
 * task is always defined before the OS may wake it.
 */
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { loadLastQuery } from '../storage/locationStorage';
import { loadPreferences } from '../storage/preferencesStorage';
import { fetchWeather } from '../services/weatherService';
import { setCachedWeather } from '../storage/weatherCache';
import { getLayerSuggestion } from '../logic/layerEngine';
import { writeWidgetSnapshot } from '../storage/widgetBridge';

export const BACKGROUND_FETCH_TASK = 'thermafit-background-refresh';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const query = await loadLastQuery();
    if (!query) return BackgroundFetch.BackgroundFetchResult.NoData;

    const [prefs, weather] = await Promise.all([
      loadPreferences(),
      fetchWeather(query),
    ]);

    await setCachedWeather(query, weather);

    const suggestion = getLayerSuggestion(weather, prefs.sensitivity);
    await writeWidgetSnapshot({ weather, suggestion, preferences: prefs });

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundRefresh(): Promise<void> {
  const status = await BackgroundFetch.getStatusAsync();
  if (status !== BackgroundFetch.BackgroundFetchStatus.Available) return;

  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
  if (isRegistered) return;

  await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 30 * 60, // 30 minutes
    stopOnTerminate: false,
    startOnBoot: true,
  });
}
