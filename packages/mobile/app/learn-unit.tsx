/**
 * Learn Unit Screen
 * Shows levels within a unit. Each level expands to show its 5 lessons.
 * Grammar detour banner appears at the right moment mid-level.
 */
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  CheckCircle2,
  Star,
  Lock,
  PlayCircle,
  Zap,
  ChevronDown,
  ChevronRight,
} from "lucide-react-native";
import { useTheme } from "../lib/theme";
import {
  UNIT_MAP,
  type SyllabusUnit,
  type SyllabusLevel,
  type SyllabusLesson,
  type LessonType,
} from "../lib/syllabusData";
import {
  loadProgress,
  isLevelUnlocked,
  isLessonUnlocked,
  getLessonProgress,
  getLevelCompletionPercent,
  getUnitCompletionPercent,
  isGrammarDetourRequired,
  isGrammarTopicCompleted,
  type SyllabusProgress,
} from "../lib/syllabusProgress";

// ─── Lesson type config ───────────────────────────────────────────────────────

const LESSON_CONFIG: Record<LessonType, { label: string; color: string; emoji: string; desc: string }> = {
  intro:     { label: "Intro",     color: "#1CB0F6", emoji: "📖", desc: "Learn with hints & examples" },
  practice:  { label: "Practice",  color: "#58CC02", emoji: "✏️",  desc: "Answer questions, medium pace" },
  challenge: { label: "Challenge", color: "#FF9600", emoji: "💪", desc: "Harder — no hints this time" },
  tricky:    { label: "Tricky",    color: "#CE82FF", emoji: "🧩", desc: "Watch out for misleading options" },
  exam:      { label: "Exam",      color: "#FF4B4B", emoji: "🎯", desc: "Final test — prove you know it" },
};

// ─── Grammar Detour Banner ────────────────────────────────────────────────────

function GrammarDetourBanner({
  topicId,
  topicTitle,
  completed,
  onPress,
}: {
  topicId: string;
  topicTitle: string;
  completed: boolean;
  onPress: () => void;
}) {
  const { theme: t } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        detour.wrap,
        {
          backgroundColor: completed ? "#22C55E12" : "#A560E812",
          borderColor: completed ? "#22C55E44" : "#A560E844",
        },
      ]}
    >
      <View style={[detour.iconBox, { backgroundColor: completed ? "#22C55E22" : "#A560E822" }]}>
        {completed
          ? <CheckCircle2 size={26} color="#22C55E" strokeWidth={2.5} />
          : <Zap size={26} color="#A560E8" strokeWidth={2.5} />
        }
      </View>
      <View style={detour.body}>
        <Text style={[detour.tag, { color: completed ? "#22C55E" : "#A560E8" }]}>
          {completed ? "Grammar Complete ✓" : "⚡ Grammar Detour"}
        </Text>
        <Text style={[detour.title, { color: t.text }]}>{topicTitle}</Text>
        <Text style={[detour.sub, { color: t.textMuted }]}>
          {completed
            ? "You've mastered this. Back on track!"
            : "Complete this grammar topic, then come back to continue →"}
        </Text>
      </View>
      {!completed && <ChevronRight size={18} color="#A560E8" strokeWidth={2.5} />}
    </TouchableOpacity>
  );
}

const detour = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    marginVertical: 6,
  },
  iconBox: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  body: { flex: 1, gap: 2 },
  tag: { fontSize: 10, fontWeight: "900", letterSpacing: 0.6 },
  title: { fontSize: 14, fontWeight: "900" },
  sub: { fontSize: 11, fontWeight: "500" },
});

// ─── Lesson Row ────────────────────────────────────────────────────────────────

function LessonRow({
  lesson,
  unitColor,
  unlocked,
  lessonProg,
  onPress,
}: {
  lesson: SyllabusLesson;
  unitColor: string;
  unlocked: boolean;
  lessonProg: ReturnType<typeof getLessonProgress>;
  onPress: () => void;
}) {
  const { theme: t } = useTheme();
  const cfg = LESSON_CONFIG[lesson.type];

  return (
    <TouchableOpacity
      onPress={unlocked ? onPress : undefined}
      activeOpacity={unlocked ? 0.8 : 1}
      style={[
        lrow.container,
        {
          backgroundColor: t.surface,
          borderColor: lessonProg.completed ? cfg.color + "55" : t.border,
          opacity: unlocked ? 1 : 0.45,
        },
      ]}
    >
      <View style={[lrow.iconBox, { backgroundColor: cfg.color + "20" }]}>
        {lessonProg.completed
          ? <CheckCircle2 size={20} color={cfg.color} strokeWidth={2.5} />
          : !unlocked
          ? <Lock size={18} color={t.textMuted} strokeWidth={2.5} />
          : <Text style={{ fontSize: 18 }}>{cfg.emoji}</Text>
        }
      </View>
      <View style={lrow.body}>
        <View style={lrow.titleRow}>
          <Text style={[lrow.type, { color: cfg.color }]}>{cfg.label}</Text>
          <Text style={[lrow.qcount, { color: t.textMuted }]}>15 questions</Text>
        </View>
        <Text style={[lrow.desc, { color: t.textMuted }]}>{cfg.desc}</Text>
        {lessonProg.completed && lessonProg.stars > 0 && (
          <View style={lrow.starsRow}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                color="#FFD700"
                fill={i < lessonProg.stars ? "#FFD700" : "transparent"}
                strokeWidth={2}
              />
            ))}
            <Text style={[lrow.score, { color: t.textMuted }]}>{lessonProg.bestScore}/15</Text>
          </View>
        )}
      </View>
      {unlocked && !lessonProg.completed && (
        <PlayCircle size={20} color={cfg.color} strokeWidth={2} />
      )}
    </TouchableOpacity>
  );
}

const lrow = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    gap: 12,
    marginBottom: 8,
  },
  iconBox: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  body: { flex: 1, gap: 2 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  type: { fontSize: 14, fontWeight: "900" },
  qcount: { fontSize: 11, fontWeight: "600" },
  desc: { fontSize: 12, fontWeight: "500" },
  starsRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4 },
  score: { fontSize: 11, fontWeight: "600", marginLeft: 4 },
});

// ─── Level Card ────────────────────────────────────────────────────────────────

function LevelCard({
  level,
  unit,
  progress,
  expanded,
  onToggle,
  onLessonPress,
  onGrammarPress,
}: {
  level: SyllabusLevel;
  unit: SyllabusUnit;
  progress: SyllabusProgress;
  expanded: boolean;
  onToggle: () => void;
  onLessonPress: (lessonId: string) => void;
  onGrammarPress: (topicId: string) => void;
}) {
  const { theme: t } = useTheme();
  const unlocked = isLevelUnlocked(level.levelId, progress);
  const completed = progress.completedLevelIds.includes(level.levelId);
  const pct = getLevelCompletionPercent(level.levelId, progress);

  return (
    <View style={[lcard.wrap, { borderColor: completed ? unit.color + "55" : t.border }]}>
      {/* Level header — tap to expand */}
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={unlocked ? 0.8 : 0.6}
        style={[lcard.header, { backgroundColor: completed ? unit.color + "15" : unlocked ? t.surface : t.surfaceAlt }]}
      >
        <View style={[lcard.numBox, { backgroundColor: completed ? unit.color : unlocked ? unit.color + "22" : t.border }]}>
          {completed
            ? <CheckCircle2 size={18} color="#fff" strokeWidth={2.5} />
            : !unlocked
            ? <Lock size={16} color={t.textMuted} strokeWidth={2.5} />
            : <Text style={[lcard.numText, { color: unit.color }]}>{level.levelNumber}</Text>
          }
        </View>
        <View style={lcard.headerBody}>
          <Text style={[lcard.title, { color: unlocked ? t.text : t.textMuted }]}>{level.title}</Text>
          <Text style={[lcard.desc, { color: t.textMuted }]} numberOfLines={expanded ? 2 : 1}>
            {level.description}
          </Text>
          {unlocked && !completed && pct > 0 && (
            <View style={[lcard.barBg, { backgroundColor: t.border }]}>
              <View style={[lcard.barFill, { width: `${pct}%` as any, backgroundColor: unit.color }]} />
            </View>
          )}
        </View>
        <View style={lcard.headerRight}>
          {unlocked && !completed && (
            <View style={[lcard.pctBadge, { backgroundColor: unit.color + "22" }]}>
              <Text style={[lcard.pctText, { color: unit.color }]}>{pct}%</Text>
            </View>
          )}
          {unlocked && (
            expanded
              ? <ChevronDown size={18} color={t.textMuted} strokeWidth={2.5} />
              : <ChevronRight size={18} color={t.textMuted} strokeWidth={2.5} />
          )}
        </View>
      </TouchableOpacity>

      {/* Expanded lesson list */}
      {expanded && unlocked && (
        <View style={lcard.lessons}>
          {level.lessons.map((lesson, idx) => {
            const lessonProg = getLessonProgress(lesson.lessonId, progress);
            const lessonUnlocked = isLessonUnlocked(lesson.lessonId, progress);

            // Grammar detour: show after lesson at detour index if lesson is completed
            const showDetour =
              level.grammarDetour &&
              idx === level.grammarDetour.afterLessonIndex &&
              lessonProg.completed;

            return (
              <React.Fragment key={lesson.lessonId}>
                <LessonRow
                  lesson={lesson}
                  unitColor={unit.color}
                  unlocked={lessonUnlocked}
                  lessonProg={lessonProg}
                  onPress={() => onLessonPress(lesson.lessonId)}
                />
                {showDetour && level.grammarDetour && (
                  <GrammarDetourBanner
                    topicId={level.grammarDetour.topicId}
                    topicTitle={level.grammarDetour.topicTitle}
                    completed={isGrammarTopicCompleted(level.grammarDetour.topicId, progress)}
                    onPress={() => onGrammarPress(level.grammarDetour!.topicId)}
                  />
                )}
              </React.Fragment>
            );
          })}
        </View>
      )}
    </View>
  );
}

const lcard = StyleSheet.create({
  wrap: { borderRadius: 18, borderWidth: 1.5, marginBottom: 12, overflow: "hidden" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  numBox: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  numText: { fontSize: 16, fontWeight: "900" },
  headerBody: { flex: 1, gap: 3 },
  title: { fontSize: 15, fontWeight: "900" },
  desc: { fontSize: 12, fontWeight: "500" },
  barBg: { height: 4, borderRadius: 2, overflow: "hidden", marginTop: 6 },
  barFill: { height: "100%", borderRadius: 2 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  pctBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  pctText: { fontSize: 12, fontWeight: "800" },
  lessons: { padding: 12, paddingTop: 4, gap: 0 },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function LearnUnitScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const { unitId, openLevelId } = useLocalSearchParams<{ unitId: string; openLevelId: string }>();
  const unit: SyllabusUnit | undefined = UNIT_MAP[unitId ?? ""];

  const [progress, setProgress] = useState<SyllabusProgress>({
    lessons: {},
    completedLessonIds: [],
    completedLevelIds: [],
    completedUnitIds: [],
    completedGrammarTopicIds: [],
    currentLessonId: null,
    learnedWordIds: [],
    xp: 0,
    streak: 0,
    lastStreakDate: null,
  });

  // Which level is expanded — prefer openLevelId param, else first unlocked incomplete
  const [expandedLevelId, setExpandedLevelId] = useState<string | null>(openLevelId ?? null);

  const reload = useCallback(async () => {
    const p = await loadProgress();
    setProgress(p);
    // Auto-expand first incomplete level
    if (unit) {
      const active = unit.levels.find(
        (lv) => !p.completedLevelIds.includes(lv.levelId)
      );
      setExpandedLevelId(active?.levelId ?? unit.levels[unit.levels.length - 1]?.levelId ?? null);
    }
  }, [unit]);

  useEffect(() => { reload(); }, [reload]);

  if (!unit) {
    return (
      <SafeAreaView style={[screen.safe, { backgroundColor: t.background }]}>
        <Text style={{ color: t.text, padding: 20 }}>Unit not found</Text>
      </SafeAreaView>
    );
  }

  const pct = getUnitCompletionPercent(unit.unitId, progress);
  const isCompleted = progress.completedUnitIds.includes(unit.unitId);

  const handleLessonPress = (lessonId: string) => {
    router.push({
      pathname: "/learn-lesson",
      params: { lessonId, isSyllabus: "1" },
    });
  };

  const handleGrammarPress = (topicId: string) => {
    router.push({ pathname: "/grammar", params: { topicId } });
  };

  const toggleLevel = (levelId: string) => {
    setExpandedLevelId((cur) => (cur === levelId ? null : levelId));
  };

  return (
    <SafeAreaView style={[screen.safe, { backgroundColor: t.background }]}>
      <StatusBar barStyle={"dark-content" as any} backgroundColor={t.background} />

      {/* Header */}
      <View style={[screen.header, { backgroundColor: t.surface, borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={screen.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={24} color={t.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={screen.headerCenter}>
          <Text style={screen.headerEmoji}>{unit.icon}</Text>
          <Text style={[screen.headerTitle, { color: t.text }]}>{unit.title}</Text>
          {isCompleted && <CheckCircle2 size={20} color="#22C55E" strokeWidth={2.5} />}
        </View>
        <View style={[screen.xpBadge, { backgroundColor: unit.color + "22" }]}>
          <Star size={13} color={unit.color} strokeWidth={2.5} fill={unit.color} />
          <Text style={[screen.xpText, { color: unit.color }]}>{unit.xpReward}</Text>
        </View>
      </View>

      {/* Unit summary */}
      <View style={[screen.summary, { backgroundColor: unit.color + "0D", borderBottomColor: t.border }]}>
        <Text style={[screen.summaryTitle, { color: t.text }]}>{unit.subtitle}</Text>
        {unit.tip && (
          <Text style={[screen.tip, { color: t.textMuted }]}>💡 {unit.tip}</Text>
        )}
        {/* Overall unit progress bar */}
        <View style={[screen.barBg, { backgroundColor: t.border }]}>
          <View style={[screen.barFill, { width: `${pct}%` as any, backgroundColor: unit.color }]} />
        </View>
        <Text style={[screen.barLabel, { color: t.textMuted }]}>
          Unit progress: {pct}% · {unit.levels.length} levels · {unit.levels.length * 5} lessons
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={screen.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[screen.sectionLabel, { color: t.textMuted }]}>LEVELS</Text>

        {unit.levels.map((level) => (
          <LevelCard
            key={level.levelId}
            level={level}
            unit={unit}
            progress={progress}
            expanded={expandedLevelId === level.levelId}
            onToggle={() => toggleLevel(level.levelId)}
            onLessonPress={handleLessonPress}
            onGrammarPress={handleGrammarPress}
          />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const screen = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  headerEmoji: { fontSize: 22 },
  headerTitle: { fontSize: 22, fontWeight: "900" },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  xpText: { fontSize: 12, fontWeight: "800" },
  summary: {
    padding: 16,
    gap: 6,
    borderBottomWidth: 1,
  },
  summaryTitle: { fontSize: 14, fontWeight: "700" },
  tip: { fontSize: 12, fontStyle: "italic" },
  barBg: { height: 6, borderRadius: 3, overflow: "hidden", marginTop: 6 },
  barFill: { height: "100%", borderRadius: 3 },
  barLabel: { fontSize: 11, fontWeight: "600" },
  scrollContent: { padding: 16, paddingBottom: 50 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
});
