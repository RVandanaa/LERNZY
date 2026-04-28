import React, { useCallback, useState } from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import { shadows } from '../theme/shadows';

const SIZE = {
  sm: { height: spacing.xxl,  paddingHorizontal: spacing.md },
  md: { height: spacing.minTouchTarget, paddingHorizontal: spacing.lg },
  lg: { height: spacing.touchTargetLg,  paddingHorizontal: spacing.xl },
};

export const Button = ({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  onPress,
  ...rest
}) => {
  const [pressed, setPressed] = useState(false);
  const isDisabled = disabled || loading;
  const sizeTokens = SIZE[size];

  const handlePressIn = useCallback(() => setPressed(true), []);
  const handlePressOut = useCallback(() => setPressed(false), []);

  const containerStyle = [
    styles.base,
    { height: sizeTokens.height, paddingHorizontal: sizeTokens.paddingHorizontal, alignSelf: fullWidth ? 'stretch' : 'flex-start' },
    variantContainer[variant],
    pressed && !isDisabled && variantPressed[variant],
    isDisabled && variantDisabled[variant],
    pressed && !isDisabled && shadows.buttonPressed,
    !pressed && variant === 'primary' && !isDisabled && shadows.card,
  ];

  const labelStyle = [
    styles.label,
    variantLabel[variant],
    isDisabled && styles.labelDisabled,
  ];

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={isDisabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={label}
      style={containerStyle}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.onPrimary : colors.primary}
        />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text style={labelStyle} numberOfLines={1}>{label}</Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  content: { flexDirection: 'row', alignItems: 'center' },
  label: { ...typography.button },
  labelDisabled: { color: colors.textDisabled },
  iconLeft: { marginRight: spacing.sm },
  iconRight: { marginLeft: spacing.sm },
});

const variantContainer = {
  primary:   { backgroundColor: colors.primaryContainer, borderColor: 'transparent' },
  secondary: { backgroundColor: 'transparent', borderColor: colors.secondary },
  ghost:     { backgroundColor: 'transparent', borderColor: 'transparent' },
};

const variantPressed = {
  primary:   { backgroundColor: colors.primary, transform: [{ translateY: 2 }] },
  secondary: { backgroundColor: colors.secondaryContainer },
  ghost:     { backgroundColor: colors.surfaceContainerLow },
};

const variantDisabled = {
  primary:   { backgroundColor: colors.surfaceContainerHighest, borderColor: 'transparent' },
  secondary: { borderColor: colors.outline, backgroundColor: 'transparent' },
  ghost:     { backgroundColor: 'transparent' },
};

const variantLabel = {
  primary:   { color: colors.onPrimaryContainer },
  secondary: { color: colors.secondary },
  ghost:     { color: colors.secondary },
};