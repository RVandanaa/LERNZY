import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';
import { shadows } from '../theme/shadows';

export const Card = ({ children, variant = 'default', header, footer, onPress, style }) => {
  const containerStyle = [styles.base, variantStyles[variant], style];

  const Inner = (
    <View style={styles.inner}>
      {header && (<><View style={styles.header}>{header}</View><View style={styles.divider} /></>)}
      <View style={styles.body}>{children}</View>
      {footer && (<><View style={styles.divider} /><View style={styles.footer}>{footer}</View></>)}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [...containerStyle, pressed && styles.pressed]}
        accessibilityRole="button"
      >
        {Inner}
      </Pressable>
    );
  }

  return <View style={containerStyle}>{Inner}</View>;
};

Card.Title = function CardTitle({ title, subtitle }) {
  return (
    <View>
      <Text style={cardTitleStyles.title}>{title}</Text>
      {subtitle && <Text style={cardTitleStyles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  base:    { borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surfaceContainerLowest },
  inner:   { flex: 1 },
  header:  { paddingHorizontal: spacing.cardPadding, paddingTop: spacing.cardPadding, paddingBottom: spacing.md },
  body:    { padding: spacing.cardPadding },
  footer:  { paddingHorizontal: spacing.cardPadding, paddingTop: spacing.md, paddingBottom: spacing.cardPadding },
  divider: { height: 1, backgroundColor: colors.outlineVariant, marginHorizontal: spacing.cardPadding },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
});

const variantStyles = {
  default:  { backgroundColor: colors.surfaceContainerLowest, ...shadows.card },
  outlined: { backgroundColor: colors.surfaceContainerLowest, borderWidth: 1.5, borderColor: colors.outlineVariant },
  elevated: { backgroundColor: colors.surfaceContainerLowest, ...shadows.raised },
  filled:   { backgroundColor: colors.surfaceContainerLow },
};

const cardTitleStyles = StyleSheet.create({
  title:    { ...typography.titleSm, color: colors.onSurface },
  subtitle: { ...typography.bodyMd, color: colors.textSecondary, marginTop: spacing.xs },
});