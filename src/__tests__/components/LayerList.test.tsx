import React from 'react';
import { render } from '@testing-library/react-native';
import LayerList from '../../components/LayerList';
import { Layer } from '../../types/layers';

const sampleLayers: Layer[] = [
  { emoji: '🧥', label: 'Light jacket' },
  { emoji: '👕', label: 'Long-sleeve top' },
];

describe('<LayerList />', () => {
  it('matches snapshot in metric', () => {
    const { toJSON } = render(
      <LayerList layers={sampleLayers} personalFeelsLike={12} units="metric" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot in imperial', () => {
    const { toJSON } = render(
      <LayerList layers={sampleLayers} personalFeelsLike={0} units="imperial" />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  // ─── Temperature display

  it('shows Celsius for metric: 15°C', () => {
    const { getByText } = render(
      <LayerList layers={sampleLayers} personalFeelsLike={15} units="metric" />,
    );
    expect(getByText(/Feels like 15°C for you/)).toBeTruthy();
  });

  it('converts 0°C to 32°F for imperial', () => {
    const { getByText } = render(
      <LayerList layers={sampleLayers} personalFeelsLike={0} units="imperial" />,
    );
    expect(getByText(/Feels like 32°F for you/)).toBeTruthy();
  });

  it('converts 20°C to 68°F for imperial', () => {
    const { getByText } = render(
      <LayerList layers={sampleLayers} personalFeelsLike={20} units="imperial" />,
    );
    expect(getByText(/Feels like 68°F for you/)).toBeTruthy();
  });

  it('converts -10°C to 14°F for imperial', () => {
    const { getByText } = render(
      <LayerList layers={sampleLayers} personalFeelsLike={-10} units="imperial" />,
    );
    expect(getByText(/Feels like 14°F for you/)).toBeTruthy();
  });

  it('rounds Fahrenheit: 37°C → 99°F', () => {
    const { getByText } = render(
      <LayerList layers={sampleLayers} personalFeelsLike={37} units="imperial" />,
    );
    expect(getByText(/Feels like 99°F for you/)).toBeTruthy();
  });

  // ─── Layer rendering

  it('renders one item per layer', () => {
    const { getAllByText } = render(
      <LayerList layers={sampleLayers} personalFeelsLike={12} units="metric" />,
    );
    expect(getAllByText(/jacket|top/i).length).toBeGreaterThanOrEqual(2);
  });

  it('renders zero items when layers array is empty', () => {
    const { queryAllByText } = render(
      <LayerList layers={[]} personalFeelsLike={12} units="metric" />,
    );
    expect(queryAllByText(/jacket/i)).toHaveLength(0);
  });

  it('renders the "What to wear:" heading', () => {
    const { getByText } = render(
      <LayerList layers={sampleLayers} personalFeelsLike={12} units="metric" />,
    );
    expect(getByText(/What to wear/i)).toBeTruthy();
  });

  it('renders 7 layers without crashing (EXTREME_COLD band)', () => {
    const layers: Layer[] = Array.from({ length: 7 }, (_, i) => ({
      emoji: '🧥',
      label: `Layer ${i}`,
    }));
    const { toJSON } = render(
      <LayerList layers={layers} personalFeelsLike={-15} units="metric" />,
    );
    expect(toJSON()).not.toBeNull();
  });
});
