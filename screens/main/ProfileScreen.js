import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import useAuthStore from "../../store/useAuthStore";
import useProfileStore from "../../store/useProfileStore";
import { resetToAuth } from "../../services/navigation/resetToAuth";

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  colors: {
    bg:           "#F7F8FC",
    surface:      "#FFFFFF",
    surfaceAlt:   "#F0F3FF",

    primary:      "#3B5BDB",
    primaryLight: "#E8EDFF",
    primaryMid:   "#3B5BDB22",

    teal:         "#0D9488",
    tealLight:    "#CCFBF1",

    amber:        "#D97706",
    amberLight:   "#FEF3C7",

    rose:         "#E11D48",
    roseLight:    "#FFE4E6",

    text:         "#111827",
    textSec:      "#4B5563",
    textMuted:    "#9CA3AF",

    border:       "#E5E7EB",
    divider:      "#F3F4F6",

    green:        "#059669",
    greenLight:   "#D1FAE5",

    trackOff:     "#D1D5DB",
    trackOn:      "#3B5BDB",
  },
  sp: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  r:  { xs: 8, sm: 10, md: 14, lg: 18, xl: 24, full: 999 },
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const USER = {
  name:    "Aryan Sharma",
  grade:   "Class 8 · Section B",
  school:  "Delhi Public School, Noida",
  avatar:  "🧑‍🎓",
  xp:      3240,
  streak:  5,
  rank:    "Gold Learner",
};

const LANGUAGES = [
  { code: "en", label: "English",    native: "English",  flag: "🇬🇧" },
  { code: "hi", label: "Hindi",      native: "हिन्दी",    flag: "🇮🇳" },
  { code: "ta", label: "Tamil",      native: "தமிழ்",    flag: "🇮🇳" },
  { code: "te", label: "Telugu",     native: "తెలుగు",   flag: "🇮🇳" },
  { code: "bn", label: "Bengali",    native: "বাংলা",    flag: "🇮🇳" },
];

const DOWNLOADS = [
  { id: "1", title: "Mathematics — Chapter 5",  size: "12.4 MB", subject: "Math",    icon: "📐", color: T.colors.primary  },
  { id: "2", title: "Science — Light & Optics",  size: "8.7 MB",  subject: "Science", icon: "🔬", color: T.colors.teal     },
  { id: "3", title: "History — Mughal Empire",   size: "5.2 MB",  subject: "History", icon: "🏛️", color: T.colors.amber    },
];

const FONT_SIZES = [
  { key: "sm",  label: "A",  size: 13 },
  { key: "md",  label: "A",  size: 16 },
  { key: "lg",  label: "A",  size: 20 },
];

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ value, onChange, color = T.colors.trackOn }) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: value ? 1 : 0,
      useNativeDriver: true,
      tension: 80,
      friction: 8,
    }).start();
  }, [value]);

  const bgColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [T.colors.trackOff, color],
  });

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  return (
    <TouchableOpacity onPress={() => onChange(!value)} activeOpacity={0.85}>
      <Animated.View style={[styles.toggleTrack, { backgroundColor: bgColor }]}>
        <Animated.View
          style={[styles.toggleThumb, { transform: [{ translateX }] }]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── SettingRow ───────────────────────────────────────────────────────────────
function SettingRow({ icon, label, sublabel, right, topBorder }) {
  return (
    <View style={[styles.settingRow, topBorder && styles.settingRowBorder]}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIconWrap}>
          <Text style={{ fontSize: 17 }}>{icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.settingLabel}>{label}</Text>
          {sublabel ? (
            <Text style={styles.settingSubLabel}>{sublabel}</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.settingRight}>{right}</View>
    </View>
  );
}

// ─── SectionCard ─────────────────────────────────────────────────────────────
function SectionCard({ title, subtitle, children, style }) {
  return (
    <View style={[styles.card, style]}>
      {title ? (
        <View style={styles.cardHeadRow}>
          <Text style={styles.cardTitle}>{title}</Text>
          {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

// ─── DownloadItem ─────────────────────────────────────────────────────────────
function DownloadItem({ item, onDelete, isLast }) {
  const [deleting, setDeleting] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleDelete = () => {
    setDeleting(true);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onDelete(item.id));
  };

  return (
    <Animated.View
      style={[
        styles.downloadRow,
        !isLast && styles.downloadRowBorder,
        { opacity: fadeAnim },
      ]}
    >
      <View style={[styles.downloadIcon, { backgroundColor: item.color + "18" }]}>
        <Text style={{ fontSize: 20 }}>{item.icon}</Text>
      </View>
      <View style={styles.downloadInfo}>
        <Text style={styles.downloadTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.downloadMeta}>
          <View style={[styles.downloadTag, { backgroundColor: item.color + "18" }]}>
            <Text style={[styles.downloadTagText, { color: item.color }]}>
              {item.subject}
            </Text>
          </View>
          <Text style={styles.downloadSize}>{item.size}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.downloadDel}
        onPress={handleDelete}
        activeOpacity={0.7}
        disabled={deleting}
      >
        <Text style={styles.downloadDelText}>🗑</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const authUser = useAuthStore((s) => s.user);
  const profileName = useProfileStore((s) => s.name);
  const profileGrade = useProfileStore((s) => s.grade);
  const displayName = (profileName && profileName.trim()) || authUser?.name || "Learner";
  const gradeLine = profileGrade
    ? `Class ${profileGrade} · synced`
    : "Complete profile setup";

  const [activeLang, setActiveLang] = useState("en");
  const [fontSize, setFontSize]     = useState("md");
  const [settings, setSettings]     = useState({
    highContrast:   false,
    screenReader:   false,
    reduceMotion:   false,
    dyslexiaFont:   false,
    offlineMode:    true,
    notifications:  true,
  });
  const [downloads, setDownloads] = useState(DOWNLOADS);

  // Entrance animations
  const heroAnim    = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroAnim, {
        toValue: 1, duration: 600, useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 500, delay: 150, useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 0, duration: 500, delay: 150, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const toggle = (key) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const deleteDownload = (id) =>
    setDownloads((prev) => prev.filter((d) => d.id !== id));

  const totalDownloadSize = downloads
    .reduce((acc, d) => acc + parseFloat(d.size), 0)
    .toFixed(1);

  const handleLogout = () =>
    Alert.alert(
      "Log out?",
      "You'll need to sign in again to access your learning.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log out",
          style: "destructive",
          onPress: async () => {
            await useAuthStore.getState().logout();
            resetToAuth();
          },
        },
      ]
    );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={T.colors.primary} />

      {/* ── Hero Header ── */}
      <Animated.View style={[styles.hero, { opacity: heroAnim }]}>
        {/* Decorative circles */}
        <View style={styles.heroBubble1} />
        <View style={styles.heroBubble2} />

        <View style={styles.heroContent}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarEmoji}>{USER.avatar}</Text>
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeText}>⭐</Text>
            </View>
          </View>

          <Text style={styles.heroName}>{displayName}</Text>
          <Text style={styles.heroGrade}>{gradeLine}</Text>
          <Text style={styles.heroSchool}>{USER.school}</Text>

          {/* XP / Streak / Rank row */}
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{USER.xp.toLocaleString()}</Text>
              <Text style={styles.heroStatLabel}>XP</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>🔥 {USER.streak}</Text>
              <Text style={styles.heroStatLabel}>Streak</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>🥇</Text>
              <Text style={styles.heroStatLabel}>{USER.rank}</Text>
            </View>
          </View>
        </View>

        {/* Edit button */}
        <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
          <Text style={styles.editBtnText}>✏️  Edit Profile</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ── Scrollable Settings ── */}
      <Animated.View
        style={[
          { flex: 1 },
          { opacity: fadeAnim, transform: [{ translateY: contentAnim }] },
        ]}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* ── Language Preferences ── */}
          <SectionCard title="Language" subtitle="App & content language">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.langScroll}
            >
              {LANGUAGES.map((lang) => {
                const active = activeLang === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[styles.langChip, active && styles.langChipActive]}
                    onPress={() => setActiveLang(lang.code)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.langFlag}>{lang.flag}</Text>
                    <View>
                      <Text
                        style={[
                          styles.langLabel,
                          active && styles.langLabelActive,
                        ]}
                      >
                        {lang.label}
                      </Text>
                      <Text style={styles.langNative}>{lang.native}</Text>
                    </View>
                    {active && (
                      <View style={styles.langCheck}>
                        <Text style={{ fontSize: 10, color: "#fff" }}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </SectionCard>

          {/* ── Accessibility Settings ── */}
          <SectionCard title="Accessibility" subtitle="Customise your learning experience">

            {/* Font size picker */}
            <View style={styles.fontRow}>
              <View style={styles.settingIconWrap}>
                <Text style={{ fontSize: 17 }}>🔤</Text>
              </View>
              <Text style={styles.settingLabel}>Font Size</Text>
              <View style={styles.fontPicker}>
                {FONT_SIZES.map((f) => (
                  <TouchableOpacity
                    key={f.key}
                    style={[
                      styles.fontOption,
                      fontSize === f.key && styles.fontOptionActive,
                    ]}
                    onPress={() => setFontSize(f.key)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.fontOptionText,
                        { fontSize: f.size },
                        fontSize === f.key && styles.fontOptionTextActive,
                      ]}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.divider} />

            <SettingRow
              icon="🌗"
              label="High Contrast"
              sublabel="Improves text visibility"
              right={
                <Toggle
                  value={settings.highContrast}
                  onChange={() => toggle("highContrast")}
                />
              }
            />
            <SettingRow
              icon="🔊"
              label="Screen Reader"
              sublabel="Reads content aloud"
              topBorder
              right={
                <Toggle
                  value={settings.screenReader}
                  onChange={() => toggle("screenReader")}
                  color={T.colors.teal}
                />
              }
            />
            <SettingRow
              icon="🌀"
              label="Reduce Motion"
              sublabel="Limits animations"
              topBorder
              right={
                <Toggle
                  value={settings.reduceMotion}
                  onChange={() => toggle("reduceMotion")}
                  color={T.colors.amber}
                />
              }
            />
            <SettingRow
              icon="📖"
              label="Dyslexia-Friendly Font"
              sublabel="OpenDyslexic typeface"
              topBorder
              right={
                <Toggle
                  value={settings.dyslexiaFont}
                  onChange={() => toggle("dyslexiaFont")}
                  color={T.colors.primary}
                />
              }
            />
          </SectionCard>

          {/* ── App Settings ── */}
          <SectionCard title="App Settings" subtitle="Connectivity & notifications">
            <SettingRow
              icon="📶"
              label="Offline Mode"
              sublabel="Use downloaded content without internet"
              right={
                <Toggle
                  value={settings.offlineMode}
                  onChange={() => toggle("offlineMode")}
                  color={T.colors.green}
                />
              }
            />
            <SettingRow
              icon="🔔"
              label="Notifications"
              sublabel="Reminders & learning nudges"
              topBorder
              right={
                <Toggle
                  value={settings.notifications}
                  onChange={() => toggle("notifications")}
                  color={T.colors.primary}
                />
              }
            />
          </SectionCard>

          {/* ── Offline Downloads ── */}
          <SectionCard
            title="Offline Downloads"
            subtitle={
              downloads.length > 0
                ? `${downloads.length} files · ${totalDownloadSize} MB used`
                : "No downloads"
            }
          >
            {downloads.length === 0 ? (
              <View style={styles.emptyDownloads}>
                <Text style={styles.emptyDownloadsIcon}>📭</Text>
                <Text style={styles.emptyDownloadsText}>
                  No offline content saved
                </Text>
              </View>
            ) : (
              downloads.map((item, i) => (
                <DownloadItem
                  key={item.id}
                  item={item}
                  onDelete={deleteDownload}
                  isLast={i === downloads.length - 1}
                />
              ))
            )}

            {downloads.length > 0 && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity
                  style={styles.clearAllBtn}
                  activeOpacity={0.7}
                  onPress={() =>
                    Alert.alert(
                      "Clear all downloads?",
                      "This will delete all offline content.",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Clear All",
                          style: "destructive",
                          onPress: () => setDownloads([]),
                        },
                      ]
                    )
                  }
                >
                  <Text style={styles.clearAllText}>🗑  Clear All Downloads</Text>
                </TouchableOpacity>
              </>
            )}
          </SectionCard>

          {/* ── Account Actions ── */}
          <SectionCard style={styles.actionsCard}>
            <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
              <Text style={styles.actionIcon}>🔒</Text>
              <Text style={styles.actionLabel}>Change Password</Text>
              <Text style={styles.actionChevron}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
              <Text style={styles.actionIcon}>🛡️</Text>
              <Text style={styles.actionLabel}>Privacy & Data</Text>
              <Text style={styles.actionChevron}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
              <Text style={styles.actionIcon}>❓</Text>
              <Text style={styles.actionLabel}>Help & Support</Text>
              <Text style={styles.actionChevron}>›</Text>
            </TouchableOpacity>
          </SectionCard>

          {/* ── Logout ── */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <Text style={styles.version}>Lernzy v2.4.1 · Made with ❤️ in India</Text>

          <View style={{ height: T.sp.xl }} />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.colors.bg,
  },

  // ── Hero
  hero: {
    backgroundColor: T.colors.primary,
    paddingTop: Platform.OS === "ios" ? 60 : 44,
    paddingBottom: T.sp.lg,
    paddingHorizontal: T.sp.md,
    overflow: "hidden",
  },
  heroBubble1: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#FFFFFF0D",
    top: -40,
    right: -30,
  },
  heroBubble2: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFFFFF0A",
    bottom: 10,
    left: -20,
  },
  heroContent: {
    alignItems: "center",
    paddingTop: T.sp.sm,
  },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: T.r.full,
    backgroundColor: "#FFFFFF22",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: T.sp.sm,
    borderWidth: 3,
    borderColor: "#FFFFFF40",
    position: "relative",
  },
  avatarEmoji:   { fontSize: 40 },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: T.r.full,
    backgroundColor: T.colors.amber,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: T.colors.primary,
  },
  avatarBadgeText: { fontSize: 11 },

  heroName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.4,
    marginBottom: T.sp.xs,
  },
  heroGrade: {
    fontSize: 13,
    color: "#FFFFFFCC",
    fontWeight: "600",
    marginBottom: 2,
  },
  heroSchool: {
    fontSize: 12,
    color: "#FFFFFF80",
    fontWeight: "500",
    marginBottom: T.sp.md,
    textAlign: "center",
  },

  heroStats: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF15",
    borderRadius: T.r.md,
    paddingVertical: T.sp.sm + 4,
    paddingHorizontal: T.sp.lg,
    gap: T.sp.lg,
    marginBottom: T.sp.md,
    borderWidth: 1,
    borderColor: "#FFFFFF20",
  },
  heroStat:      { alignItems: "center", gap: 2 },
  heroStatVal:   { fontSize: 16, fontWeight: "800", color: "#FFFFFF", letterSpacing: -0.2 },
  heroStatLabel: { fontSize: 11, color: "#FFFFFFAA", fontWeight: "500" },
  heroStatDivider: {
    width: 1,
    backgroundColor: "#FFFFFF30",
    alignSelf: "stretch",
  },

  editBtn: {
    alignSelf: "center",
    backgroundColor: "#FFFFFF20",
    borderRadius: T.r.full,
    paddingHorizontal: T.sp.lg,
    paddingVertical: T.sp.sm,
    borderWidth: 1,
    borderColor: "#FFFFFF35",
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },

  // ── Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: T.sp.md,
    paddingTop: T.sp.md,
  },

  // ── Card
  card: {
    backgroundColor: T.colors.surface,
    borderRadius: T.r.lg,
    padding: T.sp.md,
    marginBottom: T.sp.md,
    borderWidth: 1,
    borderColor: T.colors.border,
    shadowColor: "#3B5BDB",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: T.sp.md,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: T.colors.text,
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    color: T.colors.textMuted,
  },

  divider: {
    height: 1,
    backgroundColor: T.colors.divider,
    marginVertical: T.sp.sm,
  },

  // ── Language
  langScroll: {
    gap: T.sp.sm,
    paddingRight: T.sp.sm,
  },
  langChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: T.sp.sm,
    backgroundColor: T.colors.surfaceAlt,
    borderRadius: T.r.sm,
    paddingHorizontal: T.sp.sm + 4,
    paddingVertical: T.sp.sm,
    borderWidth: 1.5,
    borderColor: T.colors.border,
    position: "relative",
  },
  langChipActive: {
    backgroundColor: T.colors.primaryLight,
    borderColor: T.colors.primary,
  },
  langFlag:   { fontSize: 22 },
  langLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: T.colors.textSec,
  },
  langLabelActive: { color: T.colors.primary },
  langNative: {
    fontSize: 11,
    color: T.colors.textMuted,
    fontWeight: "500",
    marginTop: 1,
  },
  langCheck: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 16,
    height: 16,
    borderRadius: T.r.full,
    backgroundColor: T.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Settings row
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: T.sp.sm + 2,
  },
  settingRowBorder: {
    borderTopWidth: 1,
    borderTopColor: T.colors.divider,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: T.sp.sm,
    flex: 1,
    paddingRight: T.sp.md,
  },
  settingRight:     { flexShrink: 0 },
  settingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: T.r.xs,
    backgroundColor: T.colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: T.colors.text,
  },
  settingSubLabel: {
    fontSize: 11,
    color: T.colors.textMuted,
    fontWeight: "500",
    marginTop: 1,
  },

  // ── Font picker
  fontRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: T.sp.sm,
    paddingBottom: T.sp.sm,
  },
  fontPicker: {
    flexDirection: "row",
    gap: T.sp.xs,
    marginLeft: "auto",
  },
  fontOption: {
    width: 40,
    height: 36,
    borderRadius: T.r.xs,
    backgroundColor: T.colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: T.colors.border,
  },
  fontOptionActive: {
    backgroundColor: T.colors.primaryLight,
    borderColor: T.colors.primary,
  },
  fontOptionText:       { fontWeight: "800", color: T.colors.textMuted },
  fontOptionTextActive: { color: T.colors.primary },

  // ── Toggle
  toggleTrack: {
    width: 46,
    height: 26,
    borderRadius: T.r.full,
    justifyContent: "center",
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: T.r.full,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 2,
  },

  // ── Downloads
  downloadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: T.sp.sm,
    paddingVertical: T.sp.sm + 2,
  },
  downloadRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: T.colors.divider,
  },
  downloadIcon: {
    width: 44,
    height: 44,
    borderRadius: T.r.sm,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  downloadInfo: { flex: 1 },
  downloadTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: T.colors.text,
    marginBottom: T.sp.xs,
  },
  downloadMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: T.sp.sm,
  },
  downloadTag: {
    paddingHorizontal: T.sp.sm,
    paddingVertical: 2,
    borderRadius: T.r.full,
  },
  downloadTagText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  downloadSize: {
    fontSize: 11,
    color: T.colors.textMuted,
    fontWeight: "500",
  },
  downloadDel: {
    width: 36,
    height: 36,
    borderRadius: T.r.full,
    backgroundColor: T.colors.roseLight,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  downloadDelText: { fontSize: 15 },

  emptyDownloads: {
    alignItems: "center",
    paddingVertical: T.sp.lg,
    gap: T.sp.sm,
  },
  emptyDownloadsIcon: { fontSize: 32 },
  emptyDownloadsText: {
    fontSize: 13,
    color: T.colors.textMuted,
    fontWeight: "500",
  },

  clearAllBtn: {
    alignItems: "center",
    paddingVertical: T.sp.sm,
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: T.colors.rose,
  },

  // ── Account actions
  actionsCard: { padding: 0, overflow: "hidden" },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: T.sp.sm,
    paddingHorizontal: T.sp.md,
    paddingVertical: T.sp.md,
  },
  actionIcon:    { fontSize: 18, width: 28, textAlign: "center" },
  actionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: T.colors.text,
  },
  actionChevron: {
    fontSize: 20,
    color: T.colors.textMuted,
    fontWeight: "300",
  },

  // ── Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: T.sp.sm,
    backgroundColor: T.colors.roseLight,
    borderRadius: T.r.lg,
    height: 52,
    marginBottom: T.sp.md,
    borderWidth: 1.5,
    borderColor: T.colors.rose + "30",
  },
  logoutIcon: { fontSize: 18 },
  logoutText: {
    fontSize: 15,
    fontWeight: "800",
    color: T.colors.rose,
    letterSpacing: 0.2,
  },

  version: {
    textAlign: "center",
    fontSize: 11,
    color: T.colors.textMuted,
    fontWeight: "500",
    marginBottom: T.sp.sm,
  },
});