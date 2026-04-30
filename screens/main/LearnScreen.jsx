// LearnScreen.js
// Lernzy – Learn Screen (Expo SDK 54, React Native, JavaScript)

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
} from "react-native";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const COLORS = {
  bg: "#F5F7FF",
  surface: "#FFFFFF",
  border: "#E8EBF7",
  primary: "#4F6EF7",
  primaryLight: "#EEF1FE",
  text: "#1A1D2E",
  textMid: "#5A5E78",
  textLight: "#9EA3B8",

  math: { bg: "#FFF4EC", icon: "#FF7F50", bar: "#FF7F50" },
  science: { bg: "#EDFAF4", icon: "#34C98A", bar: "#34C98A" },
  english: { bg: "#EEF1FE", icon: "#4F6EF7", bar: "#4F6EF7" },
  social: { bg: "#FFF9E6", icon: "#F5A623", bar: "#F5A623" },
  cs: { bg: "#F3EFFE", icon: "#9B8BF4", bar: "#9B8BF4" },
};

const SP = 8;

// ─── Static Data ───────────────────────────────────────────────────────────────
const SUBJECTS = [
  {
    id: "math",
    name: "Mathematics",
    desc: "Numbers, Algebra & Geometry",
    icon: "📐",
    theme: COLORS.math,
    chapters: 24,
  },
  {
    id: "science",
    name: "Science",
    desc: "Physics, Chemistry & Biology",
    icon: "🔬",
    theme: COLORS.science,
    chapters: 30,
  },
  {
    id: "english",
    name: "English",
    desc: "Grammar, Writing & Reading",
    icon: "📖",
    theme: COLORS.english,
    chapters: 18,
  },
  {
    id: "social",
    name: "Social Studies",
    desc: "History, Civics & Geography",
    icon: "🌍",
    theme: COLORS.social,
    chapters: 22,
  },
  {
    id: "cs",
    name: "Computer Science",
    desc: "Coding, Logic & Technology",
    icon: "💻",
    theme: COLORS.cs,
    chapters: 16,
  },
];

const CONTINUE_ITEMS = [
  {
    id: "c1",
    subject: "Mathematics",
    chapter: "Chapter 4 · Fractions",
    icon: "📐",
    theme: COLORS.math,
    progress: 0.65,
  },
  {
    id: "c2",
    subject: "Science",
    chapter: "Chapter 2 · Plant Cell",
    icon: "🔬",
    theme: COLORS.science,
    progress: 0.3,
  },
  {
    id: "c3",
    subject: "English",
    chapter: "Chapter 6 · Tenses",
    icon: "📖",
    theme: COLORS.english,
    progress: 0.85,
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

const SectionHeader = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

/** Search bar */
const SearchBar = ({ value, onChange }) => (
  <View style={styles.searchWrap}>
    <Text style={styles.searchIcon}>🔍</Text>
    <TextInput
      style={styles.searchInput}
      placeholder="Search topics or subjects"
      placeholderTextColor={COLORS.textLight}
      value={value}
      onChangeText={onChange}
      returnKeyType="search"
    />
    {value.length > 0 && (
      <Pressable onPress={() => onChange("")} hitSlop={8}>
        <Text style={styles.searchClear}>✕</Text>
      </Pressable>
    )}
  </View>
);

/** 2-column subject card */
const SubjectCard = ({ subject, onPress }) => (
  <Pressable
    style={({ pressed }) => [
      styles.subjectCard,
      { backgroundColor: subject.theme.bg },
      pressed && styles.cardPressed,
    ]}
    onPress={() => onPress(subject)}
  >
    <View style={styles.subjectCardTop}>
      <Text style={styles.subjectIcon}>{subject.icon}</Text>
      <View style={[styles.chapterBadge, { backgroundColor: subject.theme.icon + "22" }]}>
        <Text style={[styles.chapterBadgeText, { color: subject.theme.icon }]}>
          {subject.chapters} ch
        </Text>
      </View>
    </View>
    <Text style={styles.subjectName}>{subject.name}</Text>
    <Text style={styles.subjectDesc}>{subject.desc}</Text>
    <View style={styles.subjectArrowRow}>
      <Text style={[styles.subjectArrow, { color: subject.theme.icon }]}>
        Start →
      </Text>
    </View>
  </Pressable>
);

/** Progress bar */
const ProgressBar = ({ progress, color }) => (
  <View style={styles.progressTrack}>
    <View
      style={[
        styles.progressFill,
        { width: `${Math.round(progress * 100)}%`, backgroundColor: color },
      ]}
    />
  </View>
);

/** Continue learning card */
const ContinueCard = ({ item, onPress }) => (
  <Pressable
    style={({ pressed }) => [styles.continueCard, pressed && styles.cardPressed]}
    onPress={() => onPress(item)}
  >
    <View style={[styles.continueIconWrap, { backgroundColor: item.theme.bg }]}>
      <Text style={styles.continueIcon}>{item.icon}</Text>
    </View>
    <View style={styles.continueBody}>
      <Text style={styles.continueSubject}>{item.subject}</Text>
      <Text style={styles.continueChapter}>{item.chapter}</Text>
      <View style={styles.continueProgressRow}>
        <ProgressBar progress={item.progress} color={item.theme.bar} />
        <Text style={[styles.continuePercent, { color: item.theme.bar }]}>
          {Math.round(item.progress * 100)}%
        </Text>
      </View>
    </View>
  </Pressable>
);

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function LearnScreen() {
  const [query, setQuery] = useState("");

  const filteredSubjects = query.trim()
    ? SUBJECTS.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.desc.toLowerCase().includes(query.toLowerCase())
      )
    : SUBJECTS;

  const handleSubjectPress = (subject) => {
    // Navigate to subject detail screen
    console.log("Navigate to:", subject.name);
  };

  const handleContinuePress = (item) => {
    console.log("Continue:", item.chapter);
  };

  /** Render 2-column grid from flat array */
  const renderGrid = () => {
    const rows = [];
    for (let i = 0; i < filteredSubjects.length; i += 2) {
      const left = filteredSubjects[i];
      const right = filteredSubjects[i + 1];
      rows.push(
        <View key={left.id} style={styles.gridRow}>
          <SubjectCard subject={left} onPress={handleSubjectPress} />
          {right ? (
            <SubjectCard subject={right} onPress={handleSubjectPress} />
          ) : (
            <View style={styles.subjectCardEmpty} />
          )}
        </View>
      );
    }
    return rows;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerEyebrow}>Lernzy</Text>
            <Text style={styles.headerTitle}>Learn</Text>
            <Text style={styles.headerSubtitle}>
              Pick a subject to start learning
            </Text>
          </View>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarEmoji}>🎓</Text>
          </View>
        </View>

        {/* ── Search Bar ── */}
        <SearchBar value={query} onChange={setQuery} />

        {/* ── Continue Learning ── */}
        {!query && (
          <>
            <SectionHeader title="Continue Learning" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.continueRow}
            >
              {CONTINUE_ITEMS.map((item) => (
                <ContinueCard
                  key={item.id}
                  item={item}
                  onPress={handleContinuePress}
                />
              ))}
            </ScrollView>
          </>
        )}

        {/* ── Subject Grid ── */}
        <View style={styles.subjectHeaderRow}>
          <SectionHeader title="All Subjects" />
          {filteredSubjects.length > 0 && (
            <Text style={styles.subjectCount}>
              {filteredSubjects.length} subject{filteredSubjects.length !== 1 ? "s" : ""}
            </Text>
          )}
        </View>

        {filteredSubjects.length > 0 ? (
          renderGrid()
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No subjects found</Text>
            <Text style={styles.emptyDesc}>
              Try searching with a different keyword
            </Text>
          </View>
        )}

        <View style={{ height: SP * 4 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SP * 2,
    paddingTop: SP * 2,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SP * 2.5,
  },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.text,
    lineHeight: 36,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textMid,
    fontWeight: "400",
    marginTop: 4,
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  avatarEmoji: { fontSize: 24 },

  // Search
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: SP * 1.5,
    paddingVertical: SP * 1.25,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: SP * 3,
    gap: SP,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "400",
    padding: 0,
  },
  searchClear: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: "600",
  },

  // Section header
  sectionHeader: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SP * 1.5,
  },
  subjectHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subjectCount: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: "500",
    marginBottom: SP * 1.5,
  },

  // Continue Learning
  continueRow: {
    gap: SP * 1.5,
    paddingBottom: SP,
    marginBottom: SP * 2.5,
  },
  continueCard: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SP * 1.5,
    width: 230,
    gap: SP * 1.25,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  continueIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  continueIcon: { fontSize: 22 },
  continueBody: { flex: 1, gap: 3 },
  continueSubject: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  continueChapter: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },
  continueProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SP,
    marginTop: 4,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  continuePercent: {
    fontSize: 11,
    fontWeight: "700",
    minWidth: 28,
    textAlign: "right",
  },

  // Subject Grid
  gridRow: {
    flexDirection: "row",
    gap: SP * 1.5,
    marginBottom: SP * 1.5,
  },
  subjectCard: {
    flex: 1,
    borderRadius: 16,
    padding: SP * 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  subjectCardEmpty: {
    flex: 1,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  subjectCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SP * 1.5,
  },
  subjectIcon: { fontSize: 32 },
  chapterBadge: {
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  chapterBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  subjectName: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 4,
  },
  subjectDesc: {
    fontSize: 11,
    color: COLORS.textMid,
    fontWeight: "400",
    lineHeight: 15,
    marginBottom: SP * 1.5,
  },
  subjectArrowRow: {
    alignItems: "flex-start",
  },
  subjectArrow: {
    fontSize: 12,
    fontWeight: "700",
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingTop: SP * 6,
    paddingBottom: SP * 4,
  },
  emptyIcon: { fontSize: 40, marginBottom: SP * 1.5 },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SP * 0.5,
  },
  emptyDesc: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: "center",
  },
});
