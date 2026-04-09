import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { PreferencesProvider } from './src/hooks/usePreferences';
import RootNavigator from './src/navigation/RootNavigator';
import { registerBackgroundRefresh } from './src/tasks/backgroundRefresh';
import {
  initializeAuth,
  pullPreferences,
  pullFeedbackHistory,
  pushAllFeedbackHistory,
  runServerCalibration,
} from './src/services/syncService';
import { configureGoogleSignIn } from './src/services/authService';

// Show notifications as banners even when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  useEffect(() => {
    // Configure Google Sign In before any auth calls
    configureGoogleSignIn(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '');

    async function setup() {
      // Create Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('feedback', {
          name: 'Outfit feedback',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250],
        });
      }

      // Request notification permissions (iOS prompts; Android 13+ also prompts)
      await Notifications.requestPermissionsAsync();

      // Register background weather refresh
      await registerBackgroundRefresh();

      // Initialize Supabase anonymous auth, then run the full sync pipeline:
      // 1. Restore preferences on new device / reinstall
      // 2. Restore feedback history so calibration has context
      // 3. Push any local entries recorded before Supabase was connected
      // 4. Run server-side calibration on full history (stronger signal than 5 local)
      const userId = await initializeAuth();
      if (userId) {
        await pullPreferences();
        await pullFeedbackHistory();
        await pushAllFeedbackHistory();
        const calibrationMsg = await runServerCalibration();
        if (calibrationMsg) {
          // Lazy import to avoid circular dependency at module load time
          const { Alert } = await import('react-native');
          Alert.alert('ThermaFit updated', calibrationMsg);
        }
      }
    }

    setup();
  }, []);

  return (
    <SafeAreaProvider>
      <PreferencesProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </PreferencesProvider>
    </SafeAreaProvider>
  );
}
