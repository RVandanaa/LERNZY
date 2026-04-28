import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeatureCard }  from '../../components/FeatureCard';
import { ProgressBar }  from '../../components/ProgressBar';
import { colors }       from '../../theme/colors';
import { typography }   from '../../theme/typography';
import { spacing }      from '../../theme/spacing';
import { radius }       from '../../theme/radius';
import { shadows }      from '../../theme/shadows';
import useProfileStore  from '../../store/useProfileStore';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Static data ──────────────────────────────────────────

const FEATURES = [
  {
    id:          'ai-tutor',
    emoji:       '🤖',
    title:       'AI Tutor',
    subtitle:    'Ask anything. Get step-by-step explanations personalised to your level.',
    tag:         'Powered by AI',
    badge:       'NEW',
    accentColor: colors.primaryContainer,
    accentText:  colors.onPrimaryContainer,
    bgColor:     colors.primaryFixed,
    wide:        true,
  },
  {
    id:          'math-lab',
    emoji:       '🔢',
    title:       'Math Lab',
    subtitle:    'Interactive problems, graphs, and visualisations.',
    tag:         'Practice',
    accentColor: colors.secondaryContainer,
    accentText:  colors.onSecondaryContainer,
    bgColor:     colors.secondaryFixed,
    wide:        false,
  },
  {
    id:          'coding-lab',
    emoji:       '💻',
    title:       'Coding Lab',
    subtitle:    'Write, run, and debug real code in your browser.',
    tag:         'Hands-on',
    accentColor: colors.tertiaryContainer,
    accentText:  colors.onTertiaryContainer,
    bgColor:     colors.tertiaryFixed,
    wide:        false,
  },
  {
    id:          'sign-language',
    emoji:       '🤟',
    title:       'Sign Language Bridge',
    subtitle:    'Learn and practise ISL with real-time camera feedback.',
    tag:         'Accessibility',
    accentColor: colors.surfaceContainerHighest,
    accentText:  colors.onSurface,
    bgColor:     colors.surfaceContainerLow,
    wide:        true,
  },
];

const STREAKS = [
  { day: 'M', done: true },
  { day: 'T', done: true },
  { day: 'W', done: true },
  { day: 'T', done: false },
  { day: 'F', done: false },
  { day: 'S', done: false },
  { day: 'S', done: false },
];

const DAILY_GOAL_PCT = 65;

const QUICK_ACTIONS = [
  { emoji: '📝', label: 'Revise' },
  { emoji: '🎯', label: 'Quiz' },
  { emoji: '📊', label: 'Stats' },
  { emoji: '📅', label: 'Plan' },
];

// ─── Greeting helper ──────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Main screen ──────────────────────────────────────────

export default function HomeScreen({ navigation }) {
  const { name, avatar } = useProfileStore();
  const displayName = name || 'Learner';
  const avatarEmoji = avatar ? {
    owl: '🦉', rocket: '🚀', plant: '🌱', star: '⭐',
    book: '📚', lamp: '💡', palette: '🎨', atom: '⚛️',
  }[avatar] : '🦉';

  const [isOnline, setIsOnline] = useState(true);

  // ── Entrance animations ────────────────────────────────
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleFeaturePress = (id) => {
    // Navigation to feature screens (future)
    console.log('Navigate to:', id);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── Header ──────────────────────────────── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {/* Offline / Online badge */}
              <View style={[styles.statusBadge, isOnline ? styles.statusOnline : styles.statusOffline]}>
                <View style={[styles.statusDot, isOnline ? styles.dotOnline : styles.dotOffline]} />
                <Text style={[styles.statusText, isOnline ? styles.statusTextOnline : styles.statusTextOffline]}>
                  {isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>

            {/* Avatar + notification */}
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
                <Text style={styles.notifIcon}>🔔</Text>
                <View style={styles.notifDot} />
              </TouchableOpacity>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarEmoji}>{avatarEmoji}</Text>
              </View>
            </View>
          </View>

          {/* ── Greeting ────────────────────────────── */}
          <View style={styles.greetingBlock}>
            <Text style={styles.greetingLabel}>{getGreeting()} 🙏</Text>
            <Text style={styles.greetingName}>
              Namaste, {displayName}!
            </Text>
            <Text style={styles.greetingSub}>
              Ready to learn something amazing today?
            </Text>
          </View>

          {/* ── Daily goal card ─────────────────────── */}
          <View style={styles.goalCard}>
            <View style={styles.goalTop}>
              <View>
                <Text style={styles.goalTitle}>Daily Goal</Text>
                <Text style={styles.goalSub}>3 of 5 tasks done</Text>
              </View>
              <View style={styles.goalPct}>
                <Text style={styles.goalPctNum}>{DAILY_GOAL_PCT}%</Text>
              </View>
            </View>

            <ProgressBar
              value={DAILY_GOAL_PCT}
              variant="linear"
              height={10}
              animated
            />

            {/* Streak dots */}
            <View style={styles.streakRow}>
              {STREAKS.map((s, i) => (
                <View key={i} style={styles.streakItem}>
                  <View style={[styles.streakDot, s.done && styles.streakDotDone]}>
                    {s.done && <Text style={styles.streakCheck}>✓</Text>}
                  </View>
                  <Text style={[styles.streakDay, s.done && styles.streakDayDone]}>{s.day}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Quick actions ───────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Quick Actions</Text>
            <View style={styles.quickRow}>
              {QUICK_ACTIONS.map((q) => (
                <TouchableOpacity key={q.label} style={styles.quickItem} activeOpacity={0.75}>
                  <View style={styles.quickIcon}>
                    <Text style={styles.quickEmoji}>{q.emoji}</Text>
                  </View>
                  <Text style={styles.quickLabel}>{q.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Feature cards ───────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>Explore</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.sectionLink}>See all →</Text>
              </TouchableOpacity>
            </View>

            {/* AI Tutor — wide hero card */}
            <FeatureCard
              {...FEATURES[0]}
              onPress={() => handleFeaturePress(FEATURES[0].id)}
            />

            {/* Math Lab + Coding Lab — 2-col grid */}
            <View style={styles.cardRow}>
              <FeatureCard
                {...FEATURES[1]}
                onPress={() => handleFeaturePress(FEATURES[1].id)}
              />
              <FeatureCard
                {...FEATURES[2]}
                onPress={() => handleFeaturePress(FEATURES[2].id)}
              />
            </View>

            {/* Sign Language Bridge — wide */}
            <FeatureCard
              {...FEATURES[3]}
              onPress={() => handleFeaturePress(FEATURES[3].id)}
            />
          </View>

          {/* ── Motivational banner ─────────────────── */}
          <View style={styles.motiveBanner}>
            <Text style={styles.motiveEmoji}>🔥</Text>
            <View style={styles.motiveText}>
              <Text style={styles.motiveTitle}>3-day streak!</Text>
              <Text style={styles.motiveSub}>Keep going — you're on fire.</Text>
            </View>
            <View style={styles.motiveBadge}>
              <Text style={styles.motiveBadgeText}>+50 XP</Text>
            </View>
          </View>

          <View style={{ height: spacing.xxxl }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenMarginMobile,
    paddingTop: spacing.sm,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  // Status badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  statusOnline: {
    backgroundColor: colors.successContainer,
    borderColor: colors.success,
  },
  statusOffline: {
    backgroundColor: colors.surfaceContainerHigh,
    borderColor: colors.outline,
  },
  statusDot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: spacing.sm / 2,
  },
  dotOnline:  { backgroundColor: colors.success },
  dotOffline: { backgroundColor: colors.outline },
  statusText: {
    ...typography.captionSm,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  statusTextOnline:  { color: colors.onSuccessContainer },
  statusTextOffline: { color: colors.onSurfaceVariant },

  // Notification
  notifBtn: {
    width: spacing.xxl,
    height: spacing.xxl,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifIcon: { ...typography.bodyLg },
  notifDot: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: spacing.sm / 2,
    backgroundColor: colors.error,
    borderWidth: 1.5,
    borderColor: colors.background,
  },

  // Avatar
  avatarCircle: {
    width: spacing.xxl,
    height: spacing.xxl,
    borderRadius: spacing.mdLg,
    backgroundColor: colors.primaryFixed,
    borderWidth: 2,
    borderColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { ...typography.titleSm },

  // Greeting
  greetingBlock: {
    marginBottom: spacing.lg,
  },
  greetingLabel: {
    ...typography.labelCaps,
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  greetingName: {
    ...typography.headlineMd,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  greetingSub: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },

  // Goal card
  goalCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  goalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalTitle: {
    ...typography.titleSm,
    color: colors.onSurface,
  },
  goalSub: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '400',
    textTransform: 'none',
    letterSpacing: 0,
    marginTop: 2,
  },
  goalPct: {
    width: spacing.touchTargetLg,
    height: spacing.touchTargetLg,
    borderRadius: spacing.touchTargetLg / 2,
    backgroundColor: colors.primaryFixed,
    borderWidth: 3,
    borderColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalPctNum: {
    ...typography.bodySm,
    fontWeight: '600',
    color: colors.primary,
  },

  // Streak
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  streakItem: {
    alignItems: 'center',
    gap: 4,
  },
  streakDot: {
    width: spacing.lgXl,
    height: spacing.lgXl,
    borderRadius: spacing.lgXl / 2,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
  },
  streakDotDone: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  streakCheck: {
    ...typography.caption,
    color: colors.onPrimaryContainer,
    fontWeight: '700',
  },
  streakDay: {
    ...typography.captionSm,
    color: colors.textDisabled,
    fontWeight: '400',
    textTransform: 'none',
    letterSpacing: 0,
  },
  streakDayDone: {
    color: colors.primary,
    fontWeight: '700',
  },

  // Section
  section: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    ...typography.bodyMd,
    fontWeight: '600',
    color: colors.onSurface,
  },
  sectionLink: {
    ...typography.captionSm,
    textTransform: 'uppercase',
    fontWeight: '700',
    color: colors.secondary,
  },

  // Quick actions
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  quickItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  quickIcon: {
    width: spacing.touchTargetLg,
    height: spacing.touchTargetLg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
  },
  quickEmoji: { ...typography.titleMd },
  quickLabel: {
    ...typography.captionSm,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'none',
    letterSpacing: 0,
  },

  // Feature card row
  cardRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  // Motivational banner
  motiveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inverseSurface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  motiveEmoji: { ...typography.headlineMd },
  motiveText: { flex: 1 },
  motiveTitle: {
    ...typography.bodyMd,
    fontWeight: '600',
    color: colors.inverseOnSurface,
  },
  motiveSub: {
    ...typography.caption,
    color: colors.surfaceDim,
    fontWeight: '400',
    textTransform: 'none',
    letterSpacing: 0,
    marginTop: 2,
  },
  motiveBadge: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  motiveBadgeText: {
    ...typography.labelCaps,
    color: colors.onPrimaryContainer,
  },
});