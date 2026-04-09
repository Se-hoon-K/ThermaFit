import React from 'react';
import { render } from '@testing-library/react-native';
import UmbrellaTip from '../../components/UmbrellaTip';

describe('<UmbrellaTip />', () => {
  it('matches snapshot', () => {
    const { toJSON } = render(<UmbrellaTip />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders the umbrella rain message', () => {
    const { getByText } = render(<UmbrellaTip />);
    expect(getByText(/Rain likely later/)).toBeTruthy();
  });

  it('contains the umbrella emoji', () => {
    const { getByText } = render(<UmbrellaTip />);
    expect(getByText(/🌂/)).toBeTruthy();
  });
});
