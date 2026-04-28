console.log('CodeBlock:', CodeBlock);
console.log('BLOCK_COLORS:', BLOCK_COLORS);
console.log('SafeAreaView:', SafeAreaView);
console.log('CodeBlock module loaded', CodeBlock, BLOCK_COLORS);
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Pressable,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CodeBlock, BLOCK_COLORS } from '../../components/CodeBlock';
import { colors }     from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing }    from '../../theme/spacing';
import { radius }     from '../../theme/radius';
import { shadows }    from '../../theme/shadows';

const { height: SCREEN_H } = Dimensions.get('window');

// ─── Data ─────────────────────────────────────────────────

const STARTER_PROJECTS = [
  {
    id: 'hello',
    emoji: '👋',
    title: 'Hello World',
    desc:  'Your very first program — print a greeting.',
    tag:   'Beginner',
    tagColor: colors.primaryContainer,
    tagText:  colors.onPrimaryContainer,
    blocks: [
      { id: 'b1', category: 'output',   icon: '🖨️', label: 'Print',    value: '"Hello, World!"',  indent: 0 },
      { id: 'b2', category: 'output',   icon: '🖨️', label: 'Print',    value: '"I am learning!"', indent: 0 },
    ],
    output: ['Hello, World!', 'I am learning!'],
  },
  {
    id: 'counter',
    emoji: '🔢',
    title: 'Counter Loop',
    desc:  'Count from 1 to 5 using a repeat loop.',
    tag:   'Beginner',
    tagColor: colors.primaryContainer,
    tagText:  colors.onPrimaryContainer,
    blocks: [
      { id: 'b1', category: 'variable', icon: '📦', label: 'Set',       value: 'count = 1',   indent: 0 },
      { id: 'b2', category: 'control',  icon: '🔁', label: 'Repeat',    value: '5 times',     indent: 0 },
      { id: 'b3', category: 'output',   icon: '🖨️', label: 'Print',    value: 'count',        indent: 1 },
      { id: 'b4', category: 'math',     icon: '➕', label: 'Change',    value: 'count + 1',   indent: 1 },
    ],
    output: ['1', '2', '3', '4', '5'],
  },
  {
    id: 'guess',
    emoji: '🎯',
    title: 'Number Guesser',
    desc:  'Check if a number is too high, too low, or correct.',
    tag:   'Intermediate',
    tagColor: colors.secondaryContainer,
    tagText:  colors.onSecondaryContainer,
    blocks: [
      { id: 'b1', category: 'variable', icon: '📦', label: 'Set',       value: 'secret = 7',  indent: 0 },
      { id: 'b2', category: 'variable', icon: '📦', label: 'Set',       value: 'guess = 5',   indent: 0 },
      { id: 'b3', category: 'logic',    icon: '🔀', label: 'If',        value: 'guess < secret', indent: 0 },
      { id: 'b4', category: 'output',   icon: '🖨️', label: 'Print',    value: '"Too low!"',   indent: 1 },
      { id: 'b5', category: 'logic',    icon: '🔀', label: 'Else If',   value: 'guess > secret', indent: 0 },
      { id: 'b6', category: 'output',   icon: '🖨️', label: 'Print',    value: '"Too high!"',  indent: 1 },
      { id: 'b7', category: 'logic',    icon: '🔀', label: 'Else',      value: '',             indent: 0 },
      { id: 'b8', category: 'output',   icon: '🖨️', label: 'Print',    value: '"Correct! 🎉"', indent: 1 },
    ],
    output: ['Too low!'],
  },
  {
    id: 'pattern',
    emoji: '⭐',
    title: 'Star Pattern',
    desc:  'Draw a triangle of stars using nested loops.',
    tag:   'Intermediate',
    tagColor: colors.secondaryContainer,
    tagText:  colors.onSecondaryContainer,
    blocks: [
      { id: 'b1', category: 'control',  icon: '🔁', label: 'Repeat',    value: '5 times (row)', indent: 0 },
      { id: 'b2', category: 'variable', icon: '📦', label: 'Set',       value: 'stars = ""',   indent: 1 },
      { id: 'b3', category: 'control',  icon: '🔁', label: 'Repeat',    value: 'row times',    indent: 1 },
      { id: 'b4', category: 'math',     icon: '➕', label: 'Append',    value: 'stars + "★"',  indent: 2 },
      { id: 'b5', category: 'output',   icon: '🖨️', label: 'Print',    value: 'stars',         indent: 1 },
    ],
    output: ['★', '★★', '★★★', '★★★★', '★★★★★'],
  },
];

const PALETTE_BLOCKS = [
  { category: 'control',  icon: '🔁', label: 'Repeat',   value: 'N times' },
  { category: 'control',  icon: '⏹️', label: 'Stop',     value: '' },
  { category: 'output',   icon: '🖨️', label: 'Print',   value: '"..."' },
  { category: 'variable', icon: '📦', label: 'Set',      value: 'name = value' },
  { category: 'variable', icon: '🔄', label: 'Change',   value: 'name + 1' },
  { category: 'logic',    icon: '🔀', label: 'If',       value: 'condition' },
  { category: 'logic',    icon: '🔀', label: 'Else',     value: '' },
  { category: 'math',     icon: '➕', label: 'Add',      value: 'a + b' },
  { category: 'math',     icon: '✖️', label: 'Multiply', value: 'a × b' },
];

// ─── Tab views ────────────────────────────────────────────
const TABS = ['Workspace', 'Projects'];

// ─── Main screen ──────────────────────────────────────────

export default function CodingLabScreen({ navigation }) {
  const [activeTab,     setActiveTab]     = useState(0);
  const [activeProject, setActiveProject] = useState(STARTER_PROJECTS[0]);
  const [blocks,        setBlocks]        = useState(STARTER_PROJECTS[0].blocks);
  const [output,        setOutput]        = useState(STARTER_PROJECTS[0].output);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [paletteOpen,   setPaletteOpen]   = useState(false);
  const [running,       setRunning]       = useState(false);
  const [ran,           setRan]           = useState(true);

  const runAnim   = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(1)).current;

  // ── Load project ──────────────────────────────────────
  const loadProject = useCallback((project) => {
    setActiveProject(project);
    setBlocks(project.blocks.map(b => ({ ...b })));
    setOutput([]);
    setSelectedBlock(null);
    setRan(false);
    setActiveTab(0);
  }, []);

  // ── Run simulation ────────────────────────────────────
  const handleRun = useCallback(() => {
    if (running) return;
    setRunning(true);
    setRan(false);
    setOutput([]);

    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.4, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1,   duration: 200, useNativeDriver: true }),
    ]).start();

    // Reveal output lines one-by-one
    const lines = activeProject.output;
    lines.forEach((line, i) => {
      setTimeout(() => {
        setOutput(prev => [...prev, line]);
        if (i === lines.length - 1) {
          setRunning(false);
          setRan(true);
        }
      }, 300 + i * 350);
    });
  }, [running, activeProject, fadeAnim]);

  // ── Block ops ─────────────────────────────────────────
  const handleBlockPress = (id) =>
    setSelectedBlock(prev => prev === id ? null : id);

  const handleMoveUp = useCallback((idx) => {
    if (idx === 0) return;
    setBlocks(prev => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }, []);

  const handleMoveDown = useCallback((idx) => {
    setBlocks(prev => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }, []);

  const handleDelete = useCallback((id) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    setSelectedBlock(null);
  }, []);

  const handleAddBlock = useCallback((template) => {
    const newBlock = {
      ...template,
      id: `b_${Date.now()}`,
      indent: 0,
    };
    setBlocks(prev => [...prev, newBlock]);
    setPaletteOpen(false);
    setRan(false);
  }, []);

  // ── Render ────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* ── Header ──────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={8}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>💻 Coding Lab</Text>
          <Text style={styles.headerSub}>{activeProject.title}</Text>
        </View>
        <TouchableOpacity style={styles.helpBtn} hitSlop={8}>
          <Text style={styles.helpIcon}>?</Text>
        </TouchableOpacity>
      </View>

      {/* ── Tab bar ─────────────────────────────────── */}
      <View style={styles.tabBar}>
        {TABS.map((t, i) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, activeTab === i && styles.tabActive]}
            onPress={() => setActiveTab(i)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabLabel, activeTab === i && styles.tabLabelActive]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Tab: Workspace ──────────────────────────── */}
      {activeTab === 0 && (
        <View style={styles.workspace}>

          {/* Block canvas */}
          <View style={styles.canvasWrap}>
            <View style={styles.canvasHeader}>
              <Text style={styles.canvasTitle}>Program</Text>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setPaletteOpen(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.addBtnText}>+ Add Block</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.canvas}
              contentContainerStyle={styles.canvasContent}
              showsVerticalScrollIndicator={false}
            >
              {blocks.length === 0 ? (
                <View style={styles.emptyCanvas}>
                  <Text style={styles.emptyEmoji}>🧩</Text>
                  <Text style={styles.emptyText}>Tap "+ Add Block" to start building</Text>
                </View>
              ) : (
                blocks.map((block, idx) => (
                  <CodeBlock
                    key={block.id}
                    {...block}
                    selected={selectedBlock === block.id}
                    onPress={() => handleBlockPress(block.id)}
                    onMoveUp={() => handleMoveUp(idx)}
                    onMoveDown={() => handleMoveDown(idx)}
                    onDelete={() => handleDelete(block.id)}
                    isFirst={idx === 0}
                    isLast={idx === blocks.length - 1}
                  />
                ))
              )}
              <View style={{ height: spacing.lg }} />
            </ScrollView>
          </View>

          {/* Run button */}
          <TouchableOpacity
            style={[styles.runBtn, running && styles.runBtnRunning]}
            onPress={handleRun}
            activeOpacity={0.85}
          >
            <Text style={styles.runBtnIcon}>{running ? '⏳' : '▶'}</Text>
            <Text style={styles.runBtnLabel}>{running ? 'Running…' : 'Run Program'}</Text>
          </TouchableOpacity>

          {/* Output panel */}
          <Animated.View style={[styles.outputPanel, { opacity: fadeAnim }]}>
            <View style={styles.outputHeader}>
              <View style={styles.outputDots}>
                <View style={[styles.osDot, { backgroundColor: colors.error }]} />
                <View style={[styles.osDot, { backgroundColor: colors.primaryContainer }]} />
                <View style={[styles.osDot, { backgroundColor: colors.success }]} />
              </View>
              <Text style={styles.outputTitle}>Output</Text>
              {ran && (
                <View style={styles.successBadge}>
                  <Text style={styles.successText}>✓ Done</Text>
                </View>
              )}
            </View>
            <ScrollView
              style={styles.outputScroll}
              contentContainerStyle={styles.outputContent}
              showsVerticalScrollIndicator={false}
            >
              {output.length === 0 ? (
                <Text style={styles.outputPlaceholder}>
                  {running ? '…' : '// Output will appear here'}
                </Text>
              ) : (
                output.map((line, i) => (
                  <OutputLine key={i} line={line} index={i} />
                ))
              )}
            </ScrollView>
          </Animated.View>

        </View>
      )}

      {/* ── Tab: Projects ───────────────────────────── */}
      {activeTab === 1 && (
        <ScrollView
          style={styles.projectsScroll}
          contentContainerStyle={styles.projectsContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.projectsHint}>
            Choose a starter project to load it into your workspace.
          </Text>
          {STARTER_PROJECTS.map((proj) => (
            <ProjectCard
              key={proj.id}
              project={proj}
              active={activeProject.id === proj.id}
              onPress={() => loadProject(proj)}
            />
          ))}
          <View style={{ height: spacing.xxxl }} />
        </ScrollView>
      )}

      {/* ── Block palette modal ─────────────────────── */}
      <Modal
        visible={paletteOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPaletteOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setPaletteOpen(false)}>
          <Pressable style={styles.palette} onPress={() => {}}>
            <View style={styles.paletteHandle} />
            <Text style={styles.paletteTitle}>Block Palette</Text>
            <Text style={styles.paletteHint}>Tap a block to add it to your program</Text>
            <FlatList
              data={PALETTE_BLOCKS}
              keyExtractor={(_, i) => String(i)}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xl }}
              renderItem={({ item }) => {
                const theme = BLOCK_COLORS[item.category];
                return (
                  <TouchableOpacity
                    style={[styles.paletteItem, { backgroundColor: theme.bg, borderColor: theme.border }]}
                    onPress={() => handleAddBlock(item)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.paletteItemIcon, { backgroundColor: theme.dot }]}>
                      <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                    </View>
                    <View style={styles.paletteItemText}>
                      <Text style={[styles.paletteItemLabel, { color: theme.text }]}>
                        {item.label}
                      </Text>
                      {item.value ? (
                        <Text style={[styles.paletteItemValue, { color: theme.text }]}>
                          {item.value}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={[styles.paletteAdd, { color: theme.text }]}>＋</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}

// ─── Output line with fade-in ─────────────────────────────

function OutputLine({ line, index }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.outputLine, { opacity: fadeAnim }]}>
      <Text style={styles.outputPrompt}>{`${index + 1} `}</Text>
      <Text style={styles.outputText}>{line}</Text>
    </Animated.View>
  );
}

// ─── Project card ─────────────────────────────────────────

function ProjectCard({ project, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.projectCard, active && styles.projectCardActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.projectCardTop}>
        <View style={styles.projectEmoji}>
          <Text style={{ fontSize: 28 }}>{project.emoji}</Text>
        </View>
        <View style={styles.projectInfo}>
          <View style={styles.projectTitleRow}>
            <Text style={styles.projectTitle}>{project.title}</Text>
            <View style={[styles.projectTag, { backgroundColor: project.tagColor }]}>
              <Text style={[styles.projectTagText, { color: project.tagText }]}>
                {project.tag}
              </Text>
            </View>
          </View>
          <Text style={styles.projectDesc}>{project.desc}</Text>
        </View>
      </View>

      {/* Block preview strip */}
      <View style={styles.blockPreview}>
        {project.blocks.slice(0, 4).map((b, i) => {
          const theme = BLOCK_COLORS[b.category];
          return (
            <View
              key={i}
              style={[styles.blockChip, { backgroundColor: theme.bg, borderColor: theme.border }]}
            >
              <Text style={{ fontSize: 11 }}>{b.icon}</Text>
              <Text style={[styles.blockChipLabel, { color: theme.text }]}>{b.label}</Text>
            </View>
          );
        })}
        {project.blocks.length > 4 && (
          <View style={styles.blockChipMore}>
            <Text style={styles.blockChipMoreText}>+{project.blocks.length - 4}</Text>
          </View>
        )}
      </View>

      <View style={styles.projectCardFooter}>
        <Text style={styles.projectBlockCount}>
          {project.blocks.length} blocks
        </Text>
        <View style={[styles.loadBtn, active && styles.loadBtnActive]}>
          <Text style={[styles.loadBtnText, active && styles.loadBtnTextActive]}>
            {active ? '✓ Loaded' : 'Load →'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenMarginMobile,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    backgroundColor: colors.background,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 18, color: colors.onSurface },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.titleSm,
    fontSize: 15,
    color: colors.onSurface,
  },
  headerSub: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: '400',
    textTransform: 'none',
    letterSpacing: 0,
  },
  helpBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpIcon: {
    ...typography.titleSm,
    fontSize: 15,
    color: colors.secondary,
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenMarginMobile,
    paddingTop: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  tab: {
    paddingBottom: spacing.sm,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primaryContainer,
  },
  tabLabel: {
    ...typography.labelCaps,
    fontSize: 12,
    color: colors.textDisabled,
  },
  tabLabelActive: {
    color: colors.primary,
  },

  // Workspace
  workspace: {
    flex: 1,
    paddingHorizontal: spacing.screenMarginMobile,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },

  // Canvas
  canvasWrap: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    overflow: 'hidden',
    ...shadows.card,
  },
  canvasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
    backgroundColor: colors.surfaceContainerLow,
  },
  canvasTitle: {
    ...typography.titleSm,
    fontSize: 13,
    color: colors.onSurface,
  },
  addBtn: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  addBtnText: {
    ...typography.labelCaps,
    fontSize: 10,
    color: colors.onPrimaryContainer,
  },
  canvas: {
    flex: 1,
  },
  canvasContent: {
    padding: spacing.md,
    gap: 0,
  },
  emptyCanvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyEmoji: { fontSize: 36 },
  emptyText: {
    ...typography.bodyMd,
    fontSize: 13,
    color: colors.textDisabled,
    textAlign: 'center',
  },

  // Run button
  runBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
    ...shadows.card,
  },
  runBtnRunning: {
    backgroundColor: colors.outline,
  },
  runBtnIcon: {
    fontSize: 16,
  },
  runBtnLabel: {
    ...typography.button,
    color: colors.onSecondary,
  },

  // Output panel
  outputPanel: {
    height: SCREEN_H * 0.2,
    backgroundColor: colors.inverseSurface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  outputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    gap: spacing.sm,
  },
  outputDots: {
    flexDirection: 'row',
    gap: 5,
  },
  osDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    opacity: 0.8,
  },
  outputTitle: {
    ...typography.labelCaps,
    fontSize: 10,
    color: colors.inverseOnSurface,
    flex: 1,
  },
  successBadge: {
    backgroundColor: colors.successContainer,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  successText: {
    ...typography.labelCaps,
    fontSize: 9,
    color: colors.onSuccessContainer,
  },
  outputScroll: {
    flex: 1,
  },
  outputContent: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  outputPlaceholder: {
    ...typography.bodyMd,
    fontSize: 12,
    color: colors.surfaceDim,
    fontStyle: 'italic',
  },
  outputLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  outputPrompt: {
    ...typography.caption,
    fontSize: 11,
    color: colors.outline,
    fontWeight: '400',
    textTransform: 'none',
    letterSpacing: 0,
    minWidth: 16,
  },
  outputText: {
    ...typography.bodyMd,
    fontSize: 13,
    color: colors.primaryFixed,
    fontWeight: '600',
  },

  // Projects tab
  projectsScroll: {
    flex: 1,
  },
  projectsContent: {
    padding: spacing.screenMarginMobile,
    gap: spacing.md,
  },
  projectsHint: {
    ...typography.bodyMd,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  projectCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    gap: spacing.md,
    ...shadows.card,
  },
  projectCardActive: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondaryFixed,
  },
  projectCardTop: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  projectEmoji: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  projectInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  projectTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  projectTitle: {
    ...typography.titleSm,
    fontSize: 15,
    color: colors.onSurface,
  },
  projectTag: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  projectTagText: {
    ...typography.labelCaps,
    fontSize: 9,
  },
  projectDesc: {
    ...typography.bodyMd,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  blockPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  blockChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  blockChipLabel: {
    ...typography.labelCaps,
    fontSize: 9,
  },
  blockChipMore: {
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    justifyContent: 'center',
  },
  blockChipMoreText: {
    ...typography.labelCaps,
    fontSize: 9,
    color: colors.textSecondary,
  },
  projectCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    paddingTop: spacing.sm,
  },
  projectBlockCount: {
    ...typography.caption,
    color: colors.textDisabled,
    fontWeight: '400',
    textTransform: 'none',
    letterSpacing: 0,
  },
  loadBtn: {
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  loadBtnActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  loadBtnText: {
    ...typography.labelCaps,
    fontSize: 10,
    color: colors.secondary,
  },
  loadBtnTextActive: {
    color: colors.onSecondary,
  },

  // Palette modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(27,28,26,0.5)',
    justifyContent: 'flex-end',
  },
  palette: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.screenMarginMobile,
    maxHeight: SCREEN_H * 0.65,
    ...shadows.modal,
  },
  paletteHandle: {
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.outlineVariant,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  paletteTitle: {
    ...typography.titleSm,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  paletteHint: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '400',
    textTransform: 'none',
    letterSpacing: 0,
    marginBottom: spacing.md,
  },
  paletteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1.5,
    overflow: 'hidden',
    minHeight: 52,
  },
  paletteItemIcon: {
    width: 48,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paletteItemText: {
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  paletteItemLabel: {
    ...typography.labelCaps,
    fontSize: 10,
  },
  paletteItemValue: {
    ...typography.bodyMd,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  paletteAdd: {
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: spacing.md,
  },
});