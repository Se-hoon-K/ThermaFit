import { getLayerSuggestion } from '../../logic/layerEngine';
import { WeatherData } from '../../types/weather';
import { Sensitivity } from '../../types/preferences';

function weather(overrides: Partial<WeatherData> = {}): WeatherData {
  return {
    tempC: 15,
    feelsLikeC: 15,
    condition: 'clear',
    humidity: 50,
    windSpeedKph: 10,
    cityName: 'Test',
    iconUrl: 'https://example.com/icon.png',
    rainProbability: 0,
    fetchedAt: 0,
    ...overrides,
  };
}

// ─── Sensitivity offsets ────────────────────────────────────────────────────

describe('personalFeelsLike calculation', () => {
  it('applies no offset for sensitivity 0', () => {
    const result = getLayerSuggestion(weather({ feelsLikeC: 15 }), 0);
    expect(result.personalFeelsLike).toBe(15);
  });

  it('applies -3 offset for sensitivity -1', () => {
    const result = getLayerSuggestion(weather({ feelsLikeC: 15 }), -1);
    expect(result.personalFeelsLike).toBe(12);
  });

  it('applies -6 offset for sensitivity -2', () => {
    const result = getLayerSuggestion(weather({ feelsLikeC: 15 }), -2);
    expect(result.personalFeelsLike).toBe(9);
  });

  it('applies +3 offset for sensitivity +1', () => {
    const result = getLayerSuggestion(weather({ feelsLikeC: 15 }), 1);
    expect(result.personalFeelsLike).toBe(18);
  });

  it('applies +6 offset for sensitivity +2', () => {
    const result = getLayerSuggestion(weather({ feelsLikeC: 15 }), 2);
    expect(result.personalFeelsLike).toBe(21);
  });

  it('rounds down: 10.4 + 3 = 13 (not 13.4)', () => {
    const result = getLayerSuggestion(weather({ feelsLikeC: 10.4 }), 1);
    expect(result.personalFeelsLike).toBe(13);
  });

  it('rounds up: 10.6 + 3 = 14 (not 13.6)', () => {
    const result = getLayerSuggestion(weather({ feelsLikeC: 10.6 }), 1);
    expect(result.personalFeelsLike).toBe(14);
  });
});

// ─── Temperature band boundaries ────────────────────────────────────────────

describe('temperature band boundaries', () => {
  function band(feelsLikeC: number, sensitivity: Sensitivity = 0) {
    return getLayerSuggestion(weather({ feelsLikeC, rainProbability: 0 }), sensitivity);
  }

  it('EXTREME_COLD for -11', () => {
    const r = band(-11);
    expect(r.layers[0].label).toBe('Heavy down parka');
  });

  it('VERY_COLD for exactly -10', () => {
    const r = band(-10);
    expect(r.layers[0].label).toBe('Heavy coat');
  });

  it('VERY_COLD for -5', () => {
    const r = band(-5);
    expect(r.layers[0].label).toBe('Heavy coat');
  });

  it('COLD for exactly 0', () => {
    const r = band(0);
    expect(r.layers[0].label).toBe('Jacket or coat');
  });

  it('COLD for 4', () => {
    const r = band(4);
    expect(r.layers[0].label).toBe('Jacket or coat');
  });

  it('COOL for exactly 8', () => {
    const r = band(8);
    expect(r.layers[0].label).toBe('Light jacket or hoodie');
  });

  it('COOL for 11', () => {
    const r = band(11);
    expect(r.layers[0].label).toBe('Light jacket or hoodie');
  });

  it('MILD for exactly 14', () => {
    const r = band(14);
    expect(r.layers[0].label).toBe('T-shirt');
  });

  it('WARM for exactly 20', () => {
    const r = band(20);
    expect(r.layers[0].label).toBe('T-shirt');
  });

  it('HOT for exactly 27', () => {
    const r = band(27);
    expect(r.layers[0].label).toBe('Light breathable top');
  });

  it('HOT for 35', () => {
    const r = band(35);
    expect(r.layers[0].label).toBe('Light breathable top');
  });
});

// ─── Rule selection: condition match vs fallback ─────────────────────────────

describe('layer rule selection', () => {
  it('VERY_COLD + snow selects snow-specific rule (Heavy waterproof coat)', () => {
    const r = getLayerSuggestion(weather({ feelsLikeC: -5, condition: 'snow' }), 0);
    expect(r.layers[0].label).toBe('Heavy waterproof coat');
  });

  it('VERY_COLD + clear falls back to any rule (Heavy coat)', () => {
    const r = getLayerSuggestion(weather({ feelsLikeC: -5, condition: 'clear' }), 0);
    expect(r.layers[0].label).toBe('Heavy coat');
  });

  it('VERY_COLD + rain falls back to any rule (no rain rule for this band)', () => {
    const r = getLayerSuggestion(weather({ feelsLikeC: -5, condition: 'rain' }), 0);
    expect(r.layers[0].label).toBe('Heavy coat');
  });

  it('COLD + rain selects rain rule (Waterproof jacket)', () => {
    const r = getLayerSuggestion(weather({ feelsLikeC: 4, condition: 'rain' }), 0);
    expect(r.layers[0].label).toBe('Waterproof jacket');
  });

  it('COLD + snow selects snow rule (Waterproof padded jacket)', () => {
    const r = getLayerSuggestion(weather({ feelsLikeC: 4, condition: 'snow' }), 0);
    expect(r.layers[0].label).toBe('Waterproof padded jacket');
  });

  it('COLD + clear falls back to any rule (Jacket or coat)', () => {
    const r = getLayerSuggestion(weather({ feelsLikeC: 4, condition: 'clear' }), 0);
    expect(r.layers[0].label).toBe('Jacket or coat');
  });

  it('COOL + rain selects rain rule (Waterproof jacket)', () => {
    const r = getLayerSuggestion(weather({ feelsLikeC: 11, condition: 'rain' }), 0);
    expect(r.layers[0].label).toBe('Waterproof jacket');
  });

  it('COOL + windy falls back to any rule (Light jacket or hoodie)', () => {
    const r = getLayerSuggestion(weather({ feelsLikeC: 11, condition: 'windy' }), 0);
    expect(r.layers[0].label).toBe('Light jacket or hoodie');
  });

  it('MILD + rain selects rain rule (Light waterproof layer)', () => {
    const r = getLayerSuggestion(weather({ feelsLikeC: 17, condition: 'rain' }), 0);
    expect(r.layers[0].label).toBe('Light waterproof layer');
  });

  it('MILD + cloudy falls back to any rule (T-shirt)', () => {
    const r = getLayerSuggestion(weather({ feelsLikeC: 17, condition: 'cloudy' }), 0);
    expect(r.layers[0].label).toBe('T-shirt');
  });
});

// ─── Umbrella tip ────────────────────────────────────────────────────────────

describe('showUmbrellaTip', () => {
  it('is false when rainProbability is 0', () => {
    const r = getLayerSuggestion(weather({ rainProbability: 0, condition: 'clear' }), 0);
    expect(r.showUmbrellaTip).toBe(false);
  });

  it('is false when rainProbability is exactly 0.3 (not strictly greater)', () => {
    const r = getLayerSuggestion(weather({ rainProbability: 0.3, condition: 'clear' }), 0);
    expect(r.showUmbrellaTip).toBe(false);
  });

  it('is true when rainProbability is 0.31 and condition is clear', () => {
    const r = getLayerSuggestion(weather({ rainProbability: 0.31, condition: 'clear' }), 0);
    expect(r.showUmbrellaTip).toBe(true);
  });

  it('is true when rainProbability is 0.31 and condition is cloudy', () => {
    const r = getLayerSuggestion(weather({ rainProbability: 0.31, condition: 'cloudy' }), 0);
    expect(r.showUmbrellaTip).toBe(true);
  });

  it('is true when rainProbability is 0.31 and condition is windy', () => {
    const r = getLayerSuggestion(weather({ rainProbability: 0.31, condition: 'windy' }), 0);
    expect(r.showUmbrellaTip).toBe(true);
  });

  it('is true when rainProbability is 0.31 and condition is snow', () => {
    const r = getLayerSuggestion(weather({ rainProbability: 0.31, condition: 'snow' }), 0);
    expect(r.showUmbrellaTip).toBe(true);
  });

  it('is false when condition IS rain, even at 100% probability', () => {
    const r = getLayerSuggestion(weather({ rainProbability: 1.0, condition: 'rain' }), 0);
    expect(r.showUmbrellaTip).toBe(false);
  });

  it('result has exactly the keys: layers, personalFeelsLike, showUmbrellaTip', () => {
    const r = getLayerSuggestion(weather(), 0);
    expect(Object.keys(r).sort()).toEqual(['layers', 'personalFeelsLike', 'showUmbrellaTip'].sort());
  });
});
