import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSizes, radius } from '../constants/theme';

export default function UmbrellaTip() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🌂 Rain likely later — bring an umbrella</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${colors.umbrella}20`,
    borderLeftWidth: 3,
    borderLeftColor: colors.umbrella,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginVertical: spacing.sm,
    width: '100%',
  },
  text: {
    color: colors.umbrella,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
});
