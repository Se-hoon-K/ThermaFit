import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocation } from '../hooks/useLocation';
import { useWeather } from '../hooks/useWeather';
import { usePreferences } from '../hooks/usePreferences';
import { getLayerSuggestion } from '../logic/layerEngine';
import { writeWidgetSnapshot } from '../storage/widgetBridge';
import {
  savePendingFeedback,
  loadPendingFeedback,
  recordFeedback,
} from '../storage/feedbackStorage';
import { PendingFeedback } from '../types/feedback';
import WeatherSummary from '../components/WeatherSummary';
import LayerList from '../components/LayerList';
import UmbrellaTip from '../components/UmbrellaTip';
import LoadingState from '../components/LoadingState';
import ErrorBanner from '../components/ErrorBanner';
import FeedbackPrompt from '../components/FeedbackPrompt';
import ManualLocationInput from '../components/ManualLocationInput';
import { colors, spacing, fontSizes } from '../constants/theme';

const FEEDBACK_DELAY_MS = 4 * 60 * 60 * 1000; // 4 hours

export default function HomeScreen() {
  const { location, error: locError, loading: locLoading, setManualLocation, retryGPS } = useLocation();
  const { weather, error: weatherError, loading: weatherLoading, refresh } = useWeather(location);
  const { prefs } = usePreferences();

  const [showFeedback, setShowFeedback] = useState(false);
  const [pendingFeedback, setPendingFeedback] = useState<PendingFeedback | null>(null);

  const suggestion = useMemo(() => {
    if (!weather) return null;
    return getLayerSuggestion(weather, prefs.sensitivity);
  }, [weather, prefs.sensitivity]);

  // Save widget snapshot whenever data updates
  useEffect(() => {
    if (weather && suggestion) {
      writeWidgetSnapshot({ weather, suggestion, preferences: prefs });
    }
  }, [weather, suggestion, prefs]);

  // Record pending feedback, schedule a notification, and show prompt if 4 h elapsed
  useEffect(() => {
    if (!weather) return;

    const now = Date.now();
    const pending: PendingFeedback = {
      id: `${now}`,
      recordedAt: now,
      tempC: weather.tempC,
      sensitivity: prefs.sensitivity,
    };

    savePendingFeedback(pending);
    setPendingFeedback(pending);

    // Schedule "How was it?" notification for 4 hours from now
    Notifications.cancelAllScheduledNotificationsAsync().then(() =>
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'ThermaFit',
          body: 'How was your outfit today?',
          data: { action: 'feedback' },
          ...(require('react-native').Platform.OS === 'android' && {
            channelId: 'feedback',
          }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: FEEDBACK_DELAY_MS / 1000,
          repeats: false,
        },
      }).catch(() => {
        // Notification permission not granted — in-app fallback handles it
      }),
    );

    // Show in-app prompt if the previous pending record is ≥ 4 h old
    loadPendingFeedback().then((p) => {
      if (p && now - p.recordedAt >= FEEDBACK_DELAY_MS) {
        setPendingFeedback(p);
        setShowFeedback(true);
      }
    });
  }, [weather?.fetchedAt]);

  const handleFeedbackAnswer = async (outcome: 'cold' | 'ok' | 'warm') => {
    setShowFeedback(false);
    if (!pendingFeedback) return;
    const message = await recordFeedback(pendingFeedback, outcome);
    if (message) Alert.alert('ThermaFit updated', message);
  };

  // Show loading while getting location or weather (and nothing to show yet)
  if ((locLoading || weatherLoading) && !weather) {
    return (
      <SafeAreaView style={styles.safe}>
        <LoadingState message={locLoading ? 'Finding your location…' : 'Getting weather…'} />
      </SafeAreaView>
    );
  }

  // GPS failed and no manual fallback saved — show city input
  if (locError === 'LOCATION_UNAVAILABLE' && !weather) {
    return (
      <ManualLocationInput
        onConfirm={setManualLocation}
        onRetryGPS={retryGPS}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Location header */}
        <View style={styles.locationRow}>
          <Text style={styles.locationPin}>
            {location?.source === 'manual' ? '🔍' : '📍'}
          </Text>
          <Text style={styles.cityName}>{weather?.cityName ?? '…'}</Text>
          {location?.source === 'manual' && (
            <TouchableOpacity onPress={retryGPS} style={styles.gpsRetry}>
              <Text style={styles.gpsRetryText}>Use GPS</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Weather error banner (not location error — that's handled above) */}
        {weatherError && (
          <ErrorBanner error={weatherError} onRetry={refresh} />
        )}

        {/* Weather summary */}
        {weather && <WeatherSummary weather={weather} units={prefs.units} />}

        {/* Umbrella tip */}
        {suggestion?.showUmbrellaTip && <UmbrellaTip />}

        {/* Layer recommendations */}
        {suggestion && weather && (
          <LayerList
            layers={suggestion.layers}
            personalFeelsLike={suggestion.personalFeelsLike}
            units={prefs.units}
          />
        )}

        {/* Refresh */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={refresh}
          disabled={weatherLoading}
        >
          <Text style={styles.refreshText}>
            {weatherLoading ? '⏳ Updating…' : '↻ Refresh'}
          </Text>
        </TouchableOpacity>

        {/* Last updated */}
        {weather && (
          <Text style={styles.updated}>
            Updated {new Date(weather.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </ScrollView>

      <FeedbackPrompt
        visible={showFeedback}
        onAnswer={handleFeedbackAnswer}
        onDismiss={() => setShowFeedback(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  locationPin: {
    fontSize: fontSizes.md,
  },
  cityName: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  gpsRetry: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gpsRetryText: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  refreshButton: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  refreshText: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  updated: {
    marginTop: spacing.sm,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
});
