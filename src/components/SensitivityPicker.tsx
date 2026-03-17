import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  Sensitivity,
  SENSITIVITY_EMOJIS,
  SENSITIVITY_DESCRIPTIONS,
} from '../types/preferences';
import { colors, spacing, fontSizes, radius } from '../constants/theme';

const SCALE: Sensitivity[] = [-2, -1, 0, 1, 2];

interface Props {
  value: Sensitivity;
  onChange: (s: Sensitivity) => void;
}

export default function SensitivityPicker({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>How do you feel the cold?</Text>
      <View style={styles.scale}>
        {SCALE.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.dot, value === s && styles.dotActive]}
            onPress={() => onChange(s)}
          >
            <Text style={styles.emoji}>{SENSITIVITY_EMOJIS[s]}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.description}>{SENSITIVITY_DESCRIPTIONS[value]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: fontSizes.md,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  scale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  dot: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dotActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}20`,
  },
  emoji: {
    fontSize: fontSizes.xl,
  },
  description: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
