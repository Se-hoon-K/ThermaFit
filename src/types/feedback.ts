import { Sensitivity } from './preferences';

export type FeedbackOutcome = 'cold' | 'ok' | 'warm';

export interface FeedbackEntry {
  id: string;
  date: string; // ISO timestamp
  tempC: number;
  sensitivity: Sensitivity;
  outcome: FeedbackOutcome;
}

export interface PendingFeedback {
  id: string;
  recordedAt: number; // Date.now()
  tempC: number;
  sensitivity: Sensitivity;
}
