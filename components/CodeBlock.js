
import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { colors }     from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing }    from '../theme/spacing';
import { radius }     from '../theme/radius';

// ── Block category colour map ─────────────────────────────
export const BLOCK_COLORS = {
  control:  { bg: colors.primaryFixed,     border: colors.primaryContainer,   text: colors.primary,          dot: colors.primaryContainer },
  output:   { bg: colors.secondaryFixed,   border: colors.secondaryContainer, text: colors.secondary,        dot: colors.secondaryContainer },
  variable: { bg: colors.tertiaryFixed,    border: colors.tertiaryContainer,  text: colors.tertiary,         dot: colors.tertiaryContainer },
  logic:    { bg: colors.errorContainer,   border: colors.error,              text: colors.onErrorContainer, dot: colors.error },
  math:     { bg: colors.surfaceContainerLow, border: colors.outline,         text: colors.onSurface,        dot: colors.outline },
};

export function CodeBlock({
  id,
  category = 'output',
  icon,
  label,
  value,
  indent = 0,
  selected = false,
  onPress,
  onMoveUp,
  onMoveDown,
  onDelete,
  isFirst = false,
  isLast = false,
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const theme = BLOCK_COLORS[category] || BLOCK_COLORS.output;

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40 }).start();
  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 20 }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, { marginLeft: indent * 20 }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`${label} block`}
      >
        <View style={[
          styles.block,
          { backgroundColor: theme.bg, borderColor: selected ? theme.text : theme.border },
          selected && styles.blockSelected,
        ]}>
          {/* Left connector notch */}
          <View style={[styles.notch, { backgroundColor: theme.dot }]} />

          {/* Icon */}
          <View style={[styles.iconWrap, { backgroundColor: theme.dot }]}>
            <Text style={styles.icon}>{icon}</Text>
          </View>

          {/* Label + value */}
          <View style={styles.textWrap}>
            <Text style={[styles.label, { color: theme.text }]} numberOfLines={1}>
              {label}
            </Text>
            {value !== undefined && (
              <Text style={[styles.value, { color: theme.text }]} numberOfLines={1}>
                {value}
              </Text>
            )}
          </View>

          {/* Actions — only when selected */}
          {selected && (
            <View style={styles.actions}>
              {!isFirst && (
                <TouchableOpacity style={styles.actionBtn} onPress={onMoveUp} hitSlop={6}>
                  <Text style={[styles.actionIcon, { color: theme.text }]}>↑</Text>
                </TouchableOpacity>
              )}
              {!isLast && (
                <TouchableOpacity style={styles.actionBtn} onPress={onMoveDown} hitSlop={6}>
                  <Text style={[styles.actionIcon, { color: theme.text }]}>↓</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.actionBtn} onPress={onDelete} hitSlop={6}>
                <Text style={[styles.actionIcon, { color: colors.error }]}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Right connector tab */}
          <View style={[styles.tab, { backgroundColor: theme.dot }]} />
        </View>
      </Pressable>

      {/* Connector line going down */}
      <View style={[styles.connector, { borderColor: theme.border }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  block: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 2,
    overflow: 'hidden',
    minHeight: 52,
  },
  blockSelected: {
    borderWidth: 2.5,
  },
  notch: {
    width: 6,
    alignSelf: 'stretch',
  },
  iconWrap: {
    width: 40,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  textWrap: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  label: {
    ...typography.labelCaps,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  value: {
    ...typography.bodyMd,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    paddingRight: spacing.sm,
    gap: spacing.xs,
  },
  actionBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 13,
    fontWeight: '700',
  },
  tab: {
    width: 6,
    alignSelf: 'stretch',
  },
  connector: {
    width: 2,
    height: 6,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    marginLeft: 19,
  },
});