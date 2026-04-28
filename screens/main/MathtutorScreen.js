import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
} from "react-native";

// ─── Theme ────────────────────────────────────────────────────────────────────
const theme = {
  colors: {
    bg: "#F4F6FD",
    surface: "#FFFFFF",
    surfaceAlt: "#EEF1FB",
    primary: "#4361EE",
    primaryLight: "#EBF0FF",
    primaryDark: "#3348C8",
    accent: "#F77F00",
    accentLight: "#FFF4E6",
    success: "#2DC653",
    successLight: "#E6F9EC",
    danger: "#E63946",
    dangerLight: "#FDECEA",
    text: "#1A1D2E",
    textSec: "#5A6080",
    textMuted: "#9098B8",
    border: "#DDE3F4",
    hint: "#7B5EA7",
    hintLight: "#F3EEFF",
    stepBg: "#F8F9FF",
    shadow: "#4361EE",
  },
  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    full: 999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const PROBLEM = {
  topic: "Profit & Loss",
  emoji: "🛒",
  description:
    "Ravi bought 12 kg of apples from a wholesale market at ₹40 per kg. He sold them at ₹55 per kg in his shop. What is his total profit?",
  correctAnswer: "180",
  hint: "💡 Profit = (Selling Price − Cost Price) × Quantity\nFirst find the difference per kg, then multiply by total kgs.",
  steps: [
    {
      number: 1,
      label: "Find Cost Price (CP)",
      detail: "CP = 12 kg × ₹40 = ₹480",
    },
    {
      number: 2,
      label: "Find Selling Price (SP)",
      detail: "SP = 12 kg × ₹55 = ₹660",
    },
    {
      number: 3,
      label: "Calculate Profit",
      detail: "Profit = SP − CP = ₹660 − ₹480 = ₹180",
    },
    {
      number: 4,
      label: "Answer",
      detail: "Ravi's total profit is ₹180 ✅",
    },
  ],
};

// ─── Components ───────────────────────────────────────────────────────────────

function Badge({ label, color = colors.primary }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + "22" }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function StepCard({ step, index }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 320,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 320,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.stepCard,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.stepNumberBubble}>
        <Text style={styles.stepNumber}>{step.number}</Text>
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepLabel}>{step.label}</Text>
        <Text style={styles.stepDetail}>{step.detail}</Text>
      </View>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function MathTutorScreen() {
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [feedback, setFeedback] = useState(null); // "correct" | "wrong" | null

  const hintAnim = useRef(new Animated.Value(0)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const inputShakeAnim = useRef(new Animated.Value(0)).current;

  function toggleHint() {
    const toValue = showHint ? 0 : 1;
    setShowHint(!showHint);
    Animated.spring(hintAnim, {
      toValue,
      useNativeDriver: true,
      tension: 70,
      friction: 8,
    }).start();
  }

  function shakeInput() {
    Animated.sequence([
      Animated.timing(inputShakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(inputShakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(inputShakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(inputShakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }

  function checkAnswer() {
    if (!answer.trim()) return;
    const isCorrect =
      answer.trim().replace(/[₹,\s]/g, "") === PROBLEM.correctAnswer;
    setFeedback(isCorrect ? "correct" : "wrong");
    if (!isCorrect) shakeInput();
    Animated.sequence([
      Animated.timing(feedbackAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2800),
      Animated.timing(feedbackAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setFeedback(null));
  }

  function handleSkip() {
    setAnswer("");
    setShowHint(false);
    setShowSolution(false);
    setFeedback(null);
    hintAnim.setValue(0);
  }

  const feedbackConfig = {
    correct: {
      bg: colors.successLight,
      border: colors.success,
      text: colors.success,
      icon: "🎉",
      msg: "Correct! Great job, Ravi would be proud!",
    },
    wrong: {
      bg: colors.errorLight,
      border: colors.error,
      text: colors.error,
      icon: "🤔",
      msg: "Not quite! Check the hint or solution below.",
    },
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.headerTitle}>Math Tutor</Text>
                <Text style={styles.headerSub}>Step-by-step learning</Text>
              </View>
              <View style={styles.headerBadgeGroup}>
                <Badge label="Class 7" color={colors.primary} />
                <Badge label="Easy" color={colors.success} />
              </View>
            </View>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
            <Text style={styles.progressLabel}>Question 1 of 5</Text>
          </View>

          {/* ── Problem Card ── */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>{PROBLEM.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTopic}>{PROBLEM.topic}</Text>
                <Text style={styles.cardTopicSub}>Real-life application</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <Text style={styles.problemText}>{PROBLEM.description}</Text>
          </View>

          {/* ── Input ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Your Answer</Text>
            <Animated.View
              style={{ transform: [{ translateX: inputShakeAnim }] }}
            >
              <View
                style={[
                  styles.inputWrapper,
                  feedback === "correct" && {
                    borderColor: colors.success,
                    backgroundColor: colors.successLight,
                  },
                  feedback === "wrong" && {
                    borderColor: colors.error,
                    backgroundColor: colors.errorLight,
                  },
                ]}
              >
                <Text style={styles.inputPrefix}>₹</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your answer"
                  placeholderTextColor={colors.onSurfaceMuted}
                  value={answer}
                  onChangeText={setAnswer}
                  keyboardType="numeric"
                  returnKeyType="done"
                  onSubmitEditing={checkAnswer}
                />
              </View>
            </Animated.View>

            {/* Feedback Toast */}
            {feedback && (
              <Animated.View
                style={[
                  styles.feedbackBanner,
                  {
                    backgroundColor: feedbackConfig[feedback].bg,
                    borderColor: feedbackConfig[feedback].border,
                    opacity: feedbackAnim,
                  },
                ]}
              >
                <Text style={styles.feedbackIcon}>
                  {feedbackConfig[feedback].icon}
                </Text>
                <Text
                  style={[
                    styles.feedbackText,
                    { color: feedbackConfig[feedback].text },
                  ]}
                >
                  {feedbackConfig[feedback].msg}
                </Text>
              </Animated.View>
            )}
          </View>

          {/* ── Hint ── */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[
                styles.hintButton,
                showHint && { backgroundColor: colors.tertiaryLight },
              ]}
              onPress={toggleHint}
              activeOpacity={0.75}
            >
              <Text style={styles.hintButtonIcon}>{showHint ? "🔒" : "💡"}</Text>
              <Text style={styles.hintButtonText}>
                {showHint ? "Hide Hint" : "Show Hint"}
              </Text>
              <View style={styles.hintChevron}>
                <Text style={{ color: colors.tertiary, fontSize: 12 }}>
                  {showHint ? "▲" : "▼"}
                </Text>
              </View>
            </TouchableOpacity>

            {showHint && (
              <Animated.View
                style={[
                  styles.hintBox,
                  {
                    opacity: hintAnim,
                    transform: [
                      {
                        translateY: hintAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-8, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.hintText}>{PROBLEM.hint}</Text>
              </Animated.View>
            )}
          </View>

          {/* ── CTA Buttons ── */}
          <View style={styles.ctaRow}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.checkButton,
                !answer.trim() && styles.checkButtonDisabled,
              ]}
              onPress={checkAnswer}
              disabled={!answer.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.checkButtonText}>Check Answer ✓</Text>
            </TouchableOpacity>
          </View>

          {/* ── Solution Toggle ── */}
          <TouchableOpacity
            style={styles.solutionToggle}
            onPress={() => setShowSolution((v) => !v)}
            activeOpacity={0.7}
          >
            <Text style={styles.solutionToggleText}>
              {showSolution ? "Hide Solution" : "📖 View Step-by-Step Solution"}
            </Text>
          </TouchableOpacity>

          {/* ── Step-by-Step Solution ── */}
          {showSolution && (
            <View style={styles.solutionSection}>
              <View style={styles.solutionHeader}>
                <Text style={styles.solutionTitle}>Solution</Text>
                <Badge label="Full Breakdown" color={colors.primary} />
              </View>
              {PROBLEM.steps.map((step, i) => (
                <StepCard key={step.number} step={step} index={i} />
              ))}
            </View>
          )}

          <View style={{ height: spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === "ios" ? 56 : 36,
    paddingBottom: spacing.lg,
  },

  // Header
  header: {
    marginBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.onSurface,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: colors.onSurfaceSec,
    marginTop: 2,
    fontWeight: "500",
  },
  headerBadgeGroup: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.outlineVariant,
    borderRadius: radius.full,
    overflow: "hidden",
    marginBottom: spacing.xs,
  },
  progressFill: {
    width: "20%",
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.onSurfaceMuted,
    fontWeight: "600",
  },

  // Card
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: "#4361EE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardTopic: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.primary,
  },
  cardTopicSub: {
    fontSize: 12,
    color: colors.onSurfaceMuted,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginVertical: spacing.sm,
  },
  problemText: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.onSurface,
    fontWeight: "500",
  },

  // Badge
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Section
  section: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.onSurfaceSec,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },

  // Input
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    paddingHorizontal: spacing.md,
    height: 56,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  inputPrefix: {
    fontSize: 20,
    color: colors.onSurfaceSec,
    marginRight: 6,
    fontWeight: "600",
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: colors.onSurface,
    fontWeight: "600",
  },

  // Feedback
  feedbackBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    padding: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1.5,
    gap: spacing.xs,
  },
  feedbackIcon: {
    fontSize: 18,
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },

  // Hint
  hintButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.tertiary + "40",
    gap: spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  hintButtonIcon: {
    fontSize: 20,
  },
  hintButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: colors.tertiary,
  },
  hintChevron: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.tertiaryLight,
    borderRadius: radius.full,
  },
  hintBox: {
    marginTop: spacing.sm,
    backgroundColor: colors.tertiaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.tertiary,
  },
  hintText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.tertiary,
    fontWeight: "500",
  },

  // CTA Buttons
  ctaRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  skipButton: {
    flex: 1,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: "center",
    justifyContent: "center",
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.onSurfaceSec,
  },
  checkButton: {
    flex: 2,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  checkButtonDisabled: {
    backgroundColor: colors.outlineVariant,
    shadowOpacity: 0,
    elevation: 0,
  },
  checkButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },

  // Solution Toggle
  solutionToggle: {
    alignItems: "center",
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  solutionToggleText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    textDecorationLine: "underline",
    textDecorationColor: colors.primaryLight,
  },

  // Solution Section
  solutionSection: {
    marginBottom: spacing.md,
  },
  solutionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  solutionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.onSurface,
  },

  // Step Card
  stepCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  stepNumberBubble: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
  },
  stepContent: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.onSurface,
    marginBottom: 3,
  },
  stepDetail: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.onSurfaceSec,
    fontWeight: "500",
  },
});
