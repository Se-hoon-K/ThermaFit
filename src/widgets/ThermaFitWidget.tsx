/**
 * Android home screen widget component.
 * Rendered by react-native-android-widget.
 * Reads the last saved snapshot from AsyncStorage via the widget bridge.
 */
import React from 'react';
import {
  FlexWidget,
  TextWidget,
  ImageWidget,
} from 'react-native-android-widget';
import { WidgetSnapshot } from '../storage/widgetBridge';

interface Props {
  snapshot: WidgetSnapshot | null;
}

export function ThermaFitWidget({ snapshot }: Props) {
  if (!snapshot) {
    return (
      <FlexWidget
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#1a1a2e',
          borderRadius: 16,
        }}
      >
        <TextWidget
          text="ThermaFit"
          style={{ fontSize: 14, color: '#9090a8', fontWeight: 'bold' }}
        />
        <TextWidget
          text="Open app to load weather"
          style={{ fontSize: 11, color: '#5a5a78', marginTop: 4 }}
        />
      </FlexWidget>
    );
  }

  const { weather, suggestion, preferences } = snapshot;
  const feelsLike =
    preferences.units === 'imperial'
      ? `${Math.round(suggestion.personalFeelsLike * 9 / 5 + 32)}°F`
      : `${suggestion.personalFeelsLike}°C`;

  const topLayers = suggestion.layers.slice(0, 3);
  const updatedAt = new Date(weather.fetchedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <FlexWidget
      style={{
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#1a1a2e',
        borderRadius: 16,
        padding: 12,
      }}
    >
      {/* Header */}
      <FlexWidget
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <TextWidget
          text="ThermaFit"
          style={{ fontSize: 12, color: '#4f86c6', fontWeight: 'bold' }}
        />
        <TextWidget
          text={updatedAt}
          style={{ fontSize: 10, color: '#5a5a78' }}
        />
      </FlexWidget>

      {/* Location + temp */}
      <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
        <TextWidget
          text={`📍 ${weather.cityName}`}
          style={{ fontSize: 12, color: '#e8e8f0' }}
        />
        <TextWidget
          text={`  ${Math.round(weather.tempC)}°C`}
          style={{ fontSize: 12, color: '#9090a8' }}
        />
      </FlexWidget>

      {/* Feels like */}
      <TextWidget
        text={`Feels like ${feelsLike} for you`}
        style={{ fontSize: 11, color: '#4f86c6', marginTop: 4 }}
      />

      {/* Umbrella tip */}
      {suggestion.showUmbrellaTip && (
        <TextWidget
          text="🌂 Rain later"
          style={{ fontSize: 11, color: '#4f86c6', marginTop: 4 }}
        />
      )}

      {/* Layers */}
      <FlexWidget style={{ flexDirection: 'column', marginTop: 6 }}>
        {topLayers.map((layer, i) => (
          <TextWidget
            key={i}
            text={`${layer.emoji} ${layer.label}`}
            style={{ fontSize: 11, color: '#e8e8f0' }}
          />
        ))}
      </FlexWidget>
    </FlexWidget>
  );
}
