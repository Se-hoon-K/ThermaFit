import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Layer } from '../types/layers';
import { colors, spacing, fontSizes, radius } from '../constants/theme';

export default function LayerItem({ layer }: { layer: Layer }) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{layer.emoji}</Text>
      <Text style={styles.label}>{layer.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  emoji: {
    fontSize: fontSizes.xl,
  },
  label: {
    fontSize: fontSizes.md,
    color: colors.text,
    fontWeight: '500',
  },
});
