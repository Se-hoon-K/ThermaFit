import React from 'react';
import { render } from '@testing-library/react-native';
import LayerItem from '../../components/LayerItem';

describe('<LayerItem />', () => {
  it('matches snapshot', () => {
    const { toJSON } = render(<LayerItem layer={{ emoji: '🧥', label: 'Light jacket' }} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders the emoji', () => {
    const { getByText } = render(<LayerItem layer={{ emoji: '🧥', label: 'Light jacket' }} />);
    expect(getByText('🧥')).toBeTruthy();
  });

  it('renders the label', () => {
    const { getByText } = render(<LayerItem layer={{ emoji: '🧥', label: 'Light jacket' }} />);
    expect(getByText('Light jacket')).toBeTruthy();
  });

  it('renders with a multi-word label', () => {
    const { getByText } = render(<LayerItem layer={{ emoji: '👕', label: 'Thermal base layer' }} />);
    expect(getByText('Thermal base layer')).toBeTruthy();
  });

  it('renders with an empty label without crashing', () => {
    const { toJSON } = render(<LayerItem layer={{ emoji: '👕', label: '' }} />);
    expect(toJSON()).not.toBeNull();
  });

  it('renders with a multi-codepoint emoji', () => {
    const { getByText } = render(<LayerItem layer={{ emoji: '🧣', label: 'Scarf' }} />);
    expect(getByText('🧣')).toBeTruthy();
  });
});
