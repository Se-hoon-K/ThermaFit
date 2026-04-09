import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  savePendingFeedback,
  loadPendingFeedback,
  clearPendingFeedback,
  loadFeedbackHistory,
  recordFeedback,
} from '../../storage/feedbackStorage';
import { PendingFeedback, FeedbackOutcome, FeedbackEntry } from '../../types/feedback';
import { Sensitivity } from '../../types/preferences';
import { loadPreferences } from '../../storage/preferencesStorage';

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

function makePending(overrides: Partial<PendingFeedback> = {}): PendingFeedback {
  return {
    id: 'test-id',
    recordedAt: Date.now(),
    tempC: 15,
    sensitivity: 0,
    ...overrides,
  };
}

async function seedHistory(outcomes: FeedbackOutcome[], sensitivity: Sensitivity = 0) {
  const entries: FeedbackEntry[] = outcomes.map((outcome, i) => ({
    id: `entry-${i}`,
    date: new Date().toISOString(),
    tempC: 15,
    sensitivity,
    outcome,
  }));
  await AsyncStorage.setItem('thermafit_feedback', JSON.stringify(entries));
}

// ─── Pending feedback ─────────────────────────────────────────────────────────

describe('pending feedback operations', () => {
  it('returns null when nothing stored', async () => {
    expect(await loadPendingFeedback()).toBeNull();
  });

  it('save/load round-trip works', async () => {
    const pending = makePending();
    await savePendingFeedback(pending);
    const loaded = await loadPendingFeedback();
    expect(loaded).toEqual(pending);
  });

  it('clearPendingFeedback removes the stored item', async () => {
    await savePendingFeedback(makePending());
    await clearPendingFeedback();
    expect(await loadPendingFeedback()).toBeNull();
  });

  it('returns null (not throws) when AsyncStorage has malformed JSON', async () => {
    await AsyncStorage.setItem('thermafit_pending_feedback', '{ bad json }');
    expect(await loadPendingFeedback()).toBeNull();
  });
});

// ─── Feedback history ─────────────────────────────────────────────────────────

describe('loadFeedbackHistory', () => {
  it('returns empty array when nothing stored', async () => {
    expect(await loadFeedbackHistory()).toEqual([]);
  });

  it('returns empty array (not throws) on malformed JSON', async () => {
    await AsyncStorage.setItem('thermafit_feedback', 'not json');
    expect(await loadFeedbackHistory()).toEqual([]);
  });

  it('returns parsed entries when valid history exists', async () => {
    await seedHistory(['ok', 'cold']);
    const history = await loadFeedbackHistory();
    expect(history).toHaveLength(2);
    expect(history[0].outcome).toBe('ok');
    expect(history[1].outcome).toBe('cold');
  });
});

// ─── recordFeedback: persistence ─────────────────────────────────────────────

describe('recordFeedback — persistence', () => {
  it('appends a new entry to history', async () => {
    await seedHistory(['ok']);
    await recordFeedback(makePending(), 'cold');
    const history = await loadFeedbackHistory();
    expect(history).toHaveLength(2);
    expect(history[1].outcome).toBe('cold');
  });

  it('stored entry has correct outcome, tempC, and sensitivity', async () => {
    const pending = makePending({ tempC: 22, sensitivity: 1 });
    await recordFeedback(pending, 'warm');
    const history = await loadFeedbackHistory();
    const entry = history[history.length - 1];
    expect(entry.outcome).toBe('warm');
    expect(entry.tempC).toBe(22);
    expect(entry.sensitivity).toBe(1);
  });

  it('stored entry has a valid ISO date string', async () => {
    await recordFeedback(makePending(), 'ok');
    const history = await loadFeedbackHistory();
    expect(() => new Date(history[0].date).toISOString()).not.toThrow();
  });

  it('clears pending feedback after recording', async () => {
    const pending = makePending();
    await savePendingFeedback(pending);
    await recordFeedback(pending, 'ok');
    expect(await loadPendingFeedback()).toBeNull();
  });

  it('trims history to 50 entries when overflow occurs', async () => {
    const entries: FeedbackEntry[] = Array.from({ length: 50 }, (_, i) => ({
      id: `entry-${i}`,
      date: new Date().toISOString(),
      tempC: 15,
      sensitivity: 0 as Sensitivity,
      outcome: 'ok' as FeedbackOutcome,
    }));
    await AsyncStorage.setItem('thermafit_feedback', JSON.stringify(entries));
    await recordFeedback(makePending(), 'ok');
    const history = await loadFeedbackHistory();
    expect(history).toHaveLength(50);
  });
});

// ─── recordFeedback: cold calibration ────────────────────────────────────────

describe('recordFeedback — cold calibration', () => {
  it('returns null when only 2 entries exist', async () => {
    await seedHistory(['cold', 'cold']);
    const msg = await recordFeedback(makePending({ sensitivity: 0 }), 'cold');
    expect(msg).toBeNull();
  });

  it('returns null when 3 entries but only 2 are cold', async () => {
    await seedHistory(['cold', 'cold', 'ok']);
    const msg = await recordFeedback(makePending({ sensitivity: 0 }), 'warm');
    expect(msg).toBeNull();
  });

  it('decrements sensitivity and returns message when 3 of last 5 are cold', async () => {
    await seedHistory(['cold', 'cold', 'ok', 'ok'], 0);
    const msg = await recordFeedback(makePending({ sensitivity: 0 }), 'cold');
    expect(msg).not.toBeNull();
    const prefs = await loadPreferences();
    expect(prefs.sensitivity).toBe(-1);
  });

  it('decrements from -1 to -2', async () => {
    await seedHistory(['cold', 'cold', 'ok', 'ok'], -1);
    await recordFeedback(makePending({ sensitivity: -1 }), 'cold');
    const prefs = await loadPreferences();
    expect(prefs.sensitivity).toBe(-2);
  });

  it('does NOT decrement below floor of -2', async () => {
    await seedHistory(['cold', 'cold', 'ok', 'ok'], -2);
    const msg = await recordFeedback(makePending({ sensitivity: -2 }), 'cold');
    expect(msg).toBeNull();
    const prefs = await loadPreferences();
    expect(prefs.sensitivity).toBe(0); // default — not changed
  });

  it('decrements when 5 of 5 are cold', async () => {
    await seedHistory(['cold', 'cold', 'cold', 'cold'], 0);
    await recordFeedback(makePending({ sensitivity: 0 }), 'cold');
    const prefs = await loadPreferences();
    expect(prefs.sensitivity).toBe(-1);
  });
});

// ─── recordFeedback: warm calibration ────────────────────────────────────────

describe('recordFeedback — warm calibration', () => {
  it('increments sensitivity and returns message when 3 of last 5 are warm', async () => {
    await seedHistory(['warm', 'warm', 'ok', 'ok'], 0);
    const msg = await recordFeedback(makePending({ sensitivity: 0 }), 'warm');
    expect(msg).not.toBeNull();
    const prefs = await loadPreferences();
    expect(prefs.sensitivity).toBe(1);
  });

  it('increments from 1 to 2', async () => {
    await seedHistory(['warm', 'warm', 'ok', 'ok'], 1);
    await recordFeedback(makePending({ sensitivity: 1 }), 'warm');
    const prefs = await loadPreferences();
    expect(prefs.sensitivity).toBe(2);
  });

  it('does NOT increment above ceiling of 2', async () => {
    await seedHistory(['warm', 'warm', 'ok', 'ok'], 2);
    const msg = await recordFeedback(makePending({ sensitivity: 2 }), 'warm');
    expect(msg).toBeNull();
    const prefs = await loadPreferences();
    expect(prefs.sensitivity).toBe(0); // default — not changed
  });

  it('increments from -2 to -1', async () => {
    await seedHistory(['warm', 'warm', 'ok', 'ok'], -2);
    await recordFeedback(makePending({ sensitivity: -2 }), 'warm');
    const prefs = await loadPreferences();
    expect(prefs.sensitivity).toBe(-1);
  });
});

// ─── recordFeedback: no calibration ──────────────────────────────────────────

describe('recordFeedback — no calibration triggered', () => {
  it('returns null when 3 of last 5 are ok', async () => {
    await seedHistory(['ok', 'ok', 'cold', 'cold'], 0);
    const msg = await recordFeedback(makePending({ sensitivity: 0 }), 'ok');
    expect(msg).toBeNull();
  });

  it('returns null when 2 cold + 2 warm + 1 ok', async () => {
    await seedHistory(['cold', 'cold', 'warm', 'warm'], 0);
    const msg = await recordFeedback(makePending({ sensitivity: 0 }), 'ok');
    expect(msg).toBeNull();
  });
});
