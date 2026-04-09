import { NativeModules, Platform } from 'react-native';

/**
 * Writes a JSON string to the shared App Group UserDefaults so the
 * ThermaFitWidget WidgetKit extension can read it.
 * No-op on Android (AsyncStorage is the bridge there) and in Expo Go.
 */
export async function setAppGroupWidgetData(json: string): Promise<void> {
  if (Platform.OS !== 'ios') return;
  const bridge = NativeModules.AppGroupBridge;
  if (!bridge) return;
  await bridge.setWidgetData(json);
}
