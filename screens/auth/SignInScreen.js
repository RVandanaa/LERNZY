import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { InputField } from '../../components/InputField';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';
import useAuthStore from '../../store/useAuthStore';
import { ONBOARDING_COMPLETE_KEY } from '../../constants/onboarding';
export default function SignInScreen({ navigation }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    const e = {};
    if (!email.trim())    e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email address';
    if (!password.trim()) e.password = 'Password is required';
    setErrors(e);
    
    if (Object.keys(e).length > 0) {
      const errorMsg = Object.values(e).join('\n');
      Alert.alert('Validation Error', errorMsg);
    }
    return Object.keys(e).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await useAuthStore.getState().login(email.trim(), password);
      const onboarded = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      navigation.reset({
        index: 0,
        routes: [{ name: onboarded === 'true' ? 'MainApp' : 'ProfileSetup' }],
      });
    } catch (err) {
      const title = 'Sign In Failed';
      const message =
        err.message === 'Network request failed'
          ? 'Unable to reach the backend server. Make sure the backend is running and your device/emulator can reach it.'
          : err.message || 'Please check your credentials and try again.';
      Alert.alert(title, message, [
        { text: 'Try Again', style: 'default' },
        { text: 'Cancel', style: 'cancel' }
      ]);
    } finally {
      setLoading(false);
    }
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

          {/* ── Brand header ─────────────────────────── */}
          <View style={styles.header}>
            <View style={styles.logoMark}>
              <Text style={styles.logoGlyph}>◈</Text>
            </View>
            <Text style={styles.brandName}>LERNZY</Text>
            <Text style={styles.tagline}>Your learning companion</Text>
          </View>

          {/* ── Card ─────────────────────────────────── */}
          <View style={styles.card}>

            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSubtitle}>
              Sign in to continue your journey
            </Text>

            <View style={styles.fields}>
              <InputField
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChangeText={t => { setEmail(t); setErrors(p => ({ ...p, email: null })); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={errors.email}
              />

              <InputField
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={t => { setPassword(t); setErrors(p => ({ ...p, password: null })); }}
                secureTextEntry={!showPass}
                autoComplete="password"
                error={errors.password}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPass(v => !v)} hitSlop={8}>
                    <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁'}</Text>
                  </TouchableOpacity>
                }
              />

              <TouchableOpacity style={styles.forgotRow} activeOpacity={0.7}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Primary CTA */}
            <Button
              label="Sign In"
              variant="primary"
              fullWidth
              onPress={handleSignIn}
              loading={loading}
              disabled={loading}
            />

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social buttons */}
            <View style={styles.socialRow}>
              <SocialButton icon="G" label="Google"   onPress={() => {}} />
              <SocialButton icon="f" label="Facebook" onPress={() => {}} />
            </View>
          </View>

          {/* ── Footer ───────────────────────────────── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')} activeOpacity={0.7}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ── Social button sub-component ──────────────────────── */
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

  // Header
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  logoMark: {
    width: spacing.xxxl,
    height: spacing.xxxl,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  logoGlyph: {
    ...typography.headlineMd,
    color: colors.onPrimaryContainer,
  },
  brandName: {
    ...typography.headlineMd,
    color: colors.primary,
  },
  tagline: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Card
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    padding: spacing.lg,
    ...shadows.raised,
  },
  cardTitle: {
    ...typography.titleSm,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },

  // Fields
  fields: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  eyeIcon: {
    ...typography.bodyMd,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: -spacing.xs,
  },
  forgotText: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: '700',
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