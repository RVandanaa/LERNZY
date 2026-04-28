import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { InputField } from '../../components/InputField';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';

export default function SignUpScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '',
  });
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors]           = useState({});
  const [agreed, setAgreed]           = useState(false);

  const set = (key) => (val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Full name is required';
    if (!form.email.trim())   e.email   = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password)       e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    if (!agreed)              e.terms = 'Please accept the terms';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignUp = () => {
    if (validate()) navigation.navigate('ProfileSetup');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ── Top bar ──────────────────────────────── */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              hitSlop={8}
              activeOpacity={0.7}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          </View>

          {/* ── Hero text ────────────────────────────── */}
          <View style={styles.hero}>
            <View style={styles.badgePill}>
              <Text style={styles.badgeText}>Free forever</Text>
            </View>
            <Text style={styles.heroTitle}>Start your{'\n'}learning journey</Text>
            <Text style={styles.heroSub}>
              Join thousands of students mastering new skills every day.
            </Text>
          </View>

          {/* ── Card ─────────────────────────────────── */}
          <View style={styles.card}>

            {/* Social first — lower friction */}
            <View style={styles.socialRow}>
              <SocialButton icon="G" label="Google"   onPress={() => {}} />
              <SocialButton icon="f" label="Facebook" onPress={() => {}} />
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>or sign up with email</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Fields */}
            <View style={styles.fields}>
              <InputField
                label="Full Name"
                placeholder="Priya Sharma"
                value={form.name}
                onChangeText={set('name')}
                autoComplete="name"
                autoCapitalize="words"
                error={errors.name}
              />

              <InputField
                label="Email Address"
                placeholder="you@example.com"
                value={form.email}
                onChangeText={set('email')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={errors.email}
              />

              <InputField
                label="Password"
                placeholder="At least 8 characters"
                value={form.password}
                onChangeText={set('password')}
                secureTextEntry={!showPass}
                error={errors.password}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPass(v => !v)} hitSlop={8}>
                    <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁'}</Text>
                  </TouchableOpacity>
                }
              />

              <InputField
                label="Confirm Password"
                placeholder="Repeat your password"
                value={form.confirm}
                onChangeText={set('confirm')}
                secureTextEntry={!showConfirm}
                error={errors.confirm}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowConfirm(v => !v)} hitSlop={8}>
                    <Text style={styles.eyeIcon}>{showConfirm ? '🙈' : '👁'}</Text>
                  </TouchableOpacity>
                }
              />
            </View>

            {/* Password strength indicator */}
            {form.password.length > 0 && (
              <StrengthMeter password={form.password} />
            )}

            {/* Terms */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => { setAgreed(v => !v); setErrors(p => ({ ...p, terms: null })); }}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={[styles.termsText, errors.terms && { color: colors.error }]}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {/* CTA */}
            <View style={styles.ctaRow}>
              <Button
                label="Create Account"
                variant="primary"
                fullWidth
                onPress={handleSignUp}
              />
            </View>
          </View>

          {/* ── Footer ───────────────────────────────── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')} activeOpacity={0.7}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ── Password strength meter ───────────────────────────── */
function StrengthMeter({ password }) {
  const score = (() => {
    let s = 0;
    if (password.length >= 8)          s++;
    if (/[A-Z]/.test(password))        s++;
    if (/[0-9]/.test(password))        s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  const barColors = [colors.error, colors.tertiary, colors.secondaryContainer, colors.primaryContainer];

  return (
    <View style={strengthStyles.wrap}>
      <View style={strengthStyles.bars}>
        {[0, 1, 2, 3].map(i => (
          <View
            key={i}
            style={[
              strengthStyles.bar,
              { backgroundColor: i < score ? barColors[score - 1] : colors.surfaceContainerHighest },
            ]}
          />
        ))}
      </View>
      <Text style={[strengthStyles.label, { color: score > 0 ? barColors[score - 1] : colors.textDisabled }]}>
        {score > 0 ? labels[score - 1] : ''}
      </Text>
    </View>
  );
}

const strengthStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    marginTop: -spacing.xs,
  },
  bars: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: radius.full,
  },
  label: {
    ...typography.captionSm,
    textTransform: 'uppercase',
    width: spacing.touchTarget,
    textAlign: 'right',
  },
});

/* ── Social button ─────────────────────────────────────── */
function SocialButton({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.socialBtn} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.socialIconCircle}>
        <Text style={styles.socialIcon}>{icon}</Text>
      </View>
      <Text style={styles.socialLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ── Styles ────────────────────────────────────────────── */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  kav: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenMarginMobile,
    paddingBottom: spacing.xl,
  },

  // Top bar
  topBar: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    width: spacing.minTouchTarget,
    height: spacing.minTouchTarget,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    ...typography.titleSm,
    color: colors.onSurface,
  },

  // Hero
  hero: {
    paddingBottom: spacing.lg,
  },
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondaryContainer,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  badgeText: {
    ...typography.labelCaps,
    color: colors.onSecondaryContainer,
  },
  heroTitle: {
    ...typography.displayLg,
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  heroSub: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    lineHeight: 24,
  },

  // Card
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.raised,
  },

  // Fields
  fields: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  eyeIcon: {
    ...typography.bodyMd,
  },

  // Terms
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  checkbox: {
    width: spacing.mdLg,
    height: spacing.mdLg,
    borderRadius: radius.xs,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  checkMark: {
    ...typography.caption,
    color: colors.onPrimaryContainer,
    fontWeight: '700',
  },
  termsText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
    fontWeight: '400',
    textTransform: 'none',
    letterSpacing: 0,
  },
  termsLink: {
    color: colors.secondary,
    fontWeight: '700',
  },

  ctaRow: {
    gap: spacing.sm,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.outlineVariant,
  },
  dividerLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  // Social
  socialRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: spacing.minTouchTarget,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLow,
    gap: spacing.sm,
  },
  socialIconCircle: {
    width: spacing.lg,
    height: spacing.lg,
    borderRadius: spacing.lg / 2,
    backgroundColor: colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.onSurface,
  },
  socialLabel: {
    ...typography.button,
    color: colors.onSurface,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  footerText: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
  footerLink: {
    ...typography.bodyMd,
    fontWeight: '700',
    color: colors.primary,
  },
});