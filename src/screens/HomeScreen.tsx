import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
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
import { colors, spacing, fontSizes } from '../constants/theme';

const FEEDBACK_DELAY_MS = 4 * 60 * 60 * 1000; // 4 hours

export default function HomeScreen() {
  const { coords, error: locError, loading: locLoading, retry: retryLoc } = useLocation();
  const { weather, error: weatherError, loading: weatherLoading, refresh } = useWeather(coords);
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

  // Record a pending feedback entry and check if we should show the prompt
  useEffect(() => {
    if (!weather) return;

    const pending: PendingFeedback = {
      id: `${Date.now()}`,
      recordedAt: Date.now(),
      tempC: weather.tempC,
      sensitivity: prefs.sensitivity,
    };
    savePendingFeedback(pending);
    setPendingFeedback(pending);

    // Check for a previous pending entry that is now ≥4h old
    loadPendingFeedback().then((p) => {
      if (p && Date.now() - p.recordedAt >= FEEDBACK_DELAY_MS) {
        setPendingFeedback(p);
        setShowFeedback(true);
      }
    });
  }, [weather?.fetchedAt]);

  const handleFeedbackAnswer = async (outcome: 'cold' | 'ok' | 'warm') => {
    setShowFeedback(false);
    if (!pendingFeedback) return;
    const message = await recordFeedback(pendingFeedback, outcome);
    if (message) {
      Alert.alert('ThermaFit updated', message);
    }
  };

  const isLoading = locLoading || weatherLoading;
  const error = locError ?? weatherError;

  if (isLoading && !weather) {
    return (
      <SafeAreaView style={styles.safe}>
        <LoadingState message={locLoading ? 'Finding your location…' : 'Getting weather…'} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Location header */}
        <View style={styles.locationRow}>
          <Text style={styles.locationPin}>📍</Text>
          <Text style={styles.cityName}>{weather?.cityName ?? '…'}</Text>
        </View>

        {/* Error banner */}
        {error && (
          <ErrorBanner error={error} onRetry={error === 'PERMISSION_DENIED' ? undefined : () => { retryLoc(); refresh(); }} />
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
