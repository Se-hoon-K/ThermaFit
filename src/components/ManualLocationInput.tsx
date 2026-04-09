import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { saveManualLocation } from '../storage/locationStorage';
import { colors, spacing, fontSizes, radius } from '../constants/theme';

interface Props {
  onConfirm: (query: string) => void;
  onRetryGPS: () => void;
}

export default function ManualLocationInput({ onConfirm, onRetryGPS }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Please enter a city name');
      return;
    }
    await saveManualLocation(trimmed);
    onConfirm(trimmed);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Text style={styles.icon}>📍</Text>
      <Text style={styles.title}>Location unavailable</Text>
      <Text style={styles.subtitle}>
        GPS couldn't get your location. Enter a city to get started.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. Amsterdam, London, New York"
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={(t) => { setValue(t); setError(''); }}
        onSubmitEditing={handleConfirm}
        returnKeyType="search"
        autoCapitalize="words"
        autoCorrect={false}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleConfirm}>
        <Text style={styles.buttonText}>Get weather</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.retryLink} onPress={onRetryGPS}>
        <Text style={styles.retryText}>Try GPS again</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.background,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  input: {
    width: '100%',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSizes.md,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  error: {
    fontSize: fontSizes.sm,
    color: colors.danger,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  button: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
  },
  retryLink: {
    marginTop: spacing.lg,
  },
  retryText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
