import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';

export const ProgressBar = ({
  value,
  variant = 'linear',
  segments = 5,
  showLabel = false,
  label,
  height = spacing.smX,
  animated = true,
  style,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  if (variant === 'segmented') {
    return <SegmentedProgress value={clampedValue} segments={segments} showLabel={showLabel} label={label} style={style} />;
  }

  return <LinearProgress value={clampedValue} height={height} showLabel={showLabel} label={label} animated={animated} style={style} />;
};

const LinearProgress = ({ value, height, showLabel, label, animated, style }) => {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.spring(widthAnim, { toValue: value, useNativeDriver: false, tension: 60, friction: 10 }).start();
    } else {
      widthAnim.setValue(value);
    }
  }, [value, animated]);

  const fillWidth = widthAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'], extrapolate: 'clamp' });

  return (
    <View style={[styles.linearWrapper, style]}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.labelText}>{label ?? `${Math.round(value)}%`}</Text>
        </View>
      )}
      <View style={[styles.linearTrack, { height, borderRadius: height / 2 }]}>
        <Animated.View style={[styles.linearFill, { width: fillWidth, height, borderRadius: height / 2 }]}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: value }}
        />
        {value > 5 && (
          <Animated.View style={[styles.leadingDot, { left: fillWidth, top: (height - spacing.mdSm) / 2 }]} />
        )}
      </View>
    </View>
  );
};

const SegmentedProgress = ({ value, segments, showLabel, label, style }) => {
  const filledCount = Math.round((value / 100) * segments);
  return (
    <View style={[styles.segmentedWrapper, style]}>
      {showLabel && (
        <Text style={[styles.labelText, { marginBottom: spacing.xs }]}>
          {label ?? `${filledCount} / ${segments}`}
        </Text>
      )}
      <View style={styles.segmentRow}>
        {Array.from({ length: segments }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.segment,
              i < filledCount ? styles.segmentFilled : styles.segmentEmpty,
              i === 0 && styles.segmentFirst,
              i === segments - 1 && styles.segmentLast,
              i !== segments - 1 && styles.segmentGap,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  linearWrapper:   { width: '100%' },
  labelRow:        { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: spacing.xs },
  labelText:       { ...typography.labelCaps, color: colors.onSurfaceVariant },
  linearTrack:     { width: '100%', backgroundColor: colors.surfaceContainerHighest, overflow: 'hidden', position: 'relative' },
  linearFill:      { position: 'absolute', left: 0, top: 0, backgroundColor: colors.primaryContainer },
  leadingDot:      { position: 'absolute', width: spacing.mdSm, height: spacing.mdSm, borderRadius: spacing.mdSm / 2, backgroundColor: colors.primary, transform: [{ translateX: -(spacing.mdSm / 2) }], zIndex: 1 },
  segmentedWrapper:{ width: '100%' },
  segmentRow:      { flexDirection: 'row', alignItems: 'center' },
  segment:         { flex: 1, height: spacing.sm },
  segmentFilled:   { backgroundColor: colors.primaryContainer },
  segmentEmpty:    { backgroundColor: colors.surfaceContainerHighest },
  segmentFirst:    { borderTopLeftRadius: radius.full, borderBottomLeftRadius: radius.full },
  segmentLast:     { borderTopRightRadius: radius.full, borderBottomRightRadius: radius.full },
  segmentGap:      { marginRight: spacing.xs },
});