// -2 = very cold-sensitive (feels much colder than others)
// -1 = slightly cold-sensitive
//  0 = normal
// +1 = slightly heat-sensitive
// +2 = very heat-sensitive (feels much warmer than others)
export type Sensitivity = -2 | -1 | 0 | 1 | 2;
export type Units = 'metric' | 'imperial';

export interface UserPreferences {
  sensitivity: Sensitivity;
  units: Units;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  sensitivity: 0,
  units: 'metric',
};

export const SENSITIVITY_LABELS: Record<Sensitivity, string> = {
  [-2]: 'Very cold-sensitive',
  [-1]: 'Cold-sensitive',
  [0]: 'Normal',
  [1]: 'Heat-sensitive',
  [2]: 'Very heat-sensitive',
};

export const SENSITIVITY_EMOJIS: Record<Sensitivity, string> = {
  [-2]: '❄️',
  [-1]: '🥶',
  [0]: '😐',
  [1]: '🥵',
  [2]: '🔥',
};

export const SENSITIVITY_OFFSETS: Record<Sensitivity, number> = {
  [-2]: -6,
  [-1]: -3,
  [0]: 0,
  [1]: 3,
  [2]: 6,
};

export const SENSITIVITY_DESCRIPTIONS: Record<Sensitivity, string> = {
  [-2]: 'You feel about 6° colder than most people',
  [-1]: 'You feel about 3° colder than most people',
  [0]: 'You feel temperatures like most people',
  [1]: 'You feel about 3° warmer than most people',
  [2]: 'You feel about 6° warmer than most people',
};
