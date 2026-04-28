import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button }     from '../../components/Button';
import { InputField } from '../../components/InputField';
import { Chip }       from '../../components/Chip';
import { colors }     from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing }    from '../../theme/spacing';
import { radius }     from '../../theme/radius';
import { shadows }    from '../../theme/shadows';
import useProfileStore from '../../store/useProfileStore';

// ─── Data ─────────────────────────────────────────────────

const AVATARS = [
  { key: 'owl',     emoji: '🦉', label: 'Owl' },
  { key: 'rocket',  emoji: '🚀', label: 'Rocket' },
  { key: 'plant',   emoji: '🌱', label: 'Sprout' },
  { key: 'star',    emoji: '⭐', label: 'Star' },
  { key: 'book',    emoji: '📚', label: 'Books' },
  { key: 'lamp',    emoji: '💡', label: 'Idea' },
  { key: 'palette', emoji: '🎨', label: 'Art' },
  { key: 'atom',    emoji: '⚛️',  label: 'Atom' },
];

const GRADES = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `Grade ${i + 1}`,
  sub:   i < 5 ? 'Primary' : i < 8 ? 'Middle School' : 'High School',
}));

const LANGUAGES = [
  { key: 'english',   label: 'English'   },
  { key: 'hindi',     label: 'Hindi'     },
  { key: 'tamil',     label: 'தமிழ்'     },
  { key: 'telugu',    label: 'తెలుగు'    },
  { key: 'kannada',   label: 'ಕನ್ನಡ'     },
  { key: 'malayalam', label: 'മലയാളം'    },
  { key: 'marathi',   label: 'मराठी'     },
  { key: 'bengali',   label: 'বাংলা'     },
];

const INTERESTS = [
  { key: 'maths',    label: '🔢 Maths',    accent: 'saffron' },
  { key: 'science',  label: '🔬 Science',  accent: 'teal'    },
  { key: 'history',  label: '🏛️ History',  accent: 'clay'    },
  { key: 'english',  label: '📖 English',  accent: 'saffron' },
  { key: 'coding',   label: '💻 Coding',   accent: 'teal'    },
  { key: 'art',      label: '🎨 Art',      accent: 'clay'    },
  { key: 'music',    label: '🎵 Music',    accent: 'saffron' },
  { key: 'sports',   label: '⚽ Sports',   accent: 'teal'    },
  { key: 'geo',      label: '🌍 Geography',accent: 'clay'    },
  { key: 'bio',      label: '🧬 Biology',  accent: 'saffron' },
  { key: 'physics',  label: '⚡ Physics',  accent: 'teal'    },
  { key: 'chem',     label: '🧪 Chemistry',accent: 'clay'    },
];

// ─── Step config ───────────────────────────────────────────
const STEPS = ['avatar', 'basics', 'language', 'interests'];
const STEP_LABELS = ['Pick Avatar', 'Your Info', 'Language', 'Interests'];

// ─── Main screen ──────────────────────────────────────────

export default function ProfileSetupScreen({ navigation }) {
  const [step, setStep]             = useState(0);
  const [gradeModal, setGradeModal] = useState(false);
  const [nameError, setNameError]   = useState('');

  const {
    name, avatar, grade, language, interests,
    setName, setAvatar, setGrade, setLanguage, toggleInterest,
  } = useProfileStore();

  // ── Step navigation ────────────────────────────────────
  const canAdvance = useCallback(() => {
    if (step === 0) return Boolean(avatar);
    if (step === 1) return name.trim().length > 0 && Boolean(grade);
    if (step === 2) return Boolean(language);
    if (step === 3) return interests.length > 0;
    return true;
  }, [step, avatar, name, grade, language, interests]);

  const handleNext = () => {
    if (step === 1 && !name.trim()) {
      setNameError('Please enter your name');
      return;
    }
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'MainApp' }] });
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  // ── Progress bar ───────────────────────────────────────
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ── Top chrome ──────────────────────────── */}
        <View style={styles.chrome}>
          <View style={styles.chromeRow}>
            {step > 0 ? (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={handleBack}
                hitSlop={8}
                activeOpacity={0.7}
              >
                <Text style={styles.backIcon}>←</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.backBtn} />
            )}

            {/* Step pills */}
            <View style={styles.stepPills}>
              {STEPS.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.pill,
                    i === step && styles.pillActive,
                    i < step  && styles.pillDone,
                  ]}
                />
              ))}
            </View>

            <View style={{ width: 40 }} />
          </View>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Step header ─────────────────────────── */}
          <View style={styles.stepHeader}>
            <Text style={styles.stepTag}>{`Step ${step + 1} of ${STEPS.length}`}</Text>
            <Text style={styles.stepTitle}>{STEP_LABELS[step]}</Text>
          </View>

          {/* ── Step content ────────────────────────── */}
          {step === 0 && (
            <AvatarStep
              selected={avatar}
              onSelect={setAvatar}
            />
          )}

          {step === 1 && (
            <BasicsStep
              name={name}
              nameError={nameError}
              onChangeName={(t) => { setName(t); setNameError(''); }}
              grade={grade}
              onOpenGrade={() => setGradeModal(true)}
            />
          )}

          {step === 2 && (
            <LanguageStep
              selected={language}
              onSelect={setLanguage}
            />
          )}

          {step === 3 && (
            <InterestsStep
              selected={interests}
              onToggle={toggleInterest}
            />
          )}

          {/* Spacer so CTA doesn't overlap content */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* ── Sticky CTA ──────────────────────────── */}
        <View style={styles.ctaContainer}>
          <Button
            label={step === STEPS.length - 1 ? "Let's Go! 🚀" : 'Continue'}
            variant={canAdvance() ? 'primary' : 'secondary'}
            fullWidth
            onPress={handleNext}
            disabled={!canAdvance()}
          />
        </View>
      </KeyboardAvoidingView>

      {/* ── Grade modal ─────────────────────────── */}
      <GradeModal
        visible={gradeModal}
        selected={grade}
        onSelect={(g) => { setGrade(g); setGradeModal(false); }}
        onClose={() => setGradeModal(false)}
      />
    </SafeAreaView>
  );
}

// ─── Step 0: Avatar ───────────────────────────────────────

function AvatarStep({ selected, onSelect }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHint}>
        Choose a character that represents you ✨
      </Text>

      {/* Large preview */}
      <View style={styles.avatarPreview}>
        <View style={[styles.avatarPreviewCircle, selected && styles.avatarPreviewCircleActive]}>
          <Text style={styles.avatarPreviewEmoji}>
            {selected ? AVATARS.find(a => a.key === selected)?.emoji : '?'}
          </Text>
        </View>
        {selected && (
          <Text style={styles.avatarPreviewLabel}>
            {AVATARS.find(a => a.key === selected)?.label}
          </Text>
        )}
      </View>

      {/* Grid */}
      <View style={styles.avatarGrid}>
        {AVATARS.map((av) => (
          <TouchableOpacity
            key={av.key}
            style={[styles.avatarTile, selected === av.key && styles.avatarTileSelected]}
            onPress={() => onSelect(av.key)}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarEmoji}>{av.emoji}</Text>
            <Text style={[
              styles.avatarTileLabel,
              selected === av.key && styles.avatarTileLabelSelected,
            ]}>
              {av.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Step 1: Basics ───────────────────────────────────────

function BasicsStep({ name, nameError, onChangeName, grade, onOpenGrade }) {
  const gradeObj = grade ? GRADES[grade - 1] : null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHint}>
        Tell us a bit about yourself 👋
      </Text>

      <InputField
        label="Your Name"
        placeholder="e.g. Priya Sharma"
        value={name}
        onChangeText={onChangeName}
        autoCapitalize="words"
        autoComplete="name"
        error={nameError}
      />

      <View style={{ height: spacing.md }} />

      {/* Grade picker trigger */}
      <Text style={styles.gradeLabel}>GRADE / CLASS</Text>
      <TouchableOpacity
        style={[styles.gradeTrigger, gradeObj && styles.gradeTriggerFilled]}
        onPress={onOpenGrade}
        activeOpacity={0.8}
      >
        {gradeObj ? (
          <View style={styles.gradeTriggerContent}>
            <View>
              <Text style={styles.gradeTriggerValue}>{gradeObj.label}</Text>
              <Text style={styles.gradeTriggerSub}>{gradeObj.sub}</Text>
            </View>
            <Text style={styles.gradeTriggerChevron}>▼</Text>
          </View>
        ) : (
          <View style={styles.gradeTriggerContent}>
            <Text style={styles.gradeTriggerPlaceholder}>Select your grade…</Text>
            <Text style={styles.gradeTriggerChevron}>▼</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Step 2: Language ─────────────────────────────────────

function LanguageStep({ selected, onSelect }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHint}>
        Choose your preferred learning language 🌐
      </Text>
      <View style={styles.chipGrid}>
        {LANGUAGES.map((lang) => (
          <Chip
            key={lang.key}
            label={lang.label}
            selected={selected === lang.key}
            accent="teal"
            onPress={() => onSelect(lang.key)}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Step 3: Interests ────────────────────────────────────

function InterestsStep({ selected, onToggle }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHint}>
        Pick subjects you love — choose as many as you like 💡
      </Text>

      {selected.length > 0 && (
        <View style={styles.selectionBadge}>
          <Text style={styles.selectionBadgeText}>
            {selected.length} selected
          </Text>
        </View>
      )}

      <View style={styles.chipGrid}>
        {INTERESTS.map((item) => (
          <Chip
            key={item.key}
            label={item.label}
            selected={selected.includes(item.key)}
            accent={item.accent}
            onPress={() => onToggle(item.key)}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Grade modal ──────────────────────────────────────────

function GradeModal({ visible, selected, onSelect, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={modalStyles.overlay} onPress={onClose}>
        <Pressable style={modalStyles.sheet} onPress={() => {}}>
          {/* Handle */}
          <View style={modalStyles.handle} />

          <Text style={modalStyles.title}>Select Grade</Text>

          <FlatList
            data={GRADES}
            keyExtractor={(item) => String(item.value)}
            showsVerticalScrollIndicator={false}
            style={modalStyles.list}
            ItemSeparatorComponent={() => <View style={modalStyles.separator} />}
            renderItem={({ item }) => {
              const isSelected = selected === item.value;
              return (
                <TouchableOpacity
                  style={[modalStyles.gradeRow, isSelected && modalStyles.gradeRowSelected]}
                  onPress={() => onSelect(item.value)}
                  activeOpacity={0.7}
                >
                  <View style={[modalStyles.gradeNumber, isSelected && modalStyles.gradeNumberSelected]}>
                    <Text style={[modalStyles.gradeNum, isSelected && modalStyles.gradeNumSelected]}>
                      {item.value}
                    </Text>
                  </View>
                  <View style={modalStyles.gradeInfo}>
                    <Text style={[modalStyles.gradeLabel, isSelected && modalStyles.gradeLabelSelected]}>
                      {item.label}
                    </Text>
                    <Text style={modalStyles.gradeSub}>{item.sub}</Text>
                  </View>
                  {isSelected && (
                    <Text style={modalStyles.checkIcon}>✓</Text>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenMarginMobile,
    paddingTop: spacing.md,
  },

  // Chrome
  chrome: {
    paddingHorizontal: spacing.screenMarginMobile,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  chromeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  backBtn: {
    width: spacing.xxl,
    height: spacing.xxl,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  stepPills: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  pill: {
    width: spacing.lgXl,
    height: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerHighest,
  },
  pillActive: {
    backgroundColor: colors.primaryContainer,
    width: spacing.xxl,
  },
  pillDone: {
    backgroundColor: colors.secondary,
  },
  progressTrack: {
    height: spacing.xs,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: spacing.xs,
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.full,
  },

  // Step header
  stepHeader: {
    marginBottom: spacing.lg,
  },
  stepTag: {
    ...typography.labelCaps,
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  stepTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },

  // Section
  section: {
    gap: spacing.sm,
  },
  sectionHint: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },

  // Avatar step
  avatarPreview: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarPreviewCircle: {
    width: spacing.huge,
    height: spacing.huge,
    borderRadius: spacing.huge / 2,
    backgroundColor: colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.outlineVariant,
    borderStyle: 'dashed',
  },
  avatarPreviewCircleActive: {
    backgroundColor: colors.primaryFixed,
    borderColor: colors.primaryContainer,
    borderStyle: 'solid',
    ...shadows.card,
  },
  avatarPreviewEmoji: {
    ...typography.displayLg,
  },
  avatarPreviewLabel: {
    ...typography.labelCaps,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  avatarTile: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    gap: spacing.xs,
  },
  avatarTileSelected: {
    backgroundColor: colors.primaryFixed,
    borderColor: colors.primaryContainer,
    ...shadows.card,
  },
  avatarEmoji: {
    ...typography.headlineMd,
  },
  avatarTileLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    textTransform: 'none',
    letterSpacing: 0,
    fontWeight: '400',
  },
  avatarTileLabelSelected: {
    color: colors.primary,
    fontWeight: '700',
  },

  // Basics step — grade
  gradeLabel: {
    ...typography.labelCaps,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  gradeTrigger: {
    height: spacing.touchTargetLg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  gradeTriggerFilled: {
    borderColor: colors.secondary,
    backgroundColor: colors.surfaceContainerLowest,
  },
  gradeTriggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gradeTriggerPlaceholder: {
    ...typography.bodyMd,
    color: colors.textDisabled,
  },
  gradeTriggerValue: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: '600',
  },
  gradeTriggerSub: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'none',
    letterSpacing: 0,
    fontWeight: '400',
    marginTop: 1,
  },
  gradeTriggerChevron: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  // Chips
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  // Selection badge
  selectionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondaryContainer,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  selectionBadgeText: {
    ...typography.labelCaps,
    color: colors.onSecondaryContainer,
  },

  // CTA
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    paddingHorizontal: spacing.screenMarginMobile,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(27,28,26,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.screenMarginMobile,
    paddingBottom: spacing.xxl,
    maxHeight: '75%',
    ...shadows.modal,
  },
  handle: {
    width: spacing.xxl,
    height: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.outlineVariant,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.titleSm,
    color: colors.onSurface,
    marginBottom: spacing.md,
  },
  list: {
    flexGrow: 0,
  },
  separator: {
    height: 1,
    backgroundColor: colors.surfaceContainerLow,
  },
  gradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
  },
  gradeRowSelected: {
    backgroundColor: colors.primaryFixed,
  },
  gradeNumber: {
    width: spacing.xxl,
    height: spacing.xxl,
    borderRadius: spacing.mdLg,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeNumberSelected: {
    backgroundColor: colors.primaryContainer,
  },
  gradeNum: {
    ...typography.titleSm,
    color: colors.onSurface,
  },
  gradeNumSelected: {
    color: colors.onPrimaryContainer,
  },
  gradeInfo: {
    flex: 1,
  },
  gradeLabel: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: '600',
  },
  gradeLabelSelected: {
    color: colors.primary,
  },
  gradeSub: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'none',
    letterSpacing: 0,
    fontWeight: '400',
    marginTop: 2,
  },
  checkIcon: {
    ...typography.bodyMd,
    color: colors.primary,
    fontWeight: '700',
  },
});