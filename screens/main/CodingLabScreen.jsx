// CodingLabScreen.js
// Lernzy – Coding Lab Screen (Expo SDK 54, React Native, JavaScript)

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
} from "react-native";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  bg: "#F4F6FB",
  surface: "#FFFFFF",
  primary: "#4F6EF7",
  primaryLight: "#EEF1FE",
  secondary: "#FF7F50",
  secondaryLight: "#FFF1EC",
  accent: "#34C98A",
  accentLight: "#E6FAF3",
  yellow: "#FFD166",
  yellowLight: "#FFF8E6",
  purple: "#9B8BF4",
  purpleLight: "#F0EEFE",
  text: "#1A1D2E",
  textMid: "#5A5E78",
  textLight: "#9EA3B8",
  border: "#E8EAF2",
  blockMove: "#4F6EF7",
  blockLoop: "#34C98A",
  blockIf: "#FF7F50",
  blockPrint: "#9B8BF4",
  blockWait: "#FFD166",
};

const SP = 8; // 8pt spacing unit

// ─── Data ─────────────────────────────────────────────────────────────────────
const BLOCK_PALETTE = [
  { id: "move", label: "Move Forward", color: COLORS.blockMove, icon: "▶" },
  { id: "loop", label: "Repeat 3×", color: COLORS.blockLoop, icon: "↺" },
  { id: "if", label: "If Condition", color: COLORS.blockIf, icon: "?", },
  { id: "print", label: "Show Text", color: COLORS.blockPrint, icon: "💬" },
  { id: "wait", label: "Wait 1 sec", color: COLORS.blockWait, icon: "⏱" },
];

const STARTER_PROJECTS = [
  {
    id: "1",
    title: "Say Hello 👋",
    desc: "Print a greeting on screen",
    difficulty: "Easy",
    diffColor: COLORS.accent,
    bg: COLORS.accentLight,
    icon: "💬",
  },
  {
    id: "2",
    title: "Move the Robot 🤖",
    desc: "Make the robot walk forward 5 steps",
    difficulty: "Easy",
    diffColor: COLORS.primary,
    bg: COLORS.primaryLight,
    icon: "🤖",
  },
  {
    id: "3",
    title: "Draw a Square ⬛",
    desc: "Use loops to draw a shape",
    difficulty: "Medium",
    diffColor: COLORS.secondary,
    bg: COLORS.secondaryLight,
    icon: "✏️",
  },
  {
    id: "4",
    title: "Number Checker 🔢",
    desc: "Check if a number is even or odd",
    difficulty: "Medium",
    diffColor: COLORS.purple,
    bg: COLORS.purpleLight,
    icon: "🔢",
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

/** Reusable section header */
const SectionHeader = ({ title, actionLabel, onAction }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {actionLabel && (
      <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
        <Text style={styles.sectionAction}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

/** A draggable-like block card in the palette */
const BlockCard = ({ block, onPress, isInCanvas }) => (
  <TouchableOpacity
    style={[
      styles.blockCard,
      { backgroundColor: block.color + "18", borderColor: block.color + "44" },
      isInCanvas && styles.blockCardInCanvas,
    ]}
    onPress={() => onPress(block)}
    activeOpacity={0.75}
  >
    <Text style={styles.blockIcon}>{block.icon}</Text>
    <Text style={[styles.blockLabel, { color: block.color }]}>{block.label}</Text>
  </TouchableOpacity>
);

/** Canvas drop zone — shows stacked blocks */
const ProgramCanvas = ({ blocks, onRemove }) => (
  <View style={styles.canvas}>
    {blocks.length === 0 ? (
      <View style={styles.canvasEmpty}>
        <Text style={styles.canvasEmptyIcon}>🧩</Text>
        <Text style={styles.canvasEmptyText}>Tap a block to add it here</Text>
      </View>
    ) : (
      blocks.map((block, idx) => (
        <TouchableOpacity
          key={`${block.id}-${idx}`}
          style={[styles.canvasBlock, { borderLeftColor: block.color }]}
          onPress={() => onRemove(idx)}
          activeOpacity={0.8}
        >
          <Text style={styles.blockIcon}>{block.icon}</Text>
          <Text style={[styles.canvasBlockLabel, { color: block.color }]}>
            {block.label}
          </Text>
          <Text style={styles.removeHint}>✕</Text>
        </TouchableOpacity>
      ))
    )}
  </View>
);

/** Output preview terminal */
const OutputPreview = ({ output, running }) => (
  <View style={styles.terminal}>
    <View style={styles.terminalHeader}>
      <View style={[styles.terminalDot, { backgroundColor: "#FF5F57" }]} />
      <View style={[styles.terminalDot, { backgroundColor: "#FEBC2E" }]} />
      <View style={[styles.terminalDot, { backgroundColor: "#28C840" }]} />
      <Text style={styles.terminalTitle}>Output</Text>
    </View>
    <ScrollView style={styles.terminalBody} nestedScrollEnabled>
      {running ? (
        <Text style={styles.terminalRunning}>▶ Running program…</Text>
      ) : output.length === 0 ? (
        <Text style={styles.terminalPlaceholder}>// Output will appear here</Text>
      ) : (
        output.map((line, i) => (
          <Text key={i} style={styles.terminalLine}>
            {line}
          </Text>
        ))
      )}
    </ScrollView>
  </View>
);

/** Starter project card */
const ProjectCard = ({ project, onPress }) => (
  <TouchableOpacity
    style={[styles.projectCard, { backgroundColor: project.bg }]}
    onPress={() => onPress(project)}
    activeOpacity={0.8}
  >
    <Text style={styles.projectCardIcon}>{project.icon}</Text>
    <View style={styles.projectCardBody}>
      <Text style={styles.projectCardTitle}>{project.title}</Text>
      <Text style={styles.projectCardDesc}>{project.desc}</Text>
      <View style={[styles.diffChip, { backgroundColor: project.diffColor + "22" }]}>
        <Text style={[styles.diffChipText, { color: project.diffColor }]}>
          {project.difficulty}
        </Text>
      </View>
    </View>
    <Text style={styles.projectCardArrow}>›</Text>
  </TouchableOpacity>
);

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function CodingLabScreen() {
  const [canvasBlocks, setCanvasBlocks] = useState([]);
  const [output, setOutput] = useState([]);
  const [running, setRunning] = useState(false);

  const addBlock = (block) => {
    setCanvasBlocks((prev) => [...prev, block]);
  };

  const removeBlock = (idx) => {
    setCanvasBlocks((prev) => prev.filter((_, i) => i !== idx));
  };

  const runProgram = () => {
    if (canvasBlocks.length === 0) return;
    setRunning(true);
    setOutput([]);
    setTimeout(() => {
      const lines = canvasBlocks.map((b, i) => `[${i + 1}] ${b.label} → ✅ Done`);
      lines.push("✨ Program finished!");
      setOutput(lines);
      setRunning(false);
    }, 1200);
  };

  const clearAll = () => {
    setCanvasBlocks([]);
    setOutput([]);
  };

  const openProject = (project) => {
    // Simulate loading a starter project
    const preset = BLOCK_PALETTE.slice(0, 2);
    setCanvasBlocks(preset);
    setOutput([]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>Lernzy</Text>
          <Text style={styles.headerTitle}>Coding Lab 🧪</Text>
        </View>
        <TouchableOpacity style={styles.headerBadge} activeOpacity={0.8}>
          <Text style={styles.headerBadgeText}>⭐ 240 pts</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Block Palette ── */}
        <SectionHeader title="Block Palette" actionLabel="Help ?" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.paletteRow}
        >
          {BLOCK_PALETTE.map((block) => (
            <BlockCard key={block.id} block={block} onPress={addBlock} />
          ))}
        </ScrollView>

        {/* ── Program Canvas ── */}
        <SectionHeader
          title="My Program"
          actionLabel={canvasBlocks.length > 0 ? "Clear" : null}
          onAction={clearAll}
        />
        <ProgramCanvas blocks={canvasBlocks} onRemove={removeBlock} />

        {/* ── Action Buttons ── */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[
              styles.btnPrimary,
              canvasBlocks.length === 0 && styles.btnDisabled,
            ]}
            onPress={runProgram}
            disabled={canvasBlocks.length === 0 || running}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>
              {running ? "Running…" : "▶  Run Program"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={clearAll}
            activeOpacity={0.8}
          >
            <Text style={styles.btnSecondaryText}>🗑 Clear</Text>
          </TouchableOpacity>
        </View>

        {/* ── Output Preview ── */}
        <SectionHeader title="Output Preview" />
        <OutputPreview output={output} running={running} />

        {/* ── Starter Projects ── */}
        <SectionHeader title="Starter Projects" actionLabel="See All" />
        <View style={styles.projectList}>
          {STARTER_PROJECTS.map((project) => (
            <ProjectCard key={project.id} project={project} onPress={openProject} />
          ))}
        </View>

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

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SP * 2,
    paddingTop: SP * 2,
    paddingBottom: SP * 1.5,
    backgroundColor: COLORS.bg,
  },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 2,
  },
  headerBadge: {
    backgroundColor: COLORS.yellowLight,
    borderRadius: 20,
    paddingHorizontal: SP * 1.5,
    paddingVertical: SP * 0.75,
    borderWidth: 1,
    borderColor: COLORS.yellow,
  },
  headerBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#A0720A",
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SP * 2,
    paddingTop: SP,
  },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SP * 2.5,
    marginBottom: SP,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  sectionAction: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
  },

  // Palette
  paletteRow: {
    paddingBottom: SP,
    gap: SP,
  },
  blockCard: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: SP * 1.5,
    paddingVertical: SP * 1.25,
    alignItems: "center",
    minWidth: 90,
    gap: 4,
  },
  blockCardInCanvas: {
    opacity: 0.6,
  },
  blockIcon: {
    fontSize: 20,
  },
  blockLabel: {
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },

  // Canvas
  canvas: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    minHeight: 140,
    padding: SP * 1.5,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    gap: SP,
  },
  canvasEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SP * 3,
  },
  canvasEmptyIcon: {
    fontSize: 32,
    marginBottom: SP,
  },
  canvasEmptyText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  canvasBlock: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bg,
    borderRadius: 10,
    paddingHorizontal: SP * 1.5,
    paddingVertical: SP,
    borderLeftWidth: 4,
    gap: SP,
  },
  canvasBlockLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  removeHint: {
    fontSize: 12,
    color: COLORS.textLight,
  },

  // Action buttons
  actionsRow: {
    flexDirection: "row",
    gap: SP,
    marginTop: SP * 2,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: SP * 1.75,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  btnDisabled: {
    backgroundColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  btnPrimaryText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  btnSecondary: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingVertical: SP * 1.75,
    paddingHorizontal: SP * 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  btnSecondaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMid,
  },

  // Terminal / Output
  terminal: {
    backgroundColor: "#1A1D2E",
    borderRadius: 16,
    overflow: "hidden",
    minHeight: 120,
  },
  terminalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: SP * 1.25,
    paddingHorizontal: SP * 1.5,
    backgroundColor: "#12141F",
    gap: 6,
  },
  terminalDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  terminalTitle: {
    fontSize: 11,
    color: "#6B7194",
    fontWeight: "600",
    marginLeft: SP * 0.5,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  terminalBody: {
    padding: SP * 1.5,
    maxHeight: 140,
  },
  terminalPlaceholder: {
    fontSize: 13,
    color: "#4A5070",
    fontFamily: "monospace",
  },
  terminalRunning: {
    fontSize: 13,
    color: COLORS.accent,
    fontFamily: "monospace",
  },
  terminalLine: {
    fontSize: 13,
    color: "#A8FFD0",
    fontFamily: "monospace",
    marginBottom: 4,
  },

  // Projects
  projectList: {
    gap: SP * 1.25,
  },
  projectCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: SP * 1.5,
    gap: SP * 1.5,
  },
  projectCardIcon: {
    fontSize: 30,
    width: 44,
    textAlign: "center",
  },
  projectCardBody: {
    flex: 1,
    gap: 3,
  },
  projectCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  projectCardDesc: {
    fontSize: 12,
    color: COLORS.textMid,
    fontWeight: "400",
  },
  diffChip: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  diffChipText: {
    fontSize: 11,
    fontWeight: "700",
  },
  projectCardArrow: {
    fontSize: 22,
    color: COLORS.textLight,
    fontWeight: "300",
  },
});
