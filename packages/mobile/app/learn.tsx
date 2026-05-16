/**
 * Learn Screen — single continuous path
 * Units = plain section headers (text only)
 * Levels = round step nodes (tap → learn-unit with that level pre-expanded)
 */
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { GraduationCap, Flame, Star, Lock, CheckCircle2 } from "lucide-react-native";
import { useTheme } from "../lib/theme";
import { ModeBadge } from "../lib/ModeSwitcher";
import { SYLLABUS_UNITS, ALL_LEVELS, type SyllabusLevel, type SyllabusUnit } from "../lib/syllabusData";
import {
  loadProgress,
  isLevelUnlocked,
  isLessonUnlocked,
  getLevelCompletionPercent,
  getOverallPercent,
  type SyllabusProgress,
} from "../lib/syllabusProgress";

const { width: SCREEN_W } = Dimensions.get("window");

// Zigzag positions for level nodes
const ZIGZAG: Array<"left" | "center" | "right"> = [
  "center", "left", "center", "right",
  "center", "left", "center", "right",
];

// ─── Unit Section Header ──────────────────────────────────────────────────────

function UnitHeader({ unit, index }: { unit: SyllabusUnit; index: number }) {
  const { theme: t } = useTheme();
  return (
    <View style={[uHead.wrap, { borderColor: unit.color + "44", backgroundColor: unit.color + "0e" }]}>
      <Text style={[uHead.icon]}>{unit.icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[uHead.label, { color: t.textMuted }]}>
          UNIT {index + 1}
        </Text>
        <Text style={[uHead.title, { color: t.text }]}>{unit.title}</Text>
        <Text style={[uHead.sub, { color: t.textMuted }]}>{unit.subtitle}</Text>
      </View>
    </View>
  );
}

const uHead = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 4,
  },
  icon: { fontSize: 28 },
  label: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2, marginBottom: 1 },
  title: { fontSize: 16, fontWeight: "900" },
  sub: { fontSize: 12, fontWeight: "500", marginTop: 1 },
});

// ─── Level Node ───────────────────────────────────────────────────────────────

function LevelNode({
  level,
  unit,
  levelIndexInUnit,
  unlocked,
  completed,
  isActive,
  pct,
  side,
  onPress,
}: {
  level: SyllabusLevel;
  unit: SyllabusUnit;
  levelIndexInUnit: number;
  unlocked: boolean;
  completed: boolean;
  isActive: boolean;
  pct: number;
  side: "left" | "center" | "right";
  onPress: () => void;
}) {
  const { theme: t } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      const p = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 850, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 850, useNativeDriver: true }),
        ])
      );
      p.start();
      return () => p.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive]);

  const color = unlocked ? unit.color : t.border;
  const bgColor = completed ? unit.color : unlocked ? unit.color + "20" : t.surfaceAlt;

  const alignStyle =
    side === "left"  ? { alignSelf: "flex-start" as const, marginLeft: 44 } :
    side === "right" ? { alignSelf: "flex-end"   as const, marginRight: 44 } :
                       { alignSelf: "center"      as const };

  return (
    <View style={[lNode.outer, alignStyle]}>
      {/* Pulse ring for active node */}
      <Animated.View
        style={[
          lNode.ring,
          isActive && { borderColor: unit.color + "55", borderWidth: 3 },
          { transform: [{ scale: isActive ? pulseAnim : 1 }] },
        ]}
      >
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={unlocked ? 0.8 : 0.6}
          style={[
            lNode.circle,
            {
              backgroundColor: bgColor,
              borderColor: color,
              shadowColor: isActive ? unit.color : "transparent",
              shadowOpacity: isActive ? 0.45 : 0,
              shadowRadius: 12,
              elevation: isActive ? 8 : 2,
            },
          ]}
        >
          {completed ? (
            <CheckCircle2 size={30} color="#fff" strokeWidth={2.5} />
          ) : !unlocked ? (
            <Lock size={26} color={t.textMuted} strokeWidth={2.5} />
          ) : (
            <Text style={lNode.emoji}>{unit.icon}</Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Label */}
      <View style={lNode.labelBox}>
        <Text style={[lNode.title, { color: unlocked ? t.text : t.textMuted }]} numberOfLines={2}>
          {level.title}
        </Text>
        {unlocked && !completed && pct > 0 && (
          <View style={[lNode.barBg, { backgroundColor: t.border }]}>
            <View style={[lNode.barFill, { width: `${pct}%` as any, backgroundColor: unit.color }]} />
          </View>
        )}
        {unlocked && !completed && pct === 0 && (
          <Text style={[lNode.levelMeta, { color: unit.color }]}>
            5 lessons
          </Text>
        )}
        {completed && (
          <Text style={[lNode.levelMeta, { color: unit.color }]}>Completed ✓</Text>
        )}
      </View>
    </View>
  );
}

const lNode = StyleSheet.create({
  outer: { alignItems: "center", width: 140, marginVertical: 4 },
  ring: { borderRadius: 50, borderColor: "transparent", borderWidth: 0, padding: 4 },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 3 },
  },
  emoji: { fontSize: 30 },
  labelBox: { alignItems: "center", marginTop: 8, gap: 3, width: "100%" },
  title: { fontSize: 13, fontWeight: "800", textAlign: "center" },
  barBg: { height: 4, width: 72, borderRadius: 2, overflow: "hidden", marginTop: 3 },
  barFill: { height: "100%", borderRadius: 2 },
  levelMeta: { fontSize: 11, fontWeight: "700" },
});

// ─── Path Connector ───────────────────────────────────────────────────────────

function Connector({ color, active }: { color: string; active: boolean }) {
  return (
    <View style={[conn.line, { borderColor: active ? color + "66" : "#D0D0D033" }]} />
  );
}

const conn = StyleSheet.create({
  line: { alignSelf: "center", height: 40, borderLeftWidth: 3, borderStyle: "dashed" },
});

// ─── Build flat item list ─────────────────────────────────────────────────────
// Items are either { type: "unit", unit, index } or { type: "level", level, unit, levelIndexInUnit, globalIndex }

type PathItem =
  | { type: "unit"; unit: SyllabusUnit; unitIndex: number }
  | { type: "level"; level: SyllabusLevel; unit: SyllabusUnit; levelIndexInUnit: number; globalIndex: number };

function buildPath(): PathItem[] {
  const items: PathItem[] = [];
  let globalIndex = 0;
  for (let ui = 0; ui < SYLLABUS_UNITS.length; ui++) {
    const unit = SYLLABUS_UNITS[ui];
    items.push({ type: "unit", unit, unitIndex: ui });
    for (let li = 0; li < unit.levels.length; li++) {
      items.push({ type: "level", level: unit.levels[li], unit, levelIndexInUnit: li, globalIndex: globalIndex++ });
    }
  }
  return items;
}

const PATH_ITEMS = buildPath();

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function LearnScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();
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

  const reload = useCallback(async () => {
    setProgress(await loadProgress());
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const overallPct = getOverallPercent(progress);

  // Track zigzag index separately (only increments for level items)
  let zigzagIdx = 0;

  return (
    <SafeAreaView style={[scr.safe, { backgroundColor: t.background }]}>
      <StatusBar barStyle={"dark-content" as any} backgroundColor={t.background} />

      {/* Header */}
      <View style={[scr.header, { backgroundColor: t.surface, borderBottomColor: t.border }]}>
        <View style={scr.headerLeft}>
          <GraduationCap size={26} color="#1CB0F6" strokeWidth={2.5} />
          <Text style={[scr.headerTitle, { color: t.text }]}>A1 Course</Text>
        </View>
        <View style={scr.headerRight}>
          <View style={[scr.badge, { backgroundColor: "#FFD70022" }]}>
            <Star size={14} color="#FFD700" strokeWidth={2.5} fill="#FFD700" />
            <Text style={[scr.badgeText, { color: "#CC9900" }]}>{progress.xp}</Text>
          </View>
          <View style={[scr.badge, { backgroundColor: "#FF6B2B22" }]}>
            <Flame size={14} color="#FF6B2B" strokeWidth={2.5} fill="#FF6B2B" />
            <Text style={[scr.badgeText, { color: "#CC5500" }]}>{progress.streak}</Text>
          </View>
          <ModeBadge />
        </View>
      </View>

      {/* Overall progress bar */}
      <View style={[scr.progressWrap, { backgroundColor: t.surface, borderBottomColor: t.border }]}>
        <View style={[scr.progressBar, { backgroundColor: t.border }]}>
          <View style={[scr.progressFill, { width: `${overallPct}%` as any }]} />
        </View>
        <Text style={[scr.progressLabel, { color: t.textMuted }]}>
          {progress.completedLessonIds.length} lessons done · {overallPct}% complete
        </Text>
      </View>

      {/* Path */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={scr.scroll}
        showsVerticalScrollIndicator={false}
      >
        {PATH_ITEMS.map((item, itemIdx) => {
          if (item.type === "unit") {
            return (
              <UnitHeader key={item.unit.unitId} unit={item.unit} index={item.unitIndex} />
            );
          }

          // Level node
          const { level, unit, levelIndexInUnit, globalIndex } = item;
          const unlocked  = isLevelUnlocked(level.levelId, progress);
          const completed = progress.completedLevelIds.includes(level.levelId);
          const isActive  = unlocked && !completed;
          const pct       = getLevelCompletionPercent(level.levelId, progress);
          const side      = ZIGZAG[zigzagIdx % ZIGZAG.length];
          zigzagIdx++;

          // Find prev item to decide whether to show connector
          const prevItem = PATH_ITEMS[itemIdx - 1];
          const showConnector = prevItem?.type === "level";

          return (
            <React.Fragment key={level.levelId}>
              {showConnector && <Connector color={unit.color} active={unlocked} />}
              <LevelNode
                level={level}
                unit={unit}
                levelIndexInUnit={levelIndexInUnit}
                unlocked={unlocked}
                completed={completed}
                isActive={isActive}
                pct={pct}
                side={side}
                onPress={() => {
                  if (!unlocked) return;
                  // Find first unlocked incomplete lesson in this level
                  const nextLesson = level.lessons.find(
                    (ls) =>
                      isLessonUnlocked(ls.lessonId, progress) &&
                      !progress.completedLessonIds.includes(ls.lessonId)
                  ) ?? level.lessons[0];
                  router.push({
                    pathname: "/learn-lesson",
                    params: { lessonId: nextLesson.lessonId, isSyllabus: "1" },
                  });
                }}
              />
            </React.Fragment>
          );
        })}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const scr = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerTitle: { fontSize: 22, fontWeight: "900" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  badge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6,
  },
  badgeText: { fontSize: 13, fontWeight: "800" },
  progressWrap: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, gap: 6 },
  progressBar: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3, backgroundColor: "#1CB0F6" },
  progressLabel: { fontSize: 11, fontWeight: "600" },
  scroll: { paddingTop: 16, paddingBottom: 80, alignItems: "center" },
});
