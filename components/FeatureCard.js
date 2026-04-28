/**
 * FeatureCard — Cultural Modernism
 *
 * Reusable card for Home screen features.
 * Supports wide (full-width hero) and compact (half-width grid) layouts.
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { colors }     from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing }    from '../theme/spacing';
import { radius }     from '../theme/radius';
import { shadows }    from '../theme/shadows';

export function FeatureCard({
  emoji,
  title,
  subtitle,
  tag,
  accentColor   = colors.primaryContainer,
  accentText    = colors.onPrimaryContainer,
  bgColor       = colors.surfaceContainerLowest,
  wide          = false,
  badge,
  onPress,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();

  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, wide ? styles.wide : styles.compact]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, { backgroundColor: bgColor }, wide && styles.cardWide]}
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${subtitle}`}
      >
        {/* Top row: emoji icon + optional badge */}
        <View style={styles.topRow}>
          <View style={[styles.iconWrap, { backgroundColor: accentColor }]}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>
          {badge && (
            <View style={[styles.badge, { backgroundColor: accentColor }]}>
              <Text style={[styles.badgeText, { color: accentText }]}>{badge}</Text>
            </View>
          )}
        </View>

        {/* Tag */}
        {tag && (
          <Text style={[styles.tag, { color: accentText, backgroundColor: accentColor }]}>
            {tag}
          </Text>
        )}

        {/* Text */}
        <Text style={[styles.title, wide && styles.titleWide]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={wide ? 2 : 3}>
          {subtitle}
        </Text>

        {/* Arrow */}
        <View style={styles.arrowRow}>
          <Text style={[styles.arrow, { color: accentText, backgroundColor: accentColor }]}>
            →
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wide: {
    width: '100%',
  },
  compact: {
    flex: 1,
    minWidth: 0,
  },
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.card,
    gap: spacing.xs,
  },
  cardWide: {
    flexDirection: 'column',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: spacing.touchTarget,
    height: spacing.touchTarget,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    ...typography.titleMd,
  },
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    ...typography.captionSm,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  tag: {
    alignSelf: 'flex-start',
    ...typography.captionSm,
    textTransform: 'uppercase',
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.bodyMd,
    fontWeight: '600',
    color: colors.onSurface,
  },
  titleWide: {
    ...typography.titleSm,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  arrowRow: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  arrow: {
    width: spacing.lgXl,
    height: spacing.lgXl,
    borderRadius: radius.full,
    textAlign: 'center',
    lineHeight: spacing.lgXl,
    ...typography.bodySm,
    fontWeight: '700',
    overflow: 'hidden',
  },
});