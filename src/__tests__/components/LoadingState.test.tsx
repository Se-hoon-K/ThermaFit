import React from 'react';
import { render } from '@testing-library/react-native';
import LoadingState from '../../components/LoadingState';

describe('<LoadingState />', () => {
  it('matches snapshot with default message', () => {
    const { toJSON } = render(<LoadingState />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot with custom message', () => {
    const { toJSON } = render(<LoadingState message="Finding your location…" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders default message when no prop given', () => {
    const { getByText } = render(<LoadingState />);
    expect(getByText('Getting weather…')).toBeTruthy();
  });

  it('renders custom message when provided', () => {
    const { getByText } = render(<LoadingState message="Finding your location…" />);
    expect(getByText('Finding your location…')).toBeTruthy();
  });

  it('renders an ActivityIndicator', () => {
    const { UNSAFE_getByType } = render(<LoadingState />);
    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('renders without crashing with an empty string message', () => {
    const { toJSON } = render(<LoadingState message="" />);
    expect(toJSON()).not.toBeNull();
  });

  it('renders without crashing with a very long message', () => {
    const { toJSON } = render(<LoadingState message={'A'.repeat(200)} />);
    expect(toJSON()).not.toBeNull();
  });
});
