import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
  Alert,
} from "react-native";
import useProfileStore from "../../store/useProfileStore";
import { profileLanguageToApi } from "../../utils/languageMap";
import { askTutor, ApiError } from "../../services/api/http";

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  colors: {
    bg: "#F0F4FF",
    surface: "#FFFFFF",
    surfaceAlt: "#F7F9FF",
    primary: "#3D5AFE",
    primaryLight: "#E8ECFF",
    primaryDark: "#2740D4",
    aiBubble: "#FFFFFF",
    aiBubbleBorder: "#E2E8FF",
    userBubble: "#3D5AFE",
    userBubbleText: "#FFFFFF",
    accent: "#FF6B6B",
    accentLight: "#FFF0F0",
    chip: "#00B4A6",
    chipLight: "#E0FAF8",
    text: "#111827",
    textSec: "#4B5563",
    textMuted: "#9CA3AF",
    textOnPrimary: "#FFFFFF",
    border: "#E2E8F0",
    inputBg: "#FFFFFF",
    headerBg: "#FFFFFF",
    dot: "#3D5AFE",
    online: "#10B981",
  },
  radius: { xs: 8, sm: 12, md: 16, lg: 20, xl: 24, full: 999 },
  sp: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
};

// ─── Language map ─────────────────────────────────────────────────────────────
const LANGUAGE_LABELS = {
  english:   "English",
  hindi:     "Hindi",
  tamil:     "Tamil",
  telugu:    "Telugu",
  kannada:   "Kannada",
  malayalam: "Malayalam",
  marathi:   "Marathi",
  bengali:   "Bengali",
};

const QUICK_ACTIONS = [
  { id: "explain",  label: "Explain Again", icon: "🔄" },
  { id: "simplify", label: "Simplify",      icon: "✨" },
  { id: "example",  label: "Give Example",  icon: "💡" },
];

// ─── Utility ──────────────────────────────────────────────────────────────────
function formatText(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <Text key={i} style={{ fontWeight: "700" }}>{part.slice(2, -2)}</Text>;
    }
    return <Text key={i}>{part}</Text>;
  });
}

function now() {
  const d = new Date();
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m} ${ampm}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AvatarDot({ size = 32 }) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={{ fontSize: size * 0.5 }}>🤖</Text>
    </View>
  );
}

function ChatBubble({ message }) {
  const isUser = message.role === "user";
  if (isUser) {
    return (
      <View style={styles.rowUser}>
        <View style={styles.userBubble}>
          <Text style={styles.userBubbleText}>{message.text}</Text>
          <Text style={styles.bubbleTime}>{message.time}</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.rowAi}>
      <AvatarDot size={32} />
      <View style={styles.aiBubble}>
        <Text style={styles.aiBubbleText}>{formatText(message.text)}</Text>
        <Text style={[styles.bubbleTime, { color: T.colors.textMuted }]}>{message.time}</Text>
      </View>
    </View>
  );
}

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const bounce = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: -5, duration: 300, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0,  duration: 300, useNativeDriver: true }),
        ])
      );
    const a1 = bounce(dot1, 0);
    const a2 = bounce(dot2, 150);
    const a3 = bounce(dot3, 300);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  return (
    <View style={styles.rowAi}>
      <AvatarDot size={32} />
      <View style={[styles.aiBubble, styles.typingBubble]}>
        {[dot1, dot2, dot3].map((d, i) => (
          <Animated.View key={i} style={[styles.typingDot, { transform: [{ translateY: d }] }]} />
        ))}
      </View>
    </View>
  );
}

function QuickChip({ label, icon, onPress }) {
  return (
    <TouchableOpacity style={styles.chip} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.chipIcon}>{icon}</Text>
      <Text style={styles.chipText}>{label}</Text>
    </TouchableOpacity>
  );
}

function SendButton({ onPress, disabled }) {
  return (
    <TouchableOpacity
      style={[styles.sendBtn, disabled && styles.sendBtnDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={styles.sendBtnIcon}>↑</Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AiTutorChatScreen() {
  // ── Zustand store ──────────────────────────────────────
  const name     = useProfileStore(s => s.name);
  const language = useProfileStore(s => s.language);
  const grade    = useProfileStore(s => s.grade);

  const displayName  = name || "Learner";
  const langLabel    = LANGUAGE_LABELS[language] || "English";
  const gradeLabel   = grade ? `Class ${grade}` : "Class 8";

  // ── Initial greeting personalised to user ─────────────
  const INITIAL_MESSAGES = [
    {
      id:   "1",
      role: "ai",
      text: `Hi ${displayName}! I'm Zia, your AI tutor 👋\nI'll teach in ${langLabel}. What would you like to learn today?`,
      time: now(),
    },
  ];

  const [messages,  setMessages]  = useState(INITIAL_MESSAGES);
  const [input,     setInput]     = useState("");
  const [isTyping,  setIsTyping]  = useState(false);
  const scrollRef  = useRef(null);
  const nextId     = useRef(2);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const sendMessage = useCallback((textOverride) => {
    const trimmed = ((textOverride != null ? textOverride : input) || "").trim();
    if (!trimmed) return;

    const userMsg = {
      id:   String(nextId.current++),
      role: "user",
      text: trimmed,
      time: now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    scrollToBottom();

    const apiLang = profileLanguageToApi(language);
    askTutor({
      question: trimmed,
      language: apiLang,
      outputType: "text",
    })
      .then((data) => {
        const reply = data?.explanation || "_(No text returned)_";
        const aiMsg = {
          id:   String(nextId.current++),
          role: "ai",
          text: reply,
          time: now(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      })
      .catch((err) => {
        const msg = err instanceof ApiError ? err.message : "Something went wrong";
        Alert.alert("Tutor unavailable", msg);
        const aiMsg = {
          id:   String(nextId.current++),
          role: "ai",
          text:
            apiLang === "kn"
              ? `ಕ್ಷಮಿಸಿ, ಈಗ ಉತ್ತರ ಪಡೆಯಲಾಗಲಿಲ್ಲ। (${msg})`
              : `Sorry — I couldn't reach the tutor right now.\n(${msg})`,
          time: now(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      })
      .finally(() => {
        setIsTyping(false);
        scrollToBottom();
      });
  }, [input, scrollToBottom, language]);

  const handleQuickAction = useCallback((action) => {
    const map = {
      explain:  "Can you explain that again?",
      simplify: "Can you simplify that for me?",
      example:  "Can you give me an example?",
    };
    sendMessage(map[action]);
  }, [sendMessage]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={T.colors.headerBg} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerAvatar}>
            <Text style={{ fontSize: 20 }}>🤖</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Zia — AI Tutor</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>
                Online · {langLabel} · {gradeLabel}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.headerAction} activeOpacity={0.7}>
          <Text style={styles.headerActionText}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* ── Topic Tag ── */}
      <View style={styles.topicBar}>
        <View style={styles.topicTag}>
          <Text style={styles.topicTagText}>🌐 Language: {langLabel}</Text>
        </View>
      </View>

      {/* ── Chat Area ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.chatList}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={scrollToBottom}
        >
          <View style={styles.dateDivider}>
            <View style={styles.dateLine} />
            <Text style={styles.dateText}>Today</Text>
            <View style={styles.dateLine} />
          </View>

          {messages.map(msg => (
            <ChatBubble key={msg.id} message={msg} />
          ))}

          {isTyping && <TypingIndicator />}
        </ScrollView>

        {/* ── Quick Actions ── */}
        <View style={styles.quickBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickScroll}
          >
            {QUICK_ACTIONS.map(a => (
              <QuickChip
                key={a.id}
                label={a.label}
                icon={a.icon}
                onPress={() => handleQuickAction(a.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* ── Input Bar ── */}
        <View style={styles.inputBar}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder={`Ask Zia anything in ${langLabel}…`}
              placeholderTextColor={T.colors.textMuted}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={1200}
              returnKeyType="send"
              onSubmitEditing={() => sendMessage(undefined)}
              blurOnSubmit={false}
            />
          </View>
          <SendButton onPress={() => sendMessage(undefined)} disabled={!input.trim()} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.colors.bg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: T.colors.headerBg,
    paddingTop: Platform.OS === "ios" ? 56 : 36,
    paddingBottom: T.sp.md,
    paddingHorizontal: T.sp.md,
    borderBottomWidth: 1,
    borderBottomColor: T.colors.border,
  },
  headerLeft:   { flexDirection: "row", alignItems: "center", gap: T.sp.sm + 4 },
  headerAvatar: {
    width: 44, height: 44, borderRadius: T.radius.full,
    backgroundColor: T.colors.primaryLight, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: T.colors.primary + "30",
  },
  headerTitle:  { fontSize: 16, fontWeight: "800", color: T.colors.text, letterSpacing: -0.3 },
  onlineRow:    { flexDirection: "row", alignItems: "center", gap: T.sp.xs, marginTop: 2 },
  onlineDot:    { width: 7, height: 7, borderRadius: T.radius.full, backgroundColor: T.colors.online },
  onlineText:   { fontSize: 12, color: T.colors.textSec, fontWeight: "500" },
  headerAction: {
    width: 36, height: 36, borderRadius: T.radius.full,
    backgroundColor: T.colors.surfaceAlt, alignItems: "center", justifyContent: "center",
  },
  headerActionText: { fontSize: 18, color: T.colors.textSec, fontWeight: "700", lineHeight: 20 },

  topicBar: {
    backgroundColor: T.colors.headerBg,
    paddingHorizontal: T.sp.md,
    paddingBottom: T.sp.sm,
    borderBottomWidth: 1,
    borderBottomColor: T.colors.border,
  },
  topicTag: {
    alignSelf: "flex-start",
    backgroundColor: T.colors.primaryLight,
    paddingHorizontal: T.sp.sm + 4,
    paddingVertical: T.sp.xs,
    borderRadius: T.radius.full,
  },
  topicTagText: { fontSize: 12, fontWeight: "600", color: T.colors.primary },

  chatList:    { flex: 1 },
  chatContent: { paddingHorizontal: T.sp.md, paddingTop: T.sp.md, paddingBottom: T.sp.sm, gap: T.sp.xs },

  dateDivider: { flexDirection: "row", alignItems: "center", gap: T.sp.sm, marginBottom: T.sp.sm },
  dateLine:    { flex: 1, height: 1, backgroundColor: T.colors.border },
  dateText:    { fontSize: 11, fontWeight: "600", color: T.colors.textMuted, textTransform: "uppercase", letterSpacing: 0.6 },

  rowUser: { flexDirection: "row", justifyContent: "flex-end", marginVertical: T.sp.xs },
  rowAi:   { flexDirection: "row", alignItems: "flex-end", gap: T.sp.sm, marginVertical: T.sp.xs },
  avatar:  { backgroundColor: T.colors.primaryLight, alignItems: "center", justifyContent: "center", flexShrink: 0 },

  userBubble: {
    backgroundColor: T.colors.userBubble,
    borderRadius: T.radius.md, borderBottomRightRadius: T.radius.xs,
    paddingHorizontal: T.sp.md, paddingVertical: T.sp.sm + 4,
    maxWidth: "78%",
    shadowColor: T.colors.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
  userBubbleText: { fontSize: 14, lineHeight: 21, color: T.colors.userBubbleText, fontWeight: "500" },

  aiBubble: {
    backgroundColor: T.colors.aiBubble,
    borderRadius: T.radius.md, borderBottomLeftRadius: T.radius.xs,
    paddingHorizontal: T.sp.md, paddingVertical: T.sp.sm + 4,
    maxWidth: "78%",
    borderWidth: 1, borderColor: T.colors.aiBubbleBorder,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  aiBubbleText: { fontSize: 14, lineHeight: 22, color: T.colors.text, fontWeight: "400" },
  bubbleTime:   { fontSize: 10, color: "rgba(255,255,255,0.65)", marginTop: T.sp.xs, fontWeight: "500", alignSelf: "flex-end" },

  typingBubble: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: T.sp.md, paddingHorizontal: T.sp.md + 4 },
  typingDot:    { width: 8, height: 8, borderRadius: T.radius.full, backgroundColor: T.colors.dot, opacity: 0.6 },

  quickBar:    { backgroundColor: T.colors.headerBg, borderTopWidth: 1, borderTopColor: T.colors.border, paddingVertical: T.sp.sm },
  quickScroll: { paddingHorizontal: T.sp.md, gap: T.sp.sm, flexDirection: "row" },
  chip: {
    flexDirection: "row", alignItems: "center", gap: T.sp.xs,
    backgroundColor: T.colors.chipLight, borderRadius: T.radius.full,
    paddingHorizontal: T.sp.md, paddingVertical: T.sp.xs + 4,
    borderWidth: 1, borderColor: T.colors.chip + "40",
  },
  chipIcon: { fontSize: 13 },
  chipText: { fontSize: 13, fontWeight: "700", color: T.colors.chip },

  inputBar: {
    flexDirection: "row", alignItems: "flex-end", gap: T.sp.sm,
    paddingHorizontal: T.sp.md, paddingTop: T.sp.sm,
    paddingBottom: Platform.OS === "ios" ? T.sp.xl : T.sp.md,
    backgroundColor: T.colors.headerBg,
    borderTopWidth: 1, borderTopColor: T.colors.border,
  },
  inputWrapper: {
    flex: 1, backgroundColor: T.colors.inputBg,
    borderRadius: T.radius.lg, borderWidth: 1.5, borderColor: T.colors.border,
    paddingHorizontal: T.sp.md,
    paddingVertical: Platform.OS === "ios" ? T.sp.sm + 2 : T.sp.xs + 2,
    minHeight: 48, justifyContent: "center",
  },
  input: { fontSize: 14, color: T.colors.text, fontWeight: "500", maxHeight: 100, lineHeight: 21 },

  sendBtn: {
    width: 48, height: 48, borderRadius: T.radius.full,
    backgroundColor: T.colors.primary, alignItems: "center", justifyContent: "center",
    shadowColor: T.colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
  },
  sendBtnDisabled: { backgroundColor: T.colors.border, shadowOpacity: 0, elevation: 0 },
  sendBtnIcon:     { fontSize: 20, fontWeight: "800", color: "#FFFFFF", lineHeight: 24 },
});