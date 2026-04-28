import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Platform,
  StatusBar,
  TextInput,
  Dimensions,
} from "react-native";

const { width: SCREEN_W } = Dimensions.get("window");

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  colors: {
    // Backgrounds — dark camera-friendly base
    bg: "#0F1117",
    surface: "#1A1D27",
    surfaceAlt: "#22263A",
    surfaceLift: "#2A2F47",

    // Brand — teal-green: accessibility + tech
    primary: "#00C9A7",
    primaryDark: "#00A489",
    primaryLight: "#00C9A720",
    primaryGlow: "#00C9A740",

    // Accent — warm amber for detected signs
    accent: "#FFB347",
    accentLight: "#FFB34720",

    // Text
    textPrimary: "#F0F4FF",
    textSec: "#8B93B0",
    textMuted: "#4A5075",
    textOnPrimary: "#0F1117",

    // Detection overlay
    frameCorner: "#00C9A7",
    frameScan: "#00C9A760",

    // Toggle
    toggleTrack: "#22263A",
    toggleActive: "#00C9A7",

    // Status
    detecting: "#00C9A7",
    idle: "#4A5075",
    detected: "#FFB347",

    // Border
    border: "#2A2F47",
    borderBright: "#00C9A730",
  },
  radius: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 28,
    full: 999,
  },
  sp: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
};

// ─── Constants ────────────────────────────────────────────────────────────────
const MODES = { SIGN_TO_TEXT: "sign_to_text", TEXT_TO_SIGN: "text_to_sign" };

const DETECTED_SIGNS = [
  { sign: "👋", label: "Hello", confidence: 97 },
  { sign: "🤟", label: "I Love You", confidence: 91 },
  { sign: "✌️", label: "Peace / Victory", confidence: 88 },
  { sign: "👍", label: "Good / Yes", confidence: 94 },
  { sign: "🤙", label: "Call Me", confidence: 85 },
];

const SIGN_ALPHABET = [
  { letter: "A", emoji: "🤜" },
  { letter: "B", emoji: "✋" },
  { letter: "C", emoji: "🤏" },
  { letter: "D", emoji: "👆" },
  { letter: "E", emoji: "✊" },
  { letter: "F", emoji: "👌" },
  { letter: "G", emoji: "👉" },
  { letter: "H", emoji: "🤞" },
  { letter: "I", emoji: "🤙" },
  { letter: "J", emoji: "☝️" },
  { letter: "K", emoji: "✌️" },
  { letter: "L", emoji: "🤙" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

// Animated scanning line inside camera preview
function ScanLine() {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 180],
  });

  return (
    <Animated.View
      style={[styles.scanLine, { transform: [{ translateY }] }]}
    />
  );
}

// Pulsing status dot
function PulseDot({ color = T.colors.primary }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.5,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.8,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.pulseDotWrapper}>
      <Animated.View
        style={[
          styles.pulseDotRing,
          { backgroundColor: color + "30", transform: [{ scale }], opacity },
        ]}
      />
      <View style={[styles.pulseDotCore, { backgroundColor: color }]} />
    </View>
  );
}

// Frame corner bracket
function FrameCorner({ position }) {
  const style = [
    styles.frameCorner,
    position === "tl" && { top: 0, left: 0 },
    position === "tr" && {
      top: 0,
      right: 0,
      transform: [{ rotate: "90deg" }],
    },
    position === "bl" && {
      bottom: 0,
      left: 0,
      transform: [{ rotate: "-90deg" }],
    },
    position === "br" && {
      bottom: 0,
      right: 0,
      transform: [{ rotate: "180deg" }],
    },
  ];
  return (
    <View style={style}>
      <View style={styles.cornerH} />
      <View style={styles.cornerV} />
    </View>
  );
}

// Confidence bar
function ConfidenceBar({ value }) {
  const width = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(width, {
      toValue: value,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const color =
    value > 90
      ? T.colors.primary
      : value > 75
      ? T.colors.accent
      : "#FF6B6B";

  return (
    <View style={styles.confBarTrack}>
      <Animated.View
        style={[
          styles.confBarFill,
          {
            width: width.interpolate({
              inputRange: [0, 100],
              outputRange: ["0%", "100%"],
            }),
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

// Toggle switch
function ModeToggle({ mode, onToggle }) {
  const anim = useRef(
    new Animated.Value(mode === MODES.SIGN_TO_TEXT ? 0 : 1)
  ).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: mode === MODES.SIGN_TO_TEXT ? 0 : 1,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
    }).start();
  }, [mode]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 130],
  });

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.85}
      style={styles.toggleTrack}
    >
      {/* Labels */}
      <View style={styles.toggleLabels}>
        <View style={styles.toggleLabelItem}>
          <Text style={styles.toggleLabelIcon}>🤟</Text>
          <Text
            style={[
              styles.toggleLabelText,
              mode === MODES.SIGN_TO_TEXT && styles.toggleLabelActive,
            ]}
          >
            Sign → Text
          </Text>
        </View>
        <View style={styles.toggleLabelItem}>
          <Text style={styles.toggleLabelIcon}>💬</Text>
          <Text
            style={[
              styles.toggleLabelText,
              mode === MODES.TEXT_TO_SIGN && styles.toggleLabelActive,
            ]}
          >
            Text → Sign
          </Text>
        </View>
      </View>
      {/* Thumb */}
      <Animated.View
        style={[styles.toggleThumb, { transform: [{ translateX }] }]}
      />
    </TouchableOpacity>
  );
}

// Sign alphabet card
function SignCard({ item }) {
  return (
    <View style={styles.signCard}>
      <Text style={styles.signCardEmoji}>{item.emoji}</Text>
      <Text style={styles.signCardLetter}>{item.letter}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SignLanguageBridgeScreen() {
  const [mode, setMode] = useState(MODES.SIGN_TO_TEXT);
  const [isDetecting, setIsDetecting] = useState(true);
  const [currentDetection, setCurrentDetection] = useState(DETECTED_SIGNS[0]);
  const [outputText, setOutputText] = useState("Hello");
  const [inputText, setInputText] = useState("");
  const [detectionIdx, setDetectionIdx] = useState(0);

  const headerFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(contentSlide, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Simulate sign detection cycling
  useEffect(() => {
    if (mode !== MODES.SIGN_TO_TEXT || !isDetecting) return;
    const interval = setInterval(() => {
      setDetectionIdx((prev) => {
        const next = (prev + 1) % DETECTED_SIGNS.length;
        setCurrentDetection(DETECTED_SIGNS[next]);
        setOutputText(DETECTED_SIGNS[next].label);
        return next;
      });
    }, 2800);
    return () => clearInterval(interval);
  }, [mode, isDetecting]);

  const toggleMode = () => {
    setMode((m) =>
      m === MODES.SIGN_TO_TEXT ? MODES.TEXT_TO_SIGN : MODES.SIGN_TO_TEXT
    );
    setOutputText("");
    setInputText("");
  };

  const toggleDetection = () => setIsDetecting((v) => !v);

  const isSignToText = mode === MODES.SIGN_TO_TEXT;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={T.colors.bg} />

      {/* ── Header ── */}
      <Animated.View style={[styles.header, { opacity: headerFade }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerEmoji}>🤟</Text>
          <View>
            <Text style={styles.headerTitle}>Sign Bridge</Text>
            <Text style={styles.headerSub}>Sign Language Translator</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <PulseDot
            color={isDetecting ? T.colors.primary : T.colors.textMuted}
          />
          <Text
            style={[
              styles.headerStatus,
              { color: isDetecting ? T.colors.primary : T.colors.textMuted },
            ]}
          >
            {isDetecting ? "Live" : "Paused"}
          </Text>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ transform: [{ translateY: contentSlide }], opacity: headerFade }}
        >
          {/* ── Mode Toggle ── */}
          <View style={styles.section}>
            <ModeToggle mode={mode} onToggle={toggleMode} />
          </View>

          {/* ── Camera Preview / Sign Display ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {isSignToText ? "Camera Feed" : "Reference Sign"}
              </Text>
              <View style={styles.liveBadge}>
                <View
                  style={[
                    styles.liveDot,
                    {
                      backgroundColor: isDetecting
                        ? T.colors.primary
                        : T.colors.textMuted,
                    },
                  ]}
                />
                <Text style={styles.liveBadgeText}>
                  {isSignToText
                    ? isDetecting
                      ? "Detecting"
                      : "Paused"
                    : "Preview"}
                </Text>
              </View>
            </View>

            {/* Camera Card */}
            <View style={styles.cameraCard}>
              {/* Simulated camera grid background */}
              <View style={styles.cameraGrid}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <View key={i} style={styles.cameraGridRow}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <View key={j} style={styles.cameraGridCell} />
                    ))}
                  </View>
                ))}
              </View>

              {/* Center hand placeholder */}
              <View style={styles.cameraCenter}>
                {isSignToText ? (
                  <>
                    <Text style={styles.cameraHandEmoji}>
                      {currentDetection.sign}
                    </Text>
                    {isDetecting && (
                      <View style={styles.cameraDetectedBadge}>
                        <Text style={styles.cameraDetectedText}>
                          {currentDetection.label}
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  <>
                    <Text style={styles.cameraHandEmoji}>
                      {inputText
                        ? SIGN_ALPHABET.find(
                            (s) =>
                              s.letter ===
                              inputText.toUpperCase().slice(-1)
                          )?.emoji || "✋"
                        : "✋"}
                    </Text>
                    <View style={styles.cameraDetectedBadge}>
                      <Text style={styles.cameraDetectedText}>
                        {inputText
                          ? `Sign for "${inputText.toUpperCase().slice(-1)}"`
                          : "Type to preview"}
                      </Text>
                    </View>
                  </>
                )}
              </View>

              {/* Detection overlay frame */}
              <View style={styles.detectionFrame}>
                <FrameCorner position="tl" />
                <FrameCorner position="tr" />
                <FrameCorner position="bl" />
                <FrameCorner position="br" />
                {isSignToText && isDetecting && <ScanLine />}
              </View>

              {/* Camera label strip */}
              <View style={styles.cameraBottomStrip}>
                <Text style={styles.cameraNote}>
                  {isSignToText
                    ? "Position hand inside the frame"
                    : "Mirror reference for sign"}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Output / Input Section ── */}
          {isSignToText ? (
            /* Sign → Text: show detected output */
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detected Text</Text>
              <View style={styles.outputCard}>
                <View style={styles.outputTopRow}>
                  <Text style={styles.outputEmoji}>{currentDetection.sign}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.outputWord}>{outputText}</Text>
                    <View style={styles.confRow}>
                      <Text style={styles.confLabel}>
                        Confidence: {currentDetection.confidence}%
                      </Text>
                    </View>
                    <ConfidenceBar value={currentDetection.confidence} />
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.outputHistoryRow}>
                  <Text style={styles.outputHistoryLabel}>Session log:</Text>
                  <Text style={styles.outputHistoryText}>
                    {DETECTED_SIGNS.slice(0, detectionIdx + 1)
                      .map((d) => d.label)
                      .join(" · ")}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            /* Text → Sign: input to convert */
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Type to Convert</Text>
              <View style={styles.inputCard}>
                <TextInput
                  style={styles.textInput}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Type a word or letter…"
                  placeholderTextColor={T.colors.textMuted}
                  maxLength={60}
                  multiline={false}
                  autoCorrect={false}
                />
                {inputText.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setInputText("")}
                    style={styles.clearBtn}
                  >
                    <Text style={styles.clearBtnText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Sign alphabet reference */}
              {inputText.length > 0 && (
                <View style={styles.alphabetCard}>
                  <Text style={styles.alphabetTitle}>
                    Finger Spelling — "{inputText.toUpperCase()}"
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.alphabetScroll}
                  >
                    {inputText
                      .toUpperCase()
                      .split("")
                      .filter((c) => c.trim())
                      .map((char, i) => {
                        const found = SIGN_ALPHABET.find(
                          (s) => s.letter === char
                        );
                        return (
                          <View key={i} style={styles.spellCard}>
                            <Text style={styles.spellEmoji}>
                              {found?.emoji || "🤷"}
                            </Text>
                            <Text style={styles.spellLetter}>{char}</Text>
                          </View>
                        );
                      })}
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          {/* ── Quick Reference ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Reference</Text>
            <View style={styles.refCard}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.refScroll}
              >
                {SIGN_ALPHABET.map((item) => (
                  <SignCard key={item.letter} item={item} />
                ))}
              </ScrollView>
            </View>
          </View>

          {/* ── Action Buttons ── */}
          <View style={styles.section}>
            <View style={styles.ctaRow}>
              {/* Primary */}
              <TouchableOpacity
                style={[
                  styles.btnPrimary,
                  !isDetecting && styles.btnPrimaryActive,
                ]}
                onPress={toggleDetection}
                activeOpacity={0.8}
              >
                <Text style={styles.btnPrimaryIcon}>
                  {isDetecting ? "⏸" : "▶"}
                </Text>
                <Text style={styles.btnPrimaryText}>
                  {isDetecting ? "Pause Detection" : "Start Detection"}
                </Text>
              </TouchableOpacity>

              {/* Secondary */}
              <TouchableOpacity
                style={styles.btnSecondary}
                activeOpacity={0.7}
                onPress={() => {
                  setOutputText("");
                  setDetectionIdx(0);
                  setCurrentDetection(DETECTED_SIGNS[0]);
                }}
              >
                <Text style={styles.btnSecondaryText}>🗑 Clear</Text>
              </TouchableOpacity>
            </View>

            {/* Tertiary hint */}
            <TouchableOpacity style={styles.btnTertiary} activeOpacity={0.7}>
              <Text style={styles.btnTertiaryText}>
                📖 View Full Sign Dictionary
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: T.sp.xl }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.colors.bg,
  },

  // ── Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: T.sp.md,
    paddingHorizontal: T.sp.md,
    backgroundColor: T.colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: T.colors.border,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: T.sp.sm + 4,
  },
  headerEmoji: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: T.colors.textPrimary,
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 12,
    color: T.colors.textSec,
    fontWeight: "500",
    marginTop: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: T.sp.xs + 2,
    backgroundColor: T.colors.surface,
    paddingHorizontal: T.sp.sm + 4,
    paddingVertical: T.sp.xs,
    borderRadius: T.radius.full,
    borderWidth: 1,
    borderColor: T.colors.border,
  },
  headerStatus: {
    fontSize: 12,
    fontWeight: "700",
  },

  // ── Pulse Dot
  pulseDotWrapper: {
    width: 12,
    height: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseDotRing: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: T.radius.full,
  },
  pulseDotCore: {
    width: 7,
    height: 7,
    borderRadius: T.radius.full,
  },

  // ── Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: T.sp.md,
    paddingTop: T.sp.md,
  },

  // ── Section
  section: {
    marginBottom: T.sp.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: T.sp.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: T.colors.textSec,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: T.sp.sm,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: T.sp.xs,
    backgroundColor: T.colors.surface,
    paddingHorizontal: T.sp.sm,
    paddingVertical: T.sp.xs,
    borderRadius: T.radius.full,
    borderWidth: 1,
    borderColor: T.colors.border,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: T.radius.full,
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: T.colors.textSec,
  },

  // ── Toggle
  toggleTrack: {
    width: "100%",
    height: 52,
    backgroundColor: T.colors.surface,
    borderRadius: T.radius.md,
    borderWidth: 1,
    borderColor: T.colors.border,
    justifyContent: "center",
    overflow: "hidden",
  },
  toggleLabels: {
    flexDirection: "row",
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: T.sp.sm,
    justifyContent: "space-between",
    zIndex: 1,
  },
  toggleLabelItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: T.sp.xs,
    height: 48,
  },
  toggleLabelIcon: {
    fontSize: 16,
  },
  toggleLabelText: {
    fontSize: 13,
    fontWeight: "600",
    color: T.colors.textMuted,
  },
  toggleLabelActive: {
    color: T.colors.textOnPrimary,
  },
  toggleThumb: {
    position: "absolute",
    width: "48%",
    height: 44,
    backgroundColor: T.colors.primary,
    borderRadius: T.radius.sm,
    top: 3,
  },

  // ── Camera Card
  cameraCard: {
    backgroundColor: "#0A0D14",
    borderRadius: T.radius.lg,
    overflow: "hidden",
    height: 240,
    borderWidth: 1,
    borderColor: T.colors.border,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraGrid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.06,
  },
  cameraGridRow: {
    flex: 1,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: T.colors.primary,
  },
  cameraGridCell: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: T.colors.primary,
  },
  cameraCenter: {
    alignItems: "center",
    gap: T.sp.sm,
    zIndex: 2,
  },
  cameraHandEmoji: {
    fontSize: 72,
  },
  cameraDetectedBadge: {
    backgroundColor: T.colors.accent + "22",
    borderRadius: T.radius.full,
    paddingHorizontal: T.sp.md,
    paddingVertical: T.sp.xs,
    borderWidth: 1,
    borderColor: T.colors.accent + "50",
  },
  cameraDetectedText: {
    fontSize: 13,
    fontWeight: "700",
    color: T.colors.accent,
  },

  // Detection frame overlay
  detectionFrame: {
    position: "absolute",
    top: 28,
    left: 32,
    right: 32,
    bottom: 44,
  },
  frameCorner: {
    position: "absolute",
    width: 22,
    height: 22,
  },
  cornerH: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 22,
    height: 3,
    backgroundColor: T.colors.frameCorner,
    borderRadius: T.radius.full,
  },
  cornerV: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 3,
    height: 22,
    backgroundColor: T.colors.frameCorner,
    borderRadius: T.radius.full,
  },

  // Scan line
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: T.colors.frameScan,
    borderRadius: T.radius.full,
    shadowColor: T.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },

  cameraBottomStrip: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#00000060",
    paddingVertical: T.sp.xs + 2,
    paddingHorizontal: T.sp.md,
    alignItems: "center",
  },
  cameraNote: {
    fontSize: 11,
    color: T.colors.textSec,
    fontWeight: "500",
  },

  // ── Output Card
  outputCard: {
    backgroundColor: T.colors.surface,
    borderRadius: T.radius.md,
    padding: T.sp.md,
    borderWidth: 1,
    borderColor: T.colors.border,
  },
  outputTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: T.sp.md,
    marginBottom: T.sp.md,
  },
  outputEmoji: {
    fontSize: 40,
  },
  outputWord: {
    fontSize: 22,
    fontWeight: "800",
    color: T.colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: T.sp.xs,
  },
  confRow: {
    marginBottom: T.sp.xs,
  },
  confLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: T.colors.textSec,
    marginBottom: T.sp.xs,
  },
  confBarTrack: {
    height: 5,
    backgroundColor: T.colors.surfaceAlt,
    borderRadius: T.radius.full,
    overflow: "hidden",
    width: "100%",
  },
  confBarFill: {
    height: "100%",
    borderRadius: T.radius.full,
  },
  divider: {
    height: 1,
    backgroundColor: T.colors.border,
    marginBottom: T.sp.sm,
  },
  outputHistoryRow: {
    gap: T.sp.xs,
  },
  outputHistoryLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: T.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  outputHistoryText: {
    fontSize: 13,
    color: T.colors.textSec,
    fontWeight: "500",
    lineHeight: 20,
  },

  // ── Input Card
  inputCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.colors.surface,
    borderRadius: T.radius.md,
    borderWidth: 1.5,
    borderColor: T.colors.borderBright,
    paddingHorizontal: T.sp.md,
    height: 54,
    marginBottom: T.sp.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: T.colors.textPrimary,
    fontWeight: "600",
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: T.radius.full,
    backgroundColor: T.colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  clearBtnText: {
    fontSize: 12,
    color: T.colors.textMuted,
    fontWeight: "700",
  },

  // Alphabet card
  alphabetCard: {
    backgroundColor: T.colors.surface,
    borderRadius: T.radius.md,
    padding: T.sp.md,
    borderWidth: 1,
    borderColor: T.colors.border,
  },
  alphabetTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: T.colors.textSec,
    marginBottom: T.sp.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  alphabetScroll: {
    gap: T.sp.sm,
    paddingRight: T.sp.sm,
  },
  spellCard: {
    width: 52,
    height: 64,
    backgroundColor: T.colors.surfaceAlt,
    borderRadius: T.radius.sm,
    alignItems: "center",
    justifyContent: "center",
    gap: T.sp.xs,
    borderWidth: 1,
    borderColor: T.colors.border,
  },
  spellEmoji: {
    fontSize: 24,
  },
  spellLetter: {
    fontSize: 13,
    fontWeight: "800",
    color: T.colors.primary,
  },

  // ── Quick Reference
  refCard: {
    backgroundColor: T.colors.surface,
    borderRadius: T.radius.md,
    padding: T.sp.md,
    borderWidth: 1,
    borderColor: T.colors.border,
  },
  refScroll: {
    gap: T.sp.sm,
    paddingRight: T.sp.sm,
  },
  signCard: {
    width: 56,
    height: 68,
    backgroundColor: T.colors.surfaceAlt,
    borderRadius: T.radius.sm,
    alignItems: "center",
    justifyContent: "center",
    gap: T.sp.xs,
    borderWidth: 1,
    borderColor: T.colors.border,
  },
  signCardEmoji: {
    fontSize: 24,
  },
  signCardLetter: {
    fontSize: 12,
    fontWeight: "700",
    color: T.colors.textSec,
  },

  // ── Buttons
  ctaRow: {
    flexDirection: "row",
    gap: T.sp.sm,
    marginBottom: T.sp.sm,
  },
  btnPrimary: {
    flex: 2,
    height: 52,
    backgroundColor: T.colors.primary,
    borderRadius: T.radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: T.sp.sm,
    shadowColor: T.colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  btnPrimaryActive: {
    backgroundColor: T.colors.primaryDark,
  },
  btnPrimaryIcon: {
    fontSize: 16,
  },
  btnPrimaryText: {
    fontSize: 15,
    fontWeight: "800",
    color: T.colors.textOnPrimary,
  },
  btnSecondary: {
    flex: 1,
    height: 52,
    backgroundColor: T.colors.surface,
    borderRadius: T.radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: T.colors.border,
  },
  btnSecondaryText: {
    fontSize: 14,
    fontWeight: "700",
    color: T.colors.textSec,
  },
  btnTertiary: {
    height: 46,
    backgroundColor: "transparent",
    borderRadius: T.radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: T.colors.border,
  },
  btnTertiaryText: {
    fontSize: 13,
    fontWeight: "600",
    color: T.colors.textSec,
  },
});
