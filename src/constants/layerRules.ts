import { WeatherCondition } from '../types/weather';
import { Layer } from '../types/layers';

export type TempBand =
  | 'EXTREME_COLD'
  | 'VERY_COLD'
  | 'COLD'
  | 'COOL'
  | 'MILD'
  | 'WARM'
  | 'HOT';

export interface LayerRule {
  band: TempBand;
  condition: WeatherCondition | 'any';
  layers: Layer[];
}

export const LAYER_RULES: LayerRule[] = [
  // ─── EXTREME COLD (< -10°C) ────────────────────────────────────────────────
  {
    band: 'EXTREME_COLD',
    condition: 'any',
    layers: [
      { emoji: '🧥', label: 'Heavy down parka' },
      { emoji: '👕', label: 'Thermal base layer' },
      { emoji: '🧣', label: 'Fleece mid-layer' },
      { emoji: '🧤', label: 'Insulated gloves' },
      { emoji: '🧢', label: 'Wool beanie' },
      { emoji: '🧦', label: 'Thermal socks' },
      { emoji: '👢', label: 'Insulated waterproof boots' },
    ],
  },

  // ─── VERY COLD (-10 to 0°C) ────────────────────────────────────────────────
  {
    band: 'VERY_COLD',
    condition: 'snow',
    layers: [
      { emoji: '🧥', label: 'Heavy waterproof coat' },
      { emoji: '👕', label: 'Thermal underlayer' },
      { emoji: '🧣', label: 'Fleece mid-layer' },
      { emoji: '🧤', label: 'Gloves' },
      { emoji: '🧢', label: 'Beanie' },
      { emoji: '👢', label: 'Waterproof snow boots' },
    ],
  },
  {
    band: 'VERY_COLD',
    condition: 'any',
    layers: [
      { emoji: '🧥', label: 'Heavy coat' },
      { emoji: '👕', label: 'Thermal underlayer' },
      { emoji: '🧣', label: 'Fleece mid-layer' },
      { emoji: '🧤', label: 'Gloves' },
      { emoji: '🧢', label: 'Beanie' },
    ],
  },

  // ─── COLD (0 to 8°C) ───────────────────────────────────────────────────────
  {
    band: 'COLD',
    condition: 'rain',
    layers: [
      { emoji: '🧥', label: 'Waterproof jacket' },
      { emoji: '👕', label: 'Warm underlayer' },
      { emoji: '👢', label: 'Waterproof boots' },
      { emoji: '☂️', label: 'Umbrella' },
    ],
  },
  {
    band: 'COLD',
    condition: 'snow',
    layers: [
      { emoji: '🧥', label: 'Waterproof padded jacket' },
      { emoji: '👕', label: 'Warm underlayer' },
      { emoji: '🧤', label: 'Gloves' },
      { emoji: '🧢', label: 'Beanie' },
      { emoji: '👢', label: 'Waterproof boots' },
    ],
  },
  {
    band: 'COLD',
    condition: 'any',
    layers: [
      { emoji: '🧥', label: 'Jacket or coat' },
      { emoji: '👕', label: 'Long-sleeve top' },
      { emoji: '🧣', label: 'Scarf (optional)' },
    ],
  },

  // ─── COOL (8 to 14°C) ──────────────────────────────────────────────────────
  {
    band: 'COOL',
    condition: 'rain',
    layers: [
      { emoji: '🧥', label: 'Waterproof jacket' },
      { emoji: '👕', label: 'Long-sleeve top' },
    ],
  },
  {
    band: 'COOL',
    condition: 'any',
    layers: [
      { emoji: '🧥', label: 'Light jacket or hoodie' },
      { emoji: '👕', label: 'Long-sleeve top' },
    ],
  },

  // ─── MILD (14 to 20°C) ─────────────────────────────────────────────────────
  {
    band: 'MILD',
    condition: 'rain',
    layers: [
      { emoji: '🧥', label: 'Light waterproof layer' },
      { emoji: '👕', label: 'T-shirt' },
    ],
  },
  {
    band: 'MILD',
    condition: 'any',
    layers: [
      { emoji: '👕', label: 'T-shirt' },
      { emoji: '🧥', label: 'Light layer (optional)' },
    ],
  },

  // ─── WARM (20 to 27°C) ─────────────────────────────────────────────────────
  {
    band: 'WARM',
    condition: 'any',
    layers: [{ emoji: '👕', label: 'T-shirt' }],
  },

  // ─── HOT (> 27°C) ──────────────────────────────────────────────────────────
  {
    band: 'HOT',
    condition: 'any',
    layers: [
      { emoji: '👕', label: 'Light breathable top' },
      { emoji: '🧢', label: 'Cap (recommended)' },
    ],
  },
];
