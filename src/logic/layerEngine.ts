import { WeatherData } from '../types/weather';
import { Sensitivity, SENSITIVITY_OFFSETS } from '../types/preferences';
import { LayerSuggestion } from '../types/layers';
import { LAYER_RULES, TempBand } from '../constants/layerRules';

function getTempBand(effectiveTemp: number): TempBand {
  if (effectiveTemp < -10) return 'EXTREME_COLD';
  if (effectiveTemp < 0) return 'VERY_COLD';
  if (effectiveTemp < 8) return 'COLD';
  if (effectiveTemp < 14) return 'COOL';
  if (effectiveTemp < 20) return 'MILD';
  if (effectiveTemp < 27) return 'WARM';
  return 'HOT';
}

export function getLayerSuggestion(
  weather: WeatherData,
  sensitivity: Sensitivity,
): LayerSuggestion {
  const offset = SENSITIVITY_OFFSETS[sensitivity];
  // Use OWM feels_like (already has wind chill + humidity), then apply personal offset
  const personalFeelsLike = Math.round(weather.feelsLikeC + offset);
  const band = getTempBand(personalFeelsLike);

  // Find rule: exact condition match first, then 'any' fallback
  const exactMatch = LAYER_RULES.find(
    (r) => r.band === band && r.condition === weather.condition,
  );
  const anyMatch = LAYER_RULES.find(
    (r) => r.band === band && r.condition === 'any',
  );
  const rule = exactMatch ?? anyMatch;

  // Umbrella tip: rain likely soon but not currently raining
  const showUmbrellaTip =
    weather.rainProbability > 0.3 && weather.condition !== 'rain';

  return {
    layers: rule?.layers ?? [{ emoji: '👕', label: 'T-shirt' }],
    personalFeelsLike,
    showUmbrellaTip,
  };
}
