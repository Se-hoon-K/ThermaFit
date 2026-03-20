import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  PanResponder,
  Animated,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Sensitivity,
  SENSITIVITY_DESCRIPTIONS,
} from '../types/preferences';
import { spacing, fontSizes } from '../constants/theme';

const SCALE: Sensitivity[] = [-2, -1, 0, 1, 2];
const THUMB_SIZE = 28;
const TRACK_HEIGHT = 8;

// Colour for each snap position (cold → hot)
const SNAP_COLORS = ['#1565C0', '#42A5F5', '#9090a8', '#FF7043', '#E53935'];

// Gradient colours for the track background
const GRADIENT_COLORS: [string, string, string, string, string] = [
  '#1565C0',
  '#42A5F5',
  '#9090a8',
  '#FF7043',
  '#E53935',
];

interface Props {
  value: Sensitivity;
  onChange: (s: Sensitivity) => void;
}

function sensitivityToIndex(s: Sensitivity): number {
  return SCALE.indexOf(s);
}

function indexToSensitivity(i: number): Sensitivity {
  return SCALE[Math.max(0, Math.min(SCALE.length - 1, i))];
}

export default function SensitivityPicker({ value, onChange }: Props) {
  const trackWidth = useRef(0);
  const currentIndex = useRef(sensitivityToIndex(value));

  // thumbX goes from 0 to trackWidth (excluding thumb size padding)
  const thumbX = useRef(new Animated.Value(0)).current;

  // Colour animates with the same 0–4 range
  const colorAnim = useRef(new Animated.Value(sensitivityToIndex(value))).current;

  const thumbColor = colorAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: SNAP_COLORS,
    extrapolate: 'clamp',
  });

  const getSnapX = useCallback((index: number) => {
    const usable = trackWidth.current - THUMB_SIZE;
    return (usable / (SCALE.length - 1)) * index;
  }, []);

  const snapToIndex = useCallback(
    (index: number, animated = true) => {
      const targetX = getSnapX(index);
      if (animated) {
        Animated.parallel([
          Animated.spring(thumbX, {
            toValue: targetX,
            useNativeDriver: false,
            bounciness: 6,
          }),
          Animated.spring(colorAnim, {
            toValue: index,
            useNativeDriver: false,
            bounciness: 6,
          }),
        ]).start();
      } else {
        thumbX.setValue(targetX);
        colorAnim.setValue(index);
      }
      currentIndex.current = index;
    },
    [getSnapX, thumbX, colorAnim],
  );

  const onTrackLayout = useCallback(
    (e: LayoutChangeEvent) => {
      trackWidth.current = e.nativeEvent.layout.width;
      snapToIndex(sensitivityToIndex(value), false);
    },
    [value, snapToIndex],
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        if (trackWidth.current === 0) return;
        const usable = trackWidth.current - THUMB_SIZE;
        const startX = getSnapX(currentIndex.current);
        const newX = Math.max(0, Math.min(usable, startX + gs.dx));
        thumbX.setValue(newX);
        // Animate colour in real-time while dragging
        const ratio = newX / usable;
        colorAnim.setValue(ratio * (SCALE.length - 1));
      },
      onPanResponderRelease: (_, gs) => {
        if (trackWidth.current === 0) return;
        const usable = trackWidth.current - THUMB_SIZE;
        const startX = getSnapX(currentIndex.current);
        const rawX = Math.max(0, Math.min(usable, startX + gs.dx));
        const nearestIndex = Math.round((rawX / usable) * (SCALE.length - 1));
        snapToIndex(nearestIndex);
        onChange(indexToSensitivity(nearestIndex));
      },
    }),
  ).current;

  const currentColor = SNAP_COLORS[sensitivityToIndex(value)];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>How do you feel the cold?</Text>

      {/* Emoji end labels */}
      <View style={styles.emojiRow}>
        <Text style={styles.emoji}>❄️</Text>
        <Text style={styles.emoji}>🔥</Text>
      </View>

      {/* Track + thumb */}
      <View style={styles.trackWrapper} onLayout={onTrackLayout}>
        {/* Gradient track */}
        <LinearGradient
          colors={GRADIENT_COLORS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.track}
        />

        {/* Tick marks */}
        <View style={styles.ticks} pointerEvents="none">
          {SCALE.map((_, i) => (
            <View key={i} style={styles.tick} />
          ))}
        </View>

        {/* Draggable thumb */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.thumb,
            {
              transform: [{ translateX: thumbX }],
              borderColor: thumbColor,
            },
          ]}
        >
          <View style={styles.thumbDot} />
        </Animated.View>
      </View>

      {/* Description */}
      <Text style={[styles.description, { color: currentColor }]}>
        {SENSITIVITY_DESCRIPTIONS[value]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: fontSizes.md,
    color: '#e8e8f0',
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    paddingHorizontal: THUMB_SIZE / 2,
  },
  emoji: {
    fontSize: fontSizes.lg,
  },
  trackWrapper: {
    height: THUMB_SIZE + 16,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    marginHorizontal: THUMB_SIZE / 2,
  },
  ticks: {
    position: 'absolute',
    left: THUMB_SIZE / 2,
    right: THUMB_SIZE / 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    top: '50%',
    marginTop: TRACK_HEIGHT / 2 + 2,
  },
  tick: {
    width: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#1a1a2e',
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    top: '50%',
    marginTop: -(THUMB_SIZE / 2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  thumbDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  description: {
    fontSize: fontSizes.sm,
    textAlign: 'center',
    marginTop: spacing.md,
    fontWeight: '500',
  },
});
