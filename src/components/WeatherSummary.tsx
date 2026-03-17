import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { WeatherData, CONDITION_ICONS } from '../types/weather';
import { Units } from '../types/preferences';
import { colors, spacing, fontSizes } from '../constants/theme';

interface Props {
  weather: WeatherData;
  units: Units;
}

function toDisplay(tempC: number, units: Units): string {
  if (units === 'imperial') {
    return `${Math.round(tempC * 9 / 5 + 32)}°F`;
  }
  return `${Math.round(tempC)}°C`;
}

export default function WeatherSummary({ weather, units }: Props) {
  const iconUrl = `https://openweathermap.org/img/wn/${weather.iconCode}@2x.png`;

  return (
    <View style={styles.container}>
      <View style={styles.mainRow}>
        <Text style={styles.temp}>{toDisplay(weather.tempC, units)}</Text>
        <Image source={{ uri: iconUrl }} style={styles.icon} />
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detail}>
          {CONDITION_ICONS[weather.condition]} {weather.condition}
        </Text>
        <Text style={styles.detail}>💧 {weather.humidity}%</Text>
        <Text style={styles.detail}>💨 {Math.round(weather.windSpeedKph)} km/h</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  temp: {
    fontSize: fontSizes.xxxl,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -2,
  },
  icon: {
    width: 64,
    height: 64,
  },
  detailRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  detail: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
});
