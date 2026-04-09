import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from './supabaseClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AccountInfo =
  | { status: 'anonymous' }
  | { status: 'authenticated'; provider: 'apple' | 'google'; email: string | null };

// ─── Setup ────────────────────────────────────────────────────────────────────

/**
 * Configure Google Sign In. Call once in App.tsx before any sign-in attempt.
 * webClientId comes from EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in .env.
 */
export function configureGoogleSignIn(webClientId: string): void {
  if (!webClientId) return;
  GoogleSignin.configure({ webClientId, offlineAccess: false });
}

// ─── Account info ─────────────────────────────────────────────────────────────

/**
 * Returns the current account state: anonymous or authenticated with provider + email.
 */
export async function getAccountInfo(): Promise<AccountInfo> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.is_anonymous) return { status: 'anonymous' };

    // Find the non-anonymous identity to determine provider
    const identity = user.identities?.find(
      (id) => id.provider === 'apple' || id.provider === 'google',
    );
    const provider = (identity?.provider ?? 'apple') as 'apple' | 'google';
    return { status: 'authenticated', provider, email: user.email ?? null };
  } catch {
    return { status: 'anonymous' };
  }
}

// ─── Apple Sign In ────────────────────────────────────────────────────────────

/**
 * Sign in or link with Apple.
 * - Anonymous session active → links identity, user_id preserved (no data loss)
 * - New device / no session → restores existing authenticated session
 * Both cases call signInWithIdToken; Supabase handles the distinction automatically
 * when "Allow manual linking" is enabled in the dashboard.
 */
export async function signInWithApple(): Promise<void> {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) throw new Error('Apple did not return an identity token.');

  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
  });

  if (error) throw error;
}

// ─── Google Sign In ───────────────────────────────────────────────────────────

/**
 * Sign in or link with Google. Same dual-purpose logic as signInWithApple.
 */
export async function signInWithGoogle(): Promise<void> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const { data } = await GoogleSignin.signIn();

  const idToken = data?.idToken;
  if (!idToken) throw new Error('Google did not return an ID token.');

  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });

  if (error) throw error;
}

// ─── Sign out ─────────────────────────────────────────────────────────────────

/**
 * Signs the user out:
 * 1. Clears all local AsyncStorage data (privacy)
 * 2. Signs out from Google (no-op if not signed in)
 * 3. Signs out from Supabase (SDK removes SecureStore session)
 *
 * After calling this, the caller should run initializeAuth() to create
 * a new anonymous session.
 */
export async function signOut(): Promise<void> {
  // Clear local data first — so a crash later doesn't leave stale data behind
  await AsyncStorage.multiRemove([
    'thermafit_feedback',
    'thermafit_preferences',
    'thermafit_pending_feedback',
    'thermafit_last_query',
    'thermafit_manual_location',
    'thermafit_weather_cache',
    'thermafit_widget_snapshot',
  ]);

  // Google sign-out is a no-op if the user signed in with Apple
  try {
    await GoogleSignin.signOut();
  } catch {
    // Safe to ignore — not signed in with Google
  }

  await supabase.auth.signOut();
}

// ─── Error classifier ─────────────────────────────────────────────────────────

/**
 * Maps raw errors from Apple/Google/Supabase to user-friendly messages.
 * Returns null if the error should be silently ignored (user cancelled).
 */
export function classifyAuthError(e: unknown): string | null {
  if (e instanceof Error) {
    // User cancelled — don't show anything
    if (e.message.includes('ERR_CANCELED')) return null;
    if ((e as { code?: string }).code === statusCodes.SIGN_IN_CANCELLED) return null;
    if (e.message.includes('AppleAuthenticationUserCancelledError')) return null;

    // Identity already linked to a different account
    if (e.message.includes('already been linked')) {
      return 'This account is already linked to a different ThermaFit profile.';
    }
  }

  return "Couldn't connect. Check your connection and try again.";
}
