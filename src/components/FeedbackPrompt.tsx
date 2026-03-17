import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { FeedbackOutcome } from '../types/feedback';
import { colors, spacing, fontSizes, radius } from '../constants/theme';

interface Props {
  visible: boolean;
  onAnswer: (outcome: FeedbackOutcome) => void;
  onDismiss: () => void;
}

const OPTIONS: { outcome: FeedbackOutcome; emoji: string; label: string }[] = [
  { outcome: 'cold', emoji: '🥶', label: 'Too cold' },
  { outcome: 'ok', emoji: '😊', label: 'Just right' },
  { outcome: 'warm', emoji: '🥵', label: 'Too warm' },
];

export default function FeedbackPrompt({ visible, onAnswer, onDismiss }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>How was your outfit today?</Text>
          <Text style={styles.sub}>Your feedback helps improve recommendations</Text>
          <View style={styles.options}>
            {OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.outcome}
                style={styles.option}
                onPress={() => onAnswer(opt.outcome)}
              >
                <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                <Text style={styles.optionLabel}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.skip} onPress={onDismiss}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  sub: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
  },
  option: {
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
    width: 90,
    gap: spacing.xs,
  },
  optionEmoji: {
    fontSize: fontSizes.xxl,
  },
  optionLabel: {
    fontSize: fontSizes.sm,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  skip: {
    alignItems: 'center',
  },
  skipText: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
});
