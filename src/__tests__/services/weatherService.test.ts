import { fetchWeather } from '../../services/weatherService';

const mockFetch = jest.spyOn(global, 'fetch');

beforeAll(() => {
  process.env.EXPO_PUBLIC_WEATHER_API_KEY = 'test-key';
});

beforeEach(() => {
  mockFetch.mockReset();
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2025-06-01T12:00:00Z'));
});

afterEach(() => {
  jest.useRealTimers();
});

function makeHour(isoTime: string, chance: number) {
  return { time: isoTime, chance_of_rain: chance };
}

function buildResponse(overrides: {
  condCode?: number;
  windKph?: number;
  iconRaw?: string;
  hours?: { time: string; chance_of_rain: number }[];
  tempC?: number;
  feelsLikeC?: number;
  humidity?: number;
  cityName?: string;
} = {}) {
  const {
    condCode = 1000,
    windKph = 10,
    iconRaw = '//cdn.weatherapi.com/weather/64x64/day/113.png',
    hours = [],
    tempC = 18,
    feelsLikeC = 16,
    humidity = 60,
    cityName = 'Amsterdam',
  } = overrides;

  return {
    location: { name: cityName },
    current: {
      temp_c: tempC,
      feelslike_c: feelsLikeC,
      humidity,
      wind_kph: windKph,
      condition: { code: condCode, icon: iconRaw },
    },
    forecast: {
      forecastday: [{ hour: hours }],
    },
  };
}

function mockOk(body: object) {
  mockFetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => body,
  } as unknown as Response);
}

function mockError(status: number) {
  mockFetch.mockResolvedValue({
    ok: false,
    status,
  } as unknown as Response);
}

// ─── Condition code mapping: clear / cloudy / windy ─────────────────────────

describe('condition mapping — clear and cloudy', () => {
  it('maps 1000 + windKph 10 → clear', async () => {
    mockOk(buildResponse({ condCode: 1000, windKph: 10 }));
    const r = await fetchWeather('51.5,-0.1');
    expect(r.condition).toBe('clear');
  });

  it('maps 1000 + windKph 41 → windy (wind override)', async () => {
    mockOk(buildResponse({ condCode: 1000, windKph: 41 }));
    const r = await fetchWeather('51.5,-0.1');
    expect(r.condition).toBe('windy');
  });

  it('maps 1000 + windKph 40 → clear (exactly 40 is not > 40)', async () => {
    mockOk(buildResponse({ condCode: 1000, windKph: 40 }));
    const r = await fetchWeather('51.5,-0.1');
    expect(r.condition).toBe('clear');
  });

  it('maps 1003 + windKph 10 → cloudy', async () => {
    mockOk(buildResponse({ condCode: 1003, windKph: 10 }));
    const r = await fetchWeather('51.5,-0.1');
    expect(r.condition).toBe('cloudy');
  });

  it('maps 1006 + windKph 10 → cloudy', async () => {
    mockOk(buildResponse({ condCode: 1006, windKph: 10 }));
    const r = await fetchWeather('51.5,-0.1');
    expect(r.condition).toBe('cloudy');
  });

  it('maps 1009 + windKph 10 → cloudy', async () => {
    mockOk(buildResponse({ condCode: 1009, windKph: 10 }));
    const r = await fetchWeather('51.5,-0.1');
    expect(r.condition).toBe('cloudy');
  });

  it('maps 1003 + windKph 41 → windy', async () => {
    mockOk(buildResponse({ condCode: 1003, windKph: 41 }));
    const r = await fetchWeather('51.5,-0.1');
    expect(r.condition).toBe('windy');
  });
});

// ─── Condition code mapping: fog ─────────────────────────────────────────────

describe('condition mapping — fog', () => {
  it.each([1030, 1135, 1147])('maps code %i → fog', async (code) => {
    mockOk(buildResponse({ condCode: code, windKph: 10 }));
    const r = await fetchWeather('51.5,-0.1');
    expect(r.condition).toBe('fog');
  });

  it('fog code 1030 is NOT overridden by high wind', async () => {
    mockOk(buildResponse({ condCode: 1030, windKph: 60 }));
    const r = await fetchWeather('51.5,-0.1');
    expect(r.condition).toBe('fog');
  });
});

// ─── Condition code mapping: rain ────────────────────────────────────────────

describe('condition mapping — rain', () => {
  it.each([1063, 1072, 1150, 1201, 1240, 1246, 1273, 1276])(
    'maps code %i → rain',
    async (code) => {
      mockOk(buildResponse({ condCode: code, windKph: 10 }));
      const r = await fetchWeather('51.5,-0.1');
      expect(r.condition).toBe('rain');
    },
  );

  it('rain code 1063 is NOT overridden by high wind', async () => {
    mockOk(buildResponse({ condCode: 1063, windKph: 60 }));
    const r = await fetchWeather('51.5,-0.1');
    expect(r.condition).toBe('rain');
  });
});

// ─── Condition code mapping: snow ────────────────────────────────────────────

describe('condition mapping — snow', () => {
  it.each([1066, 1069, 1114, 1117, 1204, 1237, 1255, 1264, 1279, 1282])(
    'maps code %i → snow',
    async (code) => {
      mockOk(buildResponse({ condCode: code, windKph: 10 }));
      const r = await fetchWeather('51.5,-0.1');
      expect(r.condition).toBe('snow');
    },
  );
});

// ─── Condition code mapping: fallback ────────────────────────────────────────

describe('condition mapping — fallback', () => {
  it('unknown code 9999 + windKph 10 → cloudy', async () => {
    mockOk(buildResponse({ condCode: 9999, windKph: 10 }));
    const r = await fetchWeather('51.5,-0.1');
    expect(r.condition).toBe('cloudy');
  });

  it('unknown code 9999 + windKph 41 → windy', async () => {
    mockOk(buildResponse({ condCode: 9999, windKph: 41 }));
    const r = await fetchWeather('51.5,-0.1');
    expect(r.condition).toBe('windy');
  });
});

// ─── Rain probability ─────────────────────────────────────────────────────────

describe('rainProbability', () => {
  // Frozen time: 2025-06-01T12:00:00Z
  // Use local-time formatting so new Date(h.time) in weatherService parses
  // the same timezone as Date.now() comparison, avoiding UTC-offset failures.
  function formatLocal(d: Date) {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  const future = (h: number) => formatLocal(new Date(Date.now() + h * 3_600_000));
  const past = (h: number) => formatLocal(new Date(Date.now() - h * 3_600_000));

  it('is 0 when forecast hours array is empty', async () => {
    mockOk(buildResponse({ hours: [] }));
    const r = await fetchWeather('51.5,-0.1');
    expect(r.rainProbability).toBe(0);
  });

  it('is 0 when all hours are in the past', async () => {
    const hours = [makeHour(past(2), 80), makeHour(past(1), 90)];
    mockOk(buildResponse({ hours }));
    const r = await fetchWeather('51.5,-0.1');
    expect(r.rainProbability).toBe(0);
  });

  it('returns max(chance_of_rain) / 100 from next 9 future hours', async () => {
    const hours = [
      makeHour(future(1), 20),
      makeHour(future(2), 70),
      makeHour(future(3), 45),
    ];
    mockOk(buildResponse({ hours }));
    const r = await fetchWeather('51.5,-0.1');
    expect(r.rainProbability).toBe(0.7);
  });

  it('only uses first 9 future hours — ignores hour 10+', async () => {
    const hours = Array.from({ length: 12 }, (_, i) =>
      makeHour(future(i + 1), i === 9 ? 100 : 5),
    );
    mockOk(buildResponse({ hours }));
    const r = await fetchWeather('51.5,-0.1');
    expect(r.rainProbability).toBe(0.05);
  });
});

// ─── Icon URL normalisation ───────────────────────────────────────────────────

describe('iconUrl', () => {
  it('prepends https: to protocol-relative URL', async () => {
    mockOk(buildResponse({ iconRaw: '//cdn.weatherapi.com/icon.png' }));
    const r = await fetchWeather('51.5,-0.1');
    expect(r.iconUrl).toBe('https://cdn.weatherapi.com/icon.png');
  });

  it('leaves https:// URL unchanged', async () => {
    mockOk(buildResponse({ iconRaw: 'https://cdn.weatherapi.com/icon.png' }));
    const r = await fetchWeather('51.5,-0.1');
    expect(r.iconUrl).toBe('https://cdn.weatherapi.com/icon.png');
  });
});

// ─── HTTP error handling ──────────────────────────────────────────────────────

describe('error handling', () => {
  it('throws API_KEY_INVALID on 401', async () => {
    mockError(401);
    await expect(fetchWeather('51.5,-0.1')).rejects.toThrow('API_KEY_INVALID');
  });

  it('throws API_KEY_INVALID on 403', async () => {
    mockError(403);
    await expect(fetchWeather('51.5,-0.1')).rejects.toThrow('API_KEY_INVALID');
  });

  it('throws WEATHER_FETCH_FAILED:500 on 500', async () => {
    mockError(500);
    await expect(fetchWeather('51.5,-0.1')).rejects.toThrow('WEATHER_FETCH_FAILED:500');
  });

  it('propagates network errors when fetch rejects', async () => {
    mockFetch.mockRejectedValue(new Error('Network request failed'));
    await expect(fetchWeather('51.5,-0.1')).rejects.toThrow('Network request failed');
  });
});

// ─── Successful response shape ────────────────────────────────────────────────

describe('successful response shape', () => {
  it('maps all fields correctly', async () => {
    mockOk(buildResponse({ tempC: 20, feelsLikeC: 18, humidity: 70, windKph: 15, cityName: 'London' }));
    const r = await fetchWeather('51.5,-0.1');
    expect(r.tempC).toBe(20);
    expect(r.feelsLikeC).toBe(18);
    expect(r.humidity).toBe(70);
    expect(r.windSpeedKph).toBe(15);
    expect(r.cityName).toBe('London');
  });

  it('maps cityName to "Unknown" when location.name is missing', async () => {
    const body = buildResponse();
    (body.location as Record<string, unknown>).name = undefined;
    mockOk(body);
    const r = await fetchWeather('51.5,-0.1');
    expect(r.cityName).toBe('Unknown');
  });

  it('sets fetchedAt to approximately now', async () => {
    const before = Date.now();
    mockOk(buildResponse());
    const r = await fetchWeather('51.5,-0.1');
    expect(r.fetchedAt).toBeGreaterThanOrEqual(before);
    expect(r.fetchedAt).toBeLessThanOrEqual(Date.now());
  });
});
