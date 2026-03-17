import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Layer } from '../types/layers';
import LayerItem from './LayerItem';
import { colors, spacing, fontSizes } from '../constants/theme';

interface Props {
  layers: Layer[];
  personalFeelsLike: number;
  units: 'metric' | 'imperial';
}

function displayTemp(c: number, units: 'metric' | 'imperial'): string {
  if (units === 'imperial') return `${Math.round(c * 9 / 5 + 32)}°F`;
  return `${c}°C`;
}

export default function LayerList({ layers, personalFeelsLike, units }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.feelsLike}>
        Feels like {displayTemp(personalFeelsLike, units)} for you
      </Text>
      <Text style={styles.heading}>What to wear:</Text>
      {layers.map((layer, i) => (
        <LayerItem key={i} layer={layer} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: spacing.md,
  },
  feelsLike: {
    fontSize: fontSizes.md,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  heading: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
});
