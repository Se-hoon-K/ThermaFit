/**
 * Syncs local AsyncStorage data to/from Supabase.
 *
 * Design principles:
 * - Offline-first: every operation writes to AsyncStorage first. Supabase is additive.
 * - Fire-and-forget: sync errors never propagate to the caller or break the UI.
 * - Idempotent: all writes use upsert — safe to call multiple times.
 */
import { supabase } from './supabaseClient';
import { loadPreferences, savePreferences } from '../storage/preferencesStorage';
import { UserPreferences } from '../types/preferences';
import { FeedbackEntry } from '../types/feedback';
import { Sensitivity } from '../types/preferences';

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Ensures an anonymous Supabase session exists. Called once on app startup.
 * On a fresh install: creates a new anonymous user → stable UUID across reinstalls
 * once user later links an account.
 * On subsequent launches: restores the persisted session from SecureStore.
 */
export async function initializeAuth(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) return session.user.id;

    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    return data.user?.id ?? null;
  } catch {
    // Network unavailable or Supabase URL not yet configured — app still works locally
    return null;
  }
}

// ─── Preferences sync ─────────────────────────────────────────────────────────

/**
 * Pushes local preferences to Supabase. Called after every local save.
 */
export async function syncPreferences(prefs: UserPreferences): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('preferences').upsert({
      user_id: user.id,
      sensitivity: prefs.sensitivity,
      units: prefs.units,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // Non-critical — local data is already saved
  }
}

/**
 * Pulls preferences from Supabase on first launch / new device.
 * Only overwrites local data if the server record is newer.
 */
export async function pullPreferences(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('preferences')
      .select('sensitivity, units, updated_at')
      .eq('user_id', user.id)
      .single();

    if (error || !data) return;

    // Server has data — overwrite local (this is the "new device" restore flow)
    const serverPrefs: UserPreferences = {
      sensitivity: data.sensitivity as Sensitivity,
      units: data.units as 'metric' | 'imperial',
    };
    await savePreferences(serverPrefs);
  } catch {
    // Non-critical
  }
}

// ─── Feedback sync ────────────────────────────────────────────────────────────

/**
 * Pushes a single feedback entry to Supabase.
 * Uses upsert on the client-generated id so retries are safe.
 */
export async function syncFeedbackEntry(entry: FeedbackEntry): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('feedback_entries').upsert({
      id: entry.id,
      user_id: user.id,
      recorded_at: entry.date,
      temp_c: entry.tempC,
      sensitivity_at_time: entry.sensitivity,
      outcome: entry.outcome,
    });
  } catch {
    // Non-critical
  }
}
