import React, { useCallback } from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';

const ACCENT_MAP = {
  saffron: { selectedBg: colors.primaryContainer,  selectedText: colors.onPrimaryContainer,  unselectedBorder: colors.outlineVariant, unselectedText: colors.onSurfaceVariant },
  teal:    { selectedBg: colors.secondaryContainer, selectedText: colors.onSecondaryContainer, unselectedBorder: colors.outlineVariant, unselectedText: colors.onSurfaceVariant },
  clay:    { selectedBg: colors.tertiaryContainer,  selectedText: colors.onTertiaryContainer,  unselectedBorder: colors.outlineVariant, unselectedText: colors.onSurfaceVariant },
};

export const Chip = ({
  label,
  selected = false,
  onPress,
  accent = 'saffron',
  disabled = false,
  leftIcon,
}) => {
  const accentTokens = ACCENT_MAP[accent];
  const handlePress = useCallback(() => { if (!disabled) onPress?.(); }, [disabled, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.base,
        selected
          ? { backgroundColor: accentTokens.selectedBg, borderColor: 'transparent' }
          : { backgroundColor: colors.surfaceContainerLow, borderColor: accentTokens.unselectedBorder },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
      <Text style={[
        styles.label,
        { color: selected ? accentTokens.selectedText : disabled ? colors.textDisabled : accentTokens.unselectedText },
      ]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base:     { height: spacing.xxl - spacing.xs, paddingHorizontal: spacing.md, borderRadius: radius.full, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  label:    { ...typography.labelCaps },
  icon:     { marginRight: spacing.xs },
  pressed:  { opacity: 0.8, transform: [{ scale: 0.97 }] },
  disabled: { opacity: 0.4 },
});