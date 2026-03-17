import AsyncStorage from '@react-native-async-storage/async-storage';
import { FeedbackEntry, FeedbackOutcome, PendingFeedback } from '../types/feedback';
import { Sensitivity } from '../types/preferences';
import { loadPreferences, savePreferences } from './preferencesStorage';

const FEEDBACK_KEY = 'thermafit_feedback';
const PENDING_KEY = 'thermafit_pending_feedback';

// ─── Pending feedback ────────────────────────────────────────────────────────

export async function savePendingFeedback(pending: PendingFeedback): Promise<void> {
  await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

export async function loadPendingFeedback(): Promise<PendingFeedback | null> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function clearPendingFeedback(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_KEY);
}

// ─── Feedback history ────────────────────────────────────────────────────────

export async function loadFeedbackHistory(): Promise<FeedbackEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(FEEDBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveFeedbackHistory(entries: FeedbackEntry[]): Promise<void> {
  // Keep last 50 entries
  const trimmed = entries.slice(-50);
  await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify(trimmed));
}

// ─── Auto-calibration ────────────────────────────────────────────────────────

/**
 * Records a feedback outcome and auto-adjusts sensitivity if needed.
 * Returns a message if sensitivity was changed, otherwise null.
 */
export async function recordFeedback(
  pending: PendingFeedback,
  outcome: FeedbackOutcome,
): Promise<string | null> {
  const entry: FeedbackEntry = {
    id: pending.id,
    date: new Date().toISOString(),
    tempC: pending.tempC,
    sensitivity: pending.sensitivity,
    outcome,
  };

  const history = await loadFeedbackHistory();
  history.push(entry);
  await saveFeedbackHistory(history);
  await clearPendingFeedback();

  // Analyze last 5 entries
  const last5 = history.slice(-5);
  if (last5.length < 3) return null;

  const coldCount = last5.filter((e) => e.outcome === 'cold').length;
  const warmCount = last5.filter((e) => e.outcome === 'warm').length;

  const prefs = await loadPreferences();
  const current = prefs.sensitivity as Sensitivity;

  if (coldCount >= 3 && current > -2) {
    const newSensitivity = (current - 1) as Sensitivity;
    await savePreferences({ ...prefs, sensitivity: newSensitivity });
    return 'We nudged your temperature sensitivity cooler based on your recent feedback.';
  }

  if (warmCount >= 3 && current < 2) {
    const newSensitivity = (current + 1) as Sensitivity;
    await savePreferences({ ...prefs, sensitivity: newSensitivity });
    return 'We nudged your temperature sensitivity warmer based on your recent feedback.';
  }

  return null;
}
