import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ErrorBanner from '../../components/ErrorBanner';

describe('<ErrorBanner />', () => {
  it('matches snapshot with PERMISSION_DENIED and no retry', () => {
    const { toJSON } = render(<ErrorBanner error="PERMISSION_DENIED" />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot with retry button', () => {
    const { toJSON } = render(<ErrorBanner error="LOCATION_FAILED" onRetry={jest.fn()} />);
    expect(toJSON()).toMatchSnapshot();
  });

  // ─── Error message mapping

  it('shows location denied message for PERMISSION_DENIED', () => {
    const { getByText } = render(<ErrorBanner error="PERMISSION_DENIED" />);
    expect(getByText(/Location access denied/i)).toBeTruthy();
  });

  it('shows location failed message for LOCATION_FAILED', () => {
    const { getByText } = render(<ErrorBanner error="LOCATION_FAILED" />);
    expect(getByText(/Could not get your location/i)).toBeTruthy();
  });

  it('shows API key message for API_KEY_INVALID', () => {
    const { getByText } = render(<ErrorBanner error="API_KEY_INVALID" />);
    expect(getByText(/API key/i)).toBeTruthy();
  });

  it('shows fetch failed message for WEATHER_FETCH_FAILED:503', () => {
    const { getByText } = render(<ErrorBanner error="WEATHER_FETCH_FAILED:503" />);
    expect(getByText(/Could not fetch weather/i)).toBeTruthy();
  });

  it('shows fetch failed message for any WEATHER_FETCH_FAILED prefix', () => {
    const { getByText } = render(<ErrorBanner error="WEATHER_FETCH_FAILED:anything" />);
    expect(getByText(/Could not fetch weather/i)).toBeTruthy();
  });

  it('shows generic message for unrecognised error', () => {
    const { getByText } = render(<ErrorBanner error="UNKNOWN_CODE" />);
    expect(getByText(/Something went wrong/i)).toBeTruthy();
  });

  it('renders without crashing for an empty string error', () => {
    const { toJSON } = render(<ErrorBanner error="" />);
    expect(toJSON()).not.toBeNull();
  });

  // ─── Retry button

  it('does not render Retry button when onRetry is not provided', () => {
    const { queryByText } = render(<ErrorBanner error="LOCATION_FAILED" />);
    expect(queryByText('Retry')).toBeNull();
  });

  it('renders Retry button when onRetry is provided', () => {
    const { getByText } = render(<ErrorBanner error="LOCATION_FAILED" onRetry={jest.fn()} />);
    expect(getByText('Retry')).toBeTruthy();
  });

  it('calls onRetry when Retry button is pressed', () => {
    const onRetry = jest.fn();
    const { getByText } = render(<ErrorBanner error="LOCATION_FAILED" onRetry={onRetry} />);
    fireEvent.press(getByText('Retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('calls onRetry exactly once per press', () => {
    const onRetry = jest.fn();
    const { getByText } = render(<ErrorBanner error="LOCATION_FAILED" onRetry={onRetry} />);
    fireEvent.press(getByText('Retry'));
    fireEvent.press(getByText('Retry'));
    expect(onRetry).toHaveBeenCalledTimes(2);
  });
});
