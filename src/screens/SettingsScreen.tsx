import React from 'react';
import {
  View,
  Text,
  Switch,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePreferences } from '../hooks/usePreferences';
import SensitivityPicker from '../components/SensitivityPicker';
import { Sensitivity } from '../types/preferences';
import { colors, spacing, fontSizes, radius } from '../constants/theme';

export default function SettingsScreen() {
  const { prefs, setPrefs } = usePreferences();

  const updateSensitivity = (s: Sensitivity) => {
    setPrefs({ ...prefs, sensitivity: s });
  };

  const toggleUnits = (val: boolean) => {
    setPrefs({ ...prefs, units: val ? 'imperial' : 'metric' });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Settings</Text>

        {/* Sensitivity */}
        <View style={styles.section}>
          <SensitivityPicker value={prefs.sensitivity} onChange={updateSensitivity} />
        </View>

        <View style={styles.divider} />

        {/* Units */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View>
              <Text style={styles.rowLabel}>Temperature units</Text>
              <Text style={styles.rowSub}>
                Currently showing {prefs.units === 'imperial' ? '°F' : '°C'}
              </Text>
            </View>
            <View style={styles.unitsToggle}>
              <Text style={[styles.unitLabel, prefs.units === 'metric' && styles.unitActive]}>
                °C
              </Text>
              <Switch
                value={prefs.units === 'imperial'}
                onValueChange={toggleUnits}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.text}
              />
              <Text style={[styles.unitLabel, prefs.units === 'imperial' && styles.unitActive]}>
                °F
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* How it works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How ThermaFit learns</Text>
          <Text style={styles.infoText}>
            After checking the weather, you&apos;ll occasionally be asked how the recommendation
            felt. Over time, ThermaFit auto-adjusts your sensitivity setting to give you
            increasingly accurate results.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  section: {
    paddingVertical: spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: fontSizes.md,
    color: colors.text,
    fontWeight: '600',
  },
  rowSub: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  unitsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  unitLabel: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    fontWeight: '600',
    width: 24,
    textAlign: 'center',
  },
  unitActive: {
    color: colors.primary,
  },
  infoText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
  },
});
