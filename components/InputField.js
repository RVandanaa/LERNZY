import React, { useState, useCallback, forwardRef } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';

export const InputField = forwardRef(({
  label,
  hint,
  error,
  disabled = false,
  leftIcon,
  rightIcon,
  onFocus,
  onBlur,
  ...rest
}, ref) => {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);

  const handleFocus = useCallback((e) => { setFocused(true); onFocus?.(e); }, [onFocus]);
  const handleBlur  = useCallback((e) => { setFocused(false); onBlur?.(e); }, [onBlur]);

  const borderColor = hasError ? colors.error
    : focused   ? colors.primary
    : disabled  ? colors.surfaceDim
    : colors.outlineVariant;

  const inputWrapperStyle = [
    styles.inputWrapper,
    {
      borderColor,
      borderWidth: focused ? 3 : 1.5,
      backgroundColor: disabled ? colors.surfaceContainerHighest
        : hasError ? colors.errorContainer
        : colors.surfaceContainerLowest,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
      <View style={inputWrapperStyle}>
        {leftIcon  && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          ref={ref}
          style={[styles.input, { color: disabled ? colors.textDisabled : colors.onSurface }]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          placeholderTextColor={colors.textDisabled}
          accessibilityLabel={label}
          accessibilityState={{ disabled }}
          {...rest}
        />
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
      {(hint || hasError) && (
        <Text style={[styles.helper, hasError && styles.helperError]}>
          {hasError ? error : hint}
        </Text>
      )}
    </View>
  );
});

InputField.displayName = 'InputField';

const styles = StyleSheet.create({
  container:    { gap: spacing.xs },
  label:        { ...typography.labelCaps, color: colors.onSurfaceVariant, marginBottom: spacing.xs },
  inputWrapper: { height: spacing.touchTargetLg, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, overflow: 'hidden' },
  input:        { flex: 1, ...typography.bodyMd, paddingVertical: 0 },
  iconLeft:     { marginRight: spacing.sm },
  iconRight:    { marginLeft: spacing.sm },
  helper:       { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  helperError:  { color: colors.error },
});