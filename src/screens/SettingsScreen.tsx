import React from 'react';
import {
  View,
  Text,
  Switch,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';
import { usePreferences } from '../hooks/usePreferences';
import { useAuth } from '../hooks/useAuth';
import SensitivityPicker from '../components/SensitivityPicker';
import { Sensitivity } from '../types/preferences';
import { colors, spacing, fontSizes, radius } from '../constants/theme';

export default function SettingsScreen() {
  const { prefs, setPrefs } = usePreferences();
  const {
    isAnonymous,
    provider,
    email,
    isLoading,
    appleAvailable,
    handleSignInWithApple,
    handleSignInWithGoogle,
    handleSignOut,
  } = useAuth();

  const updateSensitivity = (s: Sensitivity) => {
    setPrefs({ ...prefs, sensitivity: s });
  };

  const toggleUnits = (val: boolean) => {
    setPrefs({ ...prefs, units: val ? 'imperial' : 'metric' });
  };

  const confirmSignOut = () => {
    Alert.alert(
      'Sign out',
      'Your calibration data stays on the server. Local history will be cleared for privacy.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: handleSignOut },
      ],
    );
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

        {/* Account */}
        <View style={styles.section}>
          {isAnonymous ? (
            <>
              <Text style={styles.sectionTitle}>Back up &amp; restore</Text>
              <Text style={styles.infoText}>
                Sign in to save your calibration data to the cloud. Switching phones or
                reinstalling will restore everything automatically.
              </Text>

              {appleAvailable && Platform.OS === 'ios' && (
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                  cornerRadius={radius.md}
                  style={styles.appleButton}
                  onPress={handleSignInWithApple}
                />
              )}

              <TouchableOpacity
                style={[styles.googleButton, isLoading && styles.buttonDisabled]}
                onPress={handleSignInWithGoogle}
                disabled={isLoading}
                accessibilityLabel="Sign in with Google"
              >
                {isLoading
                  ? <ActivityIndicator color={colors.text} />
                  : <Text style={styles.googleButtonText}>Sign in with Google</Text>
                }
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Account</Text>
              <View style={styles.row}>
                <View>
                  <Text style={styles.rowLabel}>
                    {provider === 'apple' ? 'Apple' : 'Google'}
                  </Text>
                  <Text style={styles.rowSub}>
                    {email ?? 'Signed in — data backed up'}
                  </Text>
                </View>
                <TouchableOpacity onPress={confirmSignOut} accessibilityLabel="Sign out">
                  <Text style={styles.signOutText}>Sign out</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
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
  appleButton: {
    width: '100%',
    height: 44,
    marginTop: spacing.md,
  },
  googleButton: {
    width: '100%',
    height: 44,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  googleButtonText: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  signOutText: {
    fontSize: fontSizes.sm,
    color: colors.danger,
    fontWeight: '600',
  },
});
