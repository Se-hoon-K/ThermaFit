import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { PreferencesProvider } from './src/hooks/usePreferences';
import RootNavigator from './src/navigation/RootNavigator';
import { registerBackgroundRefresh } from './src/tasks/backgroundRefresh';
import { initializeAuth, pullPreferences } from './src/services/syncService';

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

      // Initialize Supabase anonymous auth, then restore preferences from server
      // (handles "new device / reinstall" case — no-op when offline)
      const userId = await initializeAuth();
      if (userId) await pullPreferences();
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
