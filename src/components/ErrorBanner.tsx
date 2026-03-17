import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, fontSizes, radius } from '../constants/theme';

interface Props {
  error: string;
  onRetry?: () => void;
}

function getErrorMessage(error: string): string {
  if (error === 'PERMISSION_DENIED')
    return 'Location access denied. Please enable it in Settings.';
  if (error === 'LOCATION_FAILED') return 'Could not get your location. Tap to retry.';
  if (error === 'API_KEY_INVALID') return 'Weather API key is invalid. Check configuration.';
  if (error.startsWith('WEATHER_FETCH_FAILED')) return 'Could not fetch weather. Tap to retry.';
  return 'Something went wrong. Tap to retry.';
}

export default function ErrorBanner({ error, onRetry }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{getErrorMessage(error)}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${colors.danger}20`,
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
    borderRadius: radius.sm,
    padding: spacing.md,
    margin: spacing.md,
    gap: spacing.sm,
  },
  text: {
    color: colors.danger,
    fontSize: fontSizes.sm,
    fontWeight: '500',
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  buttonText: {
    color: colors.text,
    fontSize: fontSizes.sm,
    fontWeight: '700',
  },
});
