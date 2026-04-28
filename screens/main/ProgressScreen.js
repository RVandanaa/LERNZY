import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  StatusBar,
  Dimensions,
} from "react-native";

const { width: SCREEN_W } = Dimensions.get("window");
const CHART_SIZE = SCREEN_W - 80;
const CENTER = CHART_SIZE / 2;
const RADIUS = CENTER - 24;

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  colors: {
    bg:           "#FAFBFF",
    surface:      "#FFFFFF",
    surfaceAlt:   "#F3F6FF",
    border:       "#E8EDFF",

    primary:      "#4F46E5",
    primaryLight: "#EEF0FF",
    primaryGlow:  "#4F46E530",

    emerald:      "#10B981",
    emeraldLight: "#ECFDF5",

    amber:        "#F59E0B",
    amberLight:   "#FFFBEB",

    rose:         "#F43F5E",
    roseLight:    "#FFF1F2",

    sky:          "#0EA5E9",
    skyLight:     "#F0F9FF",

    violet:       "#8B5CF6",
    violetLight:  "#F5F3FF",

    text:         "#0F172A",
    textSec:      "#475569",
    textMuted:    "#94A3B8",

    streakOrange: "#FF6B35",
    streakGold:   "#FFD700",
  },
  sp: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  r:  { sm: 10, md: 14, lg: 18, xl: 24, full: 999 },
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const SKILLS = [
  { label: "Math",     value: 0.82, color: T.colors.primary  },
  { label: "Science",  value: 0.65, color: T.colors.emerald  },
  { label: "English",  value: 0.74, color: T.colors.sky      },
  { label: "History",  value: 0.48, color: T.colors.amber    },
  { label: "Logic",    value: 0.91, color: T.colors.violet   },
  { label: "Hindi",    value: 0.55, color: T.colors.rose     },
];

const STREAK_DAYS = [
  { day: "M", done: true  },
  { day: "T", done: true  },
  { day: "W", done: true  },
  { day: "T", done: true  },
  { day: "F", done: true  },
  { day: "S", done: false },
  { day: "S", done: false },
];

const WEAK_AREAS = [
  { subject: "History",    topic: "Mughal Empire",       score: 48, icon: "🏛️", color: T.colors.amber  },
  { subject: "Hindi",      topic: "Sandhi & Samas",      score: 55, icon: "📝", color: T.colors.rose   },
  { subject: "Science",    topic: "Chemical Reactions",  score: 65, icon: "⚗️", color: T.colors.emerald},
];

const RECOMMENDATIONS = [
  {
    title:    "Mughal Empire Quiz",
    subject:  "History · Class 8",
    duration: "12 min",
    icon:     "🏛️",
    tag:      "Weak Area",
    tagColor: T.colors.amber,
    bg:       T.colors.amberLight,
    border:   T.colors.amber + "40",
  },
  {
    title:    "Chemical Bonds",
    subject:  "Science · Chapter 4",
    duration: "18 min",
    icon:     "⚗️",
    tag:      "Trending",
    tagColor: T.colors.emerald,
    bg:       T.colors.emeraldLight,
    border:   T.colors.emerald + "40",
  },
  {
    title:    "Algebra Mastery",
    subject:  "Math · Advanced",
    duration: "25 min",
    icon:     "📐",
    tag:      "Strength",
    tagColor: T.colors.primary,
    bg:       T.colors.primaryLight,
    border:   T.colors.primary + "40",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function polarToXY(angle, r, cx, cy) {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function buildPolygonPoints(values, radius, cx, cy) {
  const n = values.length;
  return values.map((v, i) => {
    const angle = (360 / n) * i;
    return polarToXY(angle, radius * v, cx, cy);
  });
}

function pointsToSVGPath(pts) {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";
}

// ─── RadarChart (pure RN, no SVG lib) ────────────────────────────────────────
function RadarChart({ skills, animValue }) {
  const n = skills.length;
  const levels = [0.25, 0.5, 0.75, 1.0];

  // Animated polygon points
  const animatedValues = skills.map((s) => {
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      Animated.timing(anim, {
        toValue: s.value,
        duration: 1100,
        delay: 300,
        useNativeDriver: false,
      }).start();
    }, []);
    return anim;
  });

  // We'll render a static snapshot via useRef + state trick
  const [pts, setPts] = useState(() =>
    buildPolygonPoints(skills.map(() => 0), RADIUS, CENTER, CENTER)
  );
  const [filledPts, setFilledPts] = useState(pts);

  useEffect(() => {
    const id = setInterval(() => {
      const currentVals = animatedValues.map((a) => {
        // read current interpolated value
        let v = 0;
        const listener = a.addListener(({ value }) => { v = value; });
        a.removeListener(listener);
        return v;
      });
      setFilledPts(buildPolygonPoints(currentVals, RADIUS, CENTER, CENTER));
    }, 16);
    return () => clearInterval(id);
  }, []);

  // Animate via JS-driven loop
  useEffect(() => {
    let frame;
    const start = Date.now();
    const duration = 1100;
    const delay = 300;

    const tick = () => {
      const elapsed = Date.now() - start - delay;
      const t = Math.min(Math.max(elapsed / duration, 0), 1);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const currentVals = skills.map((s) => s.value * eased);
      setFilledPts(buildPolygonPoints(currentVals, RADIUS, CENTER, CENTER));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const axisPoints = skills.map((_, i) => {
    const angle = (360 / n) * i;
    return polarToXY(angle, RADIUS, CENTER, CENTER);
  });

  const labelPoints = skills.map((_, i) => {
    const angle = (360 / n) * i;
    return polarToXY(angle, RADIUS + 22, CENTER, CENTER);
  });

  return (
    <View style={{ width: CHART_SIZE, height: CHART_SIZE }}>
      {/* Web grid rings */}
      {levels.map((lv, li) => {
        const ringPts = buildPolygonPoints(
          skills.map(() => lv),
          RADIUS,
          CENTER,
          CENTER
        );
        return (
          <View key={li} style={StyleSheet.absoluteFill} pointerEvents="none">
            {ringPts.map((pt, pi) => {
              const next = ringPts[(pi + 1) % ringPts.length];
              const dx = next.x - pt.x;
              const dy = next.y - pt.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx) * (180 / Math.PI);
              return (
                <View
                  key={pi}
                  style={{
                    position: "absolute",
                    left: pt.x,
                    top: pt.y,
                    width: len,
                    height: 1,
                    backgroundColor:
                      lv === 1.0 ? T.colors.border + "CC" : T.colors.border + "70",
                    transformOrigin: "left center",
                    transform: [{ rotate: `${angle}deg` }],
                  }}
                />
              );
            })}
          </View>
        );
      })}

      {/* Axis lines */}
      {axisPoints.map((pt, i) => {
        const dx = pt.x - CENTER;
        const dy = pt.y - CENTER;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return (
          <View
            key={i}
            style={{
              position: "absolute",
              left: CENTER,
              top: CENTER,
              width: len,
              height: 1,
              backgroundColor: T.colors.border,
              transformOrigin: "left center",
              transform: [{ rotate: `${angle}deg` }],
            }}
          />
        );
      })}

      {/* Filled polygon — drawn as triangles from center */}
      {filledPts.map((pt, i) => {
        const next = filledPts[(i + 1) % filledPts.length];
        // Triangle: CENTER→pt→next
        // Use a thin line approach: draw each edge with opacity fill overlay
        const dx = next.x - pt.x;
        const dy = next.y - pt.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return (
          <View
            key={`edge-${i}`}
            style={{
              position: "absolute",
              left: pt.x,
              top: pt.y,
              width: len,
              height: 2,
              backgroundColor: T.colors.primary,
              opacity: 0.9,
              transformOrigin: "left center",
              transform: [{ rotate: `${angle}deg` }],
            }}
          />
        );
      })}

      {/* Filled area — radial sectors */}
      {filledPts.map((pt, i) => {
        const next = filledPts[(i + 1) % filledPts.length];
        const mx = (pt.x + next.x + CENTER) / 3;
        const my = (pt.y + next.y + CENTER) / 3;
        const w = Math.abs(pt.x - next.x) + Math.abs(pt.x - CENTER);
        const h = Math.abs(pt.y - next.y) + Math.abs(pt.y - CENTER);
        return (
          <View
            key={`fill-${i}`}
            style={{
              position: "absolute",
              left: Math.min(pt.x, next.x, CENTER) - 2,
              top: Math.min(pt.y, next.y, CENTER) - 2,
              width: w + 4,
              height: h + 4,
              backgroundColor: T.colors.primary,
              opacity: 0.08,
              borderRadius: 2,
            }}
            pointerEvents="none"
          />
        );
      })}

      {/* Vertex dots */}
      {filledPts.map((pt, i) => (
        <View
          key={`dot-${i}`}
          style={{
            position: "absolute",
            left: pt.x - 5,
            top: pt.y - 5,
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: skills[i].color,
            borderWidth: 2,
            borderColor: T.colors.surface,
            shadowColor: skills[i].color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.7,
            shadowRadius: 4,
            elevation: 3,
          }}
        />
      ))}

      {/* Labels */}
      {skills.map((skill, i) => {
        const lp = labelPoints[i];
        return (
          <View
            key={`label-${i}`}
            style={{
              position: "absolute",
              left: lp.x - 28,
              top: lp.y - 12,
              width: 56,
              alignItems: "center",
            }}
          >
            <Text style={styles.radarLabel}>{skill.label}</Text>
            <Text style={[styles.radarValue, { color: skill.color }]}>
              {Math.round(skill.value * 100)}%
            </Text>
          </View>
        );
      })}

      {/* Center dot */}
      <View
        style={{
          position: "absolute",
          left: CENTER - 4,
          top: CENTER - 4,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: T.colors.primary,
          opacity: 0.5,
        }}
      />
    </View>
  );
}

// ─── StreakDay ────────────────────────────────────────────────────────────────
function StreakDay({ day, done, index }) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        delay: index * 60,
        useNativeDriver: true,
        tension: 80,
        friction: 7,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.streakDay,
        done && styles.streakDayDone,
        { transform: [{ scale }], opacity },
      ]}
    >
      <Text style={styles.streakDayIcon}>{done ? "🔥" : "○"}</Text>
      <Text style={[styles.streakDayLabel, done && styles.streakDayLabelDone]}>
        {day}
      </Text>
    </Animated.View>
  );
}

// ─── WeakAreaBar ─────────────────────────────────────────────────────────────
function WeakAreaBar({ item, index }) {
  const barW = useRef(new Animated.Value(0)).current;
  const slideX = useRef(new Animated.Value(-20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(barW, {
        toValue: item.score,
        duration: 700,
        delay: 200 + index * 120,
        useNativeDriver: false,
      }),
      Animated.timing(slideX, {
        toValue: 0,
        duration: 400,
        delay: 200 + index * 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay: 200 + index * 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[styles.weakRow, { opacity, transform: [{ translateX: slideX }] }]}
    >
      <View style={[styles.weakIcon, { backgroundColor: item.color + "20" }]}>
        <Text style={{ fontSize: 18 }}>{item.icon}</Text>
      </View>
      <View style={styles.weakInfo}>
        <View style={styles.weakTopRow}>
          <Text style={styles.weakSubject}>{item.subject}</Text>
          <Text style={[styles.weakScore, { color: item.color }]}>
            {item.score}%
          </Text>
        </View>
        <Text style={styles.weakTopic}>{item.topic}</Text>
        <View style={styles.weakBarTrack}>
          <Animated.View
            style={[
              styles.weakBarFill,
              {
                backgroundColor: item.color,
                width: barW.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
}

// ─── RecommendCard ────────────────────────────────────────────────────────────
function RecommendCard({ item, index }) {
  const slideY = useRef(new Animated.Value(16)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideY, {
        toValue: 0,
        duration: 400,
        delay: 400 + index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay: 400 + index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.recommendCard,
        { backgroundColor: item.bg, borderColor: item.border },
        { opacity, transform: [{ translateY: slideY }] },
      ]}
    >
      <TouchableOpacity activeOpacity={0.8} style={styles.recommendInner}>
        <View style={styles.recommendLeft}>
          <View style={[styles.recommendIconWrap, { borderColor: item.border }]}>
            <Text style={{ fontSize: 24 }}>{item.icon}</Text>
          </View>
        </View>
        <View style={styles.recommendMid}>
          <Text style={styles.recommendTitle}>{item.title}</Text>
          <Text style={styles.recommendSub}>{item.subject}</Text>
          <View style={styles.recommendMeta}>
            <Text style={styles.recommendDur}>⏱ {item.duration}</Text>
          </View>
        </View>
        <View style={styles.recommendRight}>
          <View
            style={[
              styles.recommendTag,
              { backgroundColor: item.tagColor + "20" },
            ]}
          >
            <Text style={[styles.recommendTagText, { color: item.tagColor }]}>
              {item.tag}
            </Text>
          </View>
          <Text style={styles.recommendArrow}>›</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── StatPill ─────────────────────────────────────────────────────────────────
function StatPill({ label, value, icon, color }) {
  const countAnim = useRef(new Animated.Value(0)).current;
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    Animated.timing(countAnim, {
      toValue: value,
      duration: 900,
      delay: 200,
      useNativeDriver: false,
    }).start();
    const listener = countAnim.addListener(({ value: v }) =>
      setDisplayed(Math.round(v))
    );
    return () => countAnim.removeListener(listener);
  }, []);

  return (
    <View style={[styles.statPill, { borderColor: color + "30" }]}>
      <Text style={styles.statPillIcon}>{icon}</Text>
      <Text style={[styles.statPillValue, { color }]}>{displayed}</Text>
      <Text style={styles.statPillLabel}>{label}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProgressScreen() {
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={T.colors.bg} />

      {/* ── Header ── */}
      <Animated.View style={[styles.header, { opacity: headerAnim }]}>
        <View>
          <Text style={styles.headerGreeting}>Your Progress</Text>
          <Text style={styles.headerSub}>Week 3 · April 2026</Text>
        </View>
        <TouchableOpacity style={styles.headerAvatarBtn} activeOpacity={0.8}>
          <Text style={{ fontSize: 22 }}>👤</Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Stat Pills Row ── */}
        <View style={styles.statRow}>
          <StatPill label="XP"      value={3240} icon="⚡" color={T.colors.primary}  />
          <StatPill label="Days"    value={18}   icon="📅" color={T.colors.emerald}  />
          <StatPill label="Topics"  value={42}   icon="📚" color={T.colors.violet}   />
        </View>

        {/* ── Radar Chart Card ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Skill Radar</Text>
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>This Week</Text>
            </View>
          </View>
          <Text style={styles.cardSubtitle}>
            Your subject strengths at a glance
          </Text>

          <View style={styles.radarWrap}>
            <RadarChart skills={SKILLS} />
          </View>

          {/* Legend */}
          <View style={styles.legendRow}>
            {SKILLS.map((s) => (
              <View key={s.label} style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: s.color }]}
                />
                <Text style={styles.legendLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Streak Card ── */}
        <View style={[styles.card, styles.streakCard]}>
          <View style={styles.streakHeader}>
            <View>
              <Text style={styles.streakTitle}>🔥 Learning Streak</Text>
              <Text style={styles.streakSubtitle}>Keep it going!</Text>
            </View>
            <View style={styles.streakBadge}>
              <Text style={styles.streakCount}>5</Text>
              <Text style={styles.streakDaysLabel}>day streak</Text>
            </View>
          </View>

          <View style={styles.streakDaysRow}>
            {STREAK_DAYS.map((d, i) => (
              <StreakDay key={i} day={d.day} done={d.done} index={i} />
            ))}
          </View>

          <View style={styles.streakFooter}>
            <Text style={styles.streakFooterText}>
              🎯 2 more days to unlock a{" "}
              <Text style={{ color: T.colors.streakOrange, fontWeight: "700" }}>
                Weekly Champion
              </Text>{" "}
              badge!
            </Text>
          </View>
        </View>

        {/* ── Weak Areas ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Weak Areas</Text>
            <TouchableOpacity style={styles.cardLink} activeOpacity={0.7}>
              <Text style={styles.cardLinkText}>Practice all →</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cardSubtitle}>
            Topics that need your attention
          </Text>
          <View style={styles.weakList}>
            {WEAK_AREAS.map((item, i) => (
              <WeakAreaBar key={i} item={item} index={i} />
            ))}
          </View>
        </View>

        {/* ── Recommended Learning ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.recommendList}>
            {RECOMMENDATIONS.map((item, i) => (
              <RecommendCard key={i} item={item} index={i} />
            ))}
          </View>
        </View>

        <View style={{ height: T.sp.xl }} />
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

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 60 : 44,
    paddingBottom: T.sp.md,
    paddingHorizontal: T.sp.md,
    backgroundColor: T.colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: T.colors.border,
  },
  headerGreeting: {
    fontSize: 24,
    fontWeight: "800",
    color: T.colors.text,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: T.colors.textMuted,
    fontWeight: "500",
    marginTop: 2,
  },
  headerAvatarBtn: {
    width: 44,
    height: 44,
    borderRadius: T.r.full,
    backgroundColor: T.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: T.colors.border,
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: T.sp.md,
    paddingTop: T.sp.md,
  },

  // Stat Pills
  statRow: {
    flexDirection: "row",
    gap: T.sp.sm,
    marginBottom: T.sp.md,
  },
  statPill: {
    flex: 1,
    backgroundColor: T.colors.surface,
    borderRadius: T.r.md,
    paddingVertical: T.sp.md,
    alignItems: "center",
    gap: T.sp.xs,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statPillIcon:  { fontSize: 20 },
  statPillValue: { fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },
  statPillLabel: { fontSize: 11, fontWeight: "600", color: T.colors.textMuted },

  // Card
  card: {
    backgroundColor: T.colors.surface,
    borderRadius: T.r.lg,
    padding: T.sp.md,
    marginBottom: T.sp.md,
    borderWidth: 1,
    borderColor: T.colors.border,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: T.sp.xs,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: T.colors.text,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: T.colors.textMuted,
    fontWeight: "500",
    marginBottom: T.sp.md,
  },
  cardBadge: {
    backgroundColor: T.colors.primaryLight,
    paddingHorizontal: T.sp.sm,
    paddingVertical: T.sp.xs,
    borderRadius: T.r.full,
  },
  cardBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: T.colors.primary,
  },
  cardLink: {
    paddingVertical: T.sp.xs,
  },
  cardLinkText: {
    fontSize: 13,
    fontWeight: "700",
    color: T.colors.primary,
  },

  // Radar
  radarWrap: {
    alignItems: "center",
    marginBottom: T.sp.md,
  },
  radarLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: T.colors.textSec,
    textAlign: "center",
  },
  radarValue: {
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: T.sp.sm,
    justifyContent: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: T.sp.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: T.r.full,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: T.colors.textSec,
  },

  // Streak
  streakCard: {
    backgroundColor: "#FFFBF5",
    borderColor: "#FFD70040",
  },
  streakHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: T.sp.md,
  },
  streakTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: T.colors.text,
    letterSpacing: -0.3,
  },
  streakSubtitle: {
    fontSize: 13,
    color: T.colors.textMuted,
    fontWeight: "500",
    marginTop: 2,
  },
  streakBadge: {
    backgroundColor: T.colors.streakOrange + "15",
    borderRadius: T.r.md,
    paddingHorizontal: T.sp.md,
    paddingVertical: T.sp.xs + 2,
    alignItems: "center",
    borderWidth: 1,
    borderColor: T.colors.streakOrange + "30",
  },
  streakCount: {
    fontSize: 22,
    fontWeight: "900",
    color: T.colors.streakOrange,
    letterSpacing: -0.5,
  },
  streakDaysLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: T.colors.streakOrange,
  },
  streakDaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: T.sp.md,
  },
  streakDay: {
    flex: 1,
    alignItems: "center",
    paddingVertical: T.sp.sm,
    borderRadius: T.r.sm,
    backgroundColor: T.colors.surfaceAlt,
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: T.colors.border,
  },
  streakDayDone: {
    backgroundColor: "#FFF4E6",
    borderColor: T.colors.streakOrange + "50",
  },
  streakDayIcon: { fontSize: 16, marginBottom: T.sp.xs },
  streakDayLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: T.colors.textMuted,
  },
  streakDayLabelDone: { color: T.colors.streakOrange },
  streakFooter: {
    backgroundColor: T.colors.amberLight,
    borderRadius: T.r.sm,
    padding: T.sp.sm,
    borderWidth: 1,
    borderColor: T.colors.amber + "30",
  },
  streakFooterText: {
    fontSize: 12,
    color: T.colors.textSec,
    fontWeight: "500",
    lineHeight: 18,
  },

  // Weak areas
  weakList: { gap: T.sp.md },
  weakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: T.sp.sm,
  },
  weakIcon: {
    width: 44,
    height: 44,
    borderRadius: T.r.sm,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  weakInfo: { flex: 1 },
  weakTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  weakSubject: {
    fontSize: 14,
    fontWeight: "700",
    color: T.colors.text,
  },
  weakScore: {
    fontSize: 14,
    fontWeight: "800",
  },
  weakTopic: {
    fontSize: 12,
    color: T.colors.textMuted,
    fontWeight: "500",
    marginBottom: T.sp.xs + 2,
  },
  weakBarTrack: {
    height: 5,
    backgroundColor: T.colors.surfaceAlt,
    borderRadius: T.r.full,
    overflow: "hidden",
  },
  weakBarFill: {
    height: "100%",
    borderRadius: T.r.full,
    opacity: 0.85,
  },

  // Recommended
  section: { marginBottom: T.sp.md },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: T.sp.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: T.colors.text,
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "700",
    color: T.colors.primary,
  },
  recommendList: { gap: T.sp.sm },
  recommendCard: {
    borderRadius: T.r.md,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  recommendInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: T.sp.md,
    gap: T.sp.sm,
  },
  recommendLeft: { flexShrink: 0 },
  recommendIconWrap: {
    width: 48,
    height: 48,
    borderRadius: T.r.sm,
    backgroundColor: "#FFFFFF60",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  recommendMid: { flex: 1 },
  recommendTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: T.colors.text,
    letterSpacing: -0.2,
  },
  recommendSub: {
    fontSize: 12,
    color: T.colors.textSec,
    fontWeight: "500",
    marginTop: 2,
    marginBottom: T.sp.xs,
  },
  recommendMeta: { flexDirection: "row", gap: T.sp.sm },
  recommendDur: {
    fontSize: 11,
    fontWeight: "600",
    color: T.colors.textMuted,
  },
  recommendRight: {
    alignItems: "flex-end",
    gap: T.sp.sm,
    flexShrink: 0,
  },
  recommendTag: {
    paddingHorizontal: T.sp.sm,
    paddingVertical: T.sp.xs,
    borderRadius: T.r.full,
  },
  recommendTagText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  recommendArrow: {
    fontSize: 20,
    color: T.colors.textMuted,
    fontWeight: "300",
  },
});