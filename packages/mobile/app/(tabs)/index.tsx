import React, { memo, useCallback, useMemo, useRef, useEffect, useState } from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useFocusEffect } from "expo-router";
import { api } from "../../lib/api";
import { authClient } from "../../lib/auth";
import { useTheme } from "../../lib/theme";
import {
  Flame, CheckCircle2, TrendingUp, TrendingDown, BookOpen,
  BarChart2, Target, Brain, Star, AlertTriangle, Activity,
  Award, ChevronRight, Layers, GraduationCap, Zap, RefreshCw, LayoutDashboard,
} from "lucide-react-native";
import { useShellTopBar } from "../../lib/AppShell";
import { DeutschForgeMascot } from "../../components/DeutschForgeMascot";
import { useAppMode } from "../../lib/appMode";
import ExamNavigator from "../goethe-exam/ExamNavigator";
import {
  loadGrammarProgress,
  loadPracticeProgress,
  computeStats,
  resetGrammarProgress,
  type PracticeProgress,
  type LevelResult,
} from "../../lib/grammarProgress";
import { PRACTICE_DATA } from "../../lib/grammarPracticeData";
import {
  GRAMMAR_CHAPTERS,
  A2_GRAMMAR_CHAPTERS,
  B1_GRAMMAR_CHAPTERS,
} from "../../lib/grammarData";
import {
  loadLearnProgress,
  getChapterLevelsCompleted,
  isChapterComplete,
  type LearnProgress,
} from "../../lib/learnProgress";
import { CEFR_LEVELS, LEVELS_PER_CHAPTER } from "../../lib/learnData";


const GRAMMAR_LEVELS_META = [
  { id: "a1", label: "A1", title: "Beginner",     chapters: GRAMMAR_CHAPTERS,    color: "#A855F7" },
  { id: "a2", label: "A2", title: "Elementary",   chapters: A2_GRAMMAR_CHAPTERS, color: "#1CB0F6" },
  { id: "b1", label: "B1", title: "Intermediate", chapters: B1_GRAMMAR_CHAPTERS, color: "#22C55E" },
];

const ALL_CHAPTERS = [...GRAMMAR_CHAPTERS, ...A2_GRAMMAR_CHAPTERS, ...B1_GRAMMAR_CHAPTERS];

const SCREEN_W = Dimensions.get("window").width;

const CEFR_COLORS: Record<string, string> = {
  A1: "#58CC02", A2: "#45A800",
  B1: "#1CB0F6", B2: "#0082B9",
  C1: "#CE82FF", C2: "#9B3FCF",
};
const POS_COLORS: Record<string, string> = {
  noun: "#CE82FF", verb: "#1CB0F6", adjective: "#FFC800",
  adverb: "#58CC02", pronoun: "#FF9F1C", other: "#aaa", unknown: "#888",
};
const GENDER_COLORS: Record<string, string> = {
  masculine: "#1CB0F6", feminine: "#FF4B4B", neutral: "#888", none: "#aaa",
};
const RATING_COLORS: Record<number, string> = { 1: "#EF4444", 2: "#F59E0B", 3: "#58CC02", 4: "#1CB0F6" };
const RATING_LABELS = ["", "Again", "Hard", "Good", "Easy"];

// ─── Animated progress bar ────────────────────────────────────────────────────
const AnimBar = memo(function AnimBar({ pct, color, height = 10 }: { pct: number; color: string; height?: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: pct / 100, duration: 800, useNativeDriver: false }).start();
  }, [pct]);
  return (
    <View style={{ height, borderRadius: height / 2, overflow: "hidden", backgroundColor: "rgba(0,0,0,0.08)" }}>
      <Animated.View style={{ height, borderRadius: height / 2, backgroundColor: color, width: anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }} />
    </View>
  );
});

// ─── Animated progress bar (grammar dashboard) ───────────────────────────────
function AnimatedProgressBar({ pct, color, t }: { pct: number; color: string; t: any }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: pct, duration: 900, useNativeDriver: false }).start();
  }, [pct]);
  const width = anim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] });
  return (
    <View style={[gc.progTrack, { backgroundColor: t.border }]}>
      <Animated.View style={[gc.progFill, { backgroundColor: color, width }]} />
    </View>
  );
}

// ─── Streak badge ─────────────────────────────────────────────────────────────
const StreakBadge = memo(function StreakBadge({ streak, t }: { streak: number; t: any }) {
  return (
    <View style={[styles.streakBadge, { backgroundColor: t.surface }]}>
      <Flame size={22} color="#FF4B4B" strokeWidth={2} />
      <Text style={[styles.streakCount, { color: "#FF4B4B" }]}>{streak}</Text>
      <Text style={[styles.streakLabel, { color: t.textMuted }]}>streak</Text>
    </View>
  );
});

// ─── XP bar ───────────────────────────────────────────────────────────────────
const XPBar = memo(function XPBar({ xp, xpForCurrentLevel, xpForNextLevel, level, t }: {
  xp: number; xpForCurrentLevel: number; xpForNextLevel: number; level: number; t: any;
}) {
  const pct = xpForNextLevel > xpForCurrentLevel
    ? Math.min(Math.max((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel), 0), 1) * 100
    : 0;
  return (
    <View style={styles.xpContainer}>
      <View style={styles.xpHeader}>
        <Text style={[styles.xpLevelText, { color: t.text }]}>Level {level}</Text>
        <Text style={[styles.xpText, { color: t.accent }]}>{xp} XP</Text>
      </View>
      <AnimBar pct={pct} color={t.accent} />
      <Text style={[styles.xpNext, { color: t.textMuted }]}>{xpForNextLevel - xp} XP to level {level + 1}</Text>
    </View>
  );
});

// ─── Card section title ────────────────────────────────────────────────────────
function SectionTitle({ icon: Icon, title, color, t }: { icon: any; title: string; color: string; t: any }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: color + "20", alignItems: "center", justifyContent: "center" }}>
        <Icon size={15} color={color} strokeWidth={2.5} />
      </View>
      <Text style={{ fontSize: 14, fontWeight: "800", color: t.text }}>{title}</Text>
    </View>
  );
}

// ─── GitHub-style activity graph ──────────────────────────────────────────────
const ActivityGraph = memo(function ActivityGraph({ data, t }: {
  data: { date: string; count: number }[];
  t: any;
}) {
  const scrollRef = useRef<ScrollView>(null);

  const weeks: { date: string; count: number }[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const getColor = (count: number) => {
    if (count === 0) return t.border;
    const intensity = count / maxCount;
    if (intensity < 0.25) return "#166534";
    if (intensity < 0.5) return "#16A34A";
    if (intensity < 0.75) return "#22C55E";
    return "#4ADE80";
  };

  const today = new Date().toISOString().split("T")[0] ?? "";
  const totalActive = data.filter((d) => d.count > 0).length;
  const totalReviews = data.reduce((s, d) => s + d.count, 0);

  // Month labels — show month abbreviation at start of each month
  const monthLabels: { week: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    if (week.length > 0) {
      const d = new Date(week[0]!.date + "T00:00:00");
      if (d.getMonth() !== lastMonth) {
        lastMonth = d.getMonth();
        monthLabels.push({ week: wi, label: d.toLocaleString("en", { month: "short" }) });
      }
    }
  });

  const CELL = 11;
  const GAP = 3;

  return (
    <View>
      <SectionTitle icon={Activity} title="Activity" color="#22C55E" t={t} />

      {/* Stats row */}
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 10 }}>
        {[
          { val: totalActive, label: "active days", color: "#22C55E" },
          { val: totalReviews, label: "total reviews", color: t.primary },
        ].map(({ val, label, color }) => (
          <View key={label} style={{ flex: 1, borderRadius: 12, backgroundColor: t.surface, padding: 10, alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "900", color }}>{val}</Text>
            <Text style={{ fontSize: 10, fontWeight: "600", color: t.textMuted }}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Month labels + Grid — both in one ScrollView so they scroll together */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        <View>
          {/* Month labels row */}
          <View style={{ flexDirection: "row", marginBottom: 3 }}>
            {weeks.map((_, wi) => {
              const ml = monthLabels.find((m) => m.week === wi);
              return (
                <View key={wi} style={{ width: CELL + GAP }}>
                  {ml ? <Text style={{ fontSize: 8, color: t.textMuted, fontWeight: "700" }}>{ml.label}</Text> : null}
                </View>
              );
            })}
          </View>

          {/* Grid */}
          <View style={{ flexDirection: "row", gap: GAP }}>
            {weeks.map((week, wi) => (
              <View key={wi} style={{ flexDirection: "column", gap: GAP }}>
                {week.map((day) => (
                  <View
                    key={day.date}
                    style={{
                      width: CELL,
                      height: CELL,
                      borderRadius: 2,
                      backgroundColor: getColor(day.count),
                      opacity: day.date > today ? 0.3 : 1,
                    }}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6, justifyContent: "flex-end" }}>
        <Text style={{ fontSize: 9, color: t.textMuted }}>Less</Text>
        {[t.border, "#166534", "#16A34A", "#22C55E", "#4ADE80"].map((c, i) => (
          <View key={i} style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: c }} />
        ))}
        <Text style={{ fontSize: 9, color: t.textMuted }}>More</Text>
      </View>
    </View>
  );
});

// ─── Hard words list ───────────────────────────────────────────────────────────
const HardWords = memo(function HardWords({ words, t, router }: { words: any[]; t: any; router: any }) {
  if (!words || words.length === 0) return null;
  return (
    <View>
      <SectionTitle icon={AlertTriangle} title="Hard Words" color="#EF4444" t={t} />
      <View style={{ gap: 6 }}>
        {words.slice(0, 8).map((w) => (
          <TouchableOpacity
            key={w.id}
            onPress={() => router.push("/(tabs)/words")}
            activeOpacity={0.8}
            style={[hw.row, { backgroundColor: t.surface, borderColor: "#EF444420" }]}
          >
            <View style={[hw.badge, { backgroundColor: "#EF444420" }]}>
              <Text style={[hw.badgeTxt, { color: "#EF4444" }]}>{w.lapses}</Text>
              <Text style={[hw.badgeSub, { color: "#EF4444" }]}>lapses</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[hw.german, { color: t.text }]}>{w.displayGerman}</Text>
              <Text style={[hw.english, { color: t.textMuted }]}>{w.english}</Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: 3 }}>
              {w.cefrLevel && (
                <View style={{ backgroundColor: (CEFR_COLORS[w.cefrLevel] ?? "#888") + "20", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 9, fontWeight: "900", color: CEFR_COLORS[w.cefrLevel] ?? "#888" }}>{w.cefrLevel}</Text>
                </View>
              )}
              <Text style={{ fontSize: 10, color: t.textMuted, fontWeight: "600" }}>{w.reps} reps</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
});

// ─── CEFR breakdown ───────────────────────────────────────────────────────────
const CEFRBreakdown = memo(function CEFRBreakdown({ data, total, t }: { data: Record<string, number>; total: number; t: any }) {
  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
  return (
    <View>
      <SectionTitle icon={Layers} title="CEFR Breakdown" color="#1CB0F6" t={t} />
      <View style={{ gap: 7 }}>
        {levels.filter((l) => (data[l] ?? 0) > 0).map((lvl) => {
          const cnt = data[lvl] ?? 0;
          const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
          const color = CEFR_COLORS[lvl] ?? "#888";
          return (
            <View key={lvl} style={{ gap: 3 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 12, fontWeight: "800", color }}>{lvl}</Text>
                <Text style={{ fontSize: 12, fontWeight: "700", color: t.textMuted }}>{cnt} · {pct}%</Text>
              </View>
              <AnimBar pct={pct} color={color} height={7} />
            </View>
          );
        })}
      </View>
    </View>
  );
});

// ─── Card state distribution ───────────────────────────────────────────────────
const CardStates = memo(function CardStates({ states, t }: { states: { new: number; learning: number; review: number; relearning: number }; t: any }) {
  const items = [
    { label: "New", val: states.new, color: "#1CB0F6" },
    { label: "Learning", val: states.learning, color: "#F59E0B" },
    { label: "Mastered", val: states.review, color: "#22C55E" },
    { label: "Relearning", val: states.relearning, color: "#EF4444" },
  ];
  const total = items.reduce((s, i) => s + i.val, 0);
  return (
    <View>
      <SectionTitle icon={Brain} title="Card States" color="#CE82FF" t={t} />
      {/* Stacked bar */}
      <View style={{ flexDirection: "row", height: 14, borderRadius: 7, overflow: "hidden", marginBottom: 10 }}>
        {items.filter((i) => i.val > 0).map((item) => (
          <View
            key={item.label}
            style={{ flex: item.val, backgroundColor: item.color }}
          />
        ))}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {items.map((item) => (
          <View key={item.label} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color }} />
            <Text style={{ fontSize: 11, fontWeight: "700", color: t.text }}>{item.val}</Text>
            <Text style={{ fontSize: 11, color: t.textMuted }}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});

// ─── POS breakdown ────────────────────────────────────────────────────────────
const POSBreakdown = memo(function POSBreakdown({ data, total, t }: { data: Record<string, number>; total: number; t: any }) {
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 6);
  return (
    <View>
      <SectionTitle icon={BookOpen} title="Word Types" color="#CE82FF" t={t} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {sorted.map(([pos, cnt]) => {
          const color = POS_COLORS[pos] ?? "#888";
          const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
          return (
            <View key={pos} style={{ borderRadius: 10, backgroundColor: color + "18", paddingHorizontal: 10, paddingVertical: 6, alignItems: "center", gap: 2, minWidth: 64 }}>
              <Text style={{ fontSize: 16, fontWeight: "900", color }}>{cnt}</Text>
              <Text style={{ fontSize: 9, fontWeight: "800", color, textTransform: "capitalize" }}>{pos}</Text>
              <Text style={{ fontSize: 9, color: t.textMuted }}>{pct}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
});

// ─── Rating distribution ──────────────────────────────────────────────────────
const RatingDist = memo(function RatingDist({ data, t }: { data: Record<number, number>; t: any }) {
  const total = Object.values(data).reduce((s, v) => s + v, 0);
  if (total === 0) return null;
  return (
    <View>
      <SectionTitle icon={Star} title="Rating Distribution" color="#F59E0B" t={t} />
      <View style={{ gap: 6 }}>
        {[1, 2, 3, 4].map((r) => {
          const cnt = data[r] ?? 0;
          const pct = total > 0 ? (cnt / total) * 100 : 0;
          const color = RATING_COLORS[r] ?? "#888";
          return (
            <View key={r} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: "800", color, width: 44 }}>{RATING_LABELS[r] ?? ""}</Text>
              <View style={{ flex: 1 }}>
                <AnimBar pct={pct} color={color} height={8} />
              </View>
              <Text style={{ fontSize: 11, fontWeight: "700", color: t.textMuted, width: 28, textAlign: "right" }}>{cnt}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
});

// ─── Daily review sparkline ────────────────────────────────────────────────────
const DailySparkline = memo(function DailySparkline({ data, t }: { data: { date: string; count: number; xp: number }[]; t: any }) {
  const maxVal = Math.max(...data.map((d) => d.count), 1);
  const BAR_H = 60;
  return (
    <View>
      <SectionTitle icon={BarChart2} title="Reviews — Last 14 Days" color={t.primary} t={t} />
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 3, height: BAR_H + 20 }}>
        {data.map((d) => {
          const h = Math.max((d.count / maxVal) * BAR_H, d.count > 0 ? 4 : 2);
          const isToday = d.date === new Date().toISOString().split("T")[0];
          const dayLabel = new Date(d.date + "T00:00:00").toLocaleString("en", { weekday: "narrow" });
          return (
            <View key={d.date} style={{ flex: 1, alignItems: "center", gap: 3 }}>
              {d.count > 0 && (
                <Text style={{ fontSize: 8, color: t.textMuted, fontWeight: "700" }}>{d.count}</Text>
              )}
              <View
                style={{
                  width: "100%",
                  height: h,
                  borderRadius: 3,
                  backgroundColor: isToday ? t.accent : (d.count > 0 ? t.primary : t.border),
                }}
              />
              <Text style={{ fontSize: 8, color: isToday ? t.accent : t.textMuted, fontWeight: isToday ? "900" : "600" }}>{dayLabel}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
});

// ─── Mastery ring ──────────────────────────────────────────────────────────────
const MasteryRing = memo(function MasteryRing({ pct, mastered, total, t }: { pct: number; mastered: number; total: number; t: any }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: pct / 100, duration: 900, useNativeDriver: false }).start();
  }, [pct]);

  return (
    <View style={{ alignItems: "center", gap: 6 }}>
      <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: t.border, alignItems: "center", justifyContent: "center", position: "relative" }}>
        {/* Background ring */}
        <View style={{ position: "absolute", width: 96, height: 96, borderRadius: 48, borderWidth: 8, borderColor: t.border }} />
        {/* Foreground ring — simplified with border trick */}
        <View style={{
          position: "absolute", width: 96, height: 96, borderRadius: 48, borderWidth: 8,
          borderColor: "#22C55E", borderTopColor: pct > 75 ? "#22C55E" : "transparent",
          borderRightColor: pct > 50 ? "#22C55E" : "transparent",
          borderBottomColor: pct > 25 ? "#22C55E" : "transparent",
          borderLeftColor: "#22C55E",
          transform: [{ rotate: `${-90 + (pct / 100) * 360}deg` }],
        }} />
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 22, fontWeight: "900", color: "#22C55E" }}>{pct}%</Text>
          <Text style={{ fontSize: 9, color: t.textMuted, fontWeight: "700" }}>mastery</Text>
        </View>
      </View>
      <Text style={{ fontSize: 12, color: t.textMuted }}>{mastered} of {total} mastered</Text>
    </View>
  );
});

// ─── Gender breakdown ──────────────────────────────────────────────────────────
const GenderBreakdown = memo(function GenderBreakdown({ data, t }: { data: Record<string, number>; t: any }) {
  const items = Object.entries(data).filter(([, v]) => v > 0);
  const total = items.reduce((s, [, v]) => s + v, 0);
  if (total === 0) return null;
  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      {items.map(([g, cnt]) => {
        const color = GENDER_COLORS[g] ?? "#888";
        const pct = Math.round((cnt / total) * 100);
        return (
          <View key={g} style={{ flex: 1, borderRadius: 12, backgroundColor: color + "15", padding: 10, alignItems: "center", gap: 3 }}>
            <Text style={{ fontSize: 18, fontWeight: "900", color }}>{cnt}</Text>
            <Text style={{ fontSize: 9, fontWeight: "800", color, textTransform: "capitalize" }}>{g}</Text>
            <Text style={{ fontSize: 9, color: t.textMuted }}>{pct}%</Text>
          </View>
        );
      })}
    </View>
  );
});

// ─── Grammar activity heatmap ─────────────────────────────────────────────────
const GrammarActivityGraph = memo(function GrammarActivityGraph({
  data,
  t,
}: {
  data: { date: string; count: number }[];
  t: any;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const GRAMMAR_COLOR = "#A855F7";

  const weeks: { date: string; count: number }[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const getColor = (count: number) => {
    if (count === 0) return t.border;
    const intensity = count / maxCount;
    if (intensity < 0.25) return "#581C87";
    if (intensity < 0.5)  return "#7E22CE";
    if (intensity < 0.75) return "#A855F7";
    return "#C084FC";
  };

  const today = new Date().toISOString().split("T")[0] ?? "";
  const totalActive = data.filter((d) => d.count > 0).length;
  const totalReviews = data.reduce((s, d) => s + d.count, 0);

  const monthLabels: { week: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    if (week.length > 0) {
      const d = new Date(week[0]!.date + "T00:00:00");
      if (d.getMonth() !== lastMonth) {
        lastMonth = d.getMonth();
        monthLabels.push({ week: wi, label: d.toLocaleString("en", { month: "short" }) });
      }
    }
  });

  const CELL = 11;
  const GAP  = 3;

  return (
    <View>
      <SectionTitle icon={Activity} title="Activity" color={GRAMMAR_COLOR} t={t} />

      {/* Stats row */}
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 10 }}>
        {[
          { val: totalActive,  label: "active days",   color: GRAMMAR_COLOR },
          { val: totalReviews, label: "interactions",  color: "#1CB0F6" },
        ].map(({ val, label, color }) => (
          <View key={label} style={{ flex: 1, borderRadius: 12, backgroundColor: t.surface, padding: 10, alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "900", color }}>{val}</Text>
            <Text style={{ fontSize: 10, fontWeight: "600", color: t.textMuted }}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Month labels + Grid */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onLayout={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        <View>
          {/* Month labels */}
          <View style={{ flexDirection: "row", marginBottom: 3 }}>
            {weeks.map((_, wi) => {
              const ml = monthLabels.find((m) => m.week === wi);
              return (
                <View key={wi} style={{ width: CELL + GAP }}>
                  {ml && (
                    <Text style={{ fontSize: 7, color: t.textMuted, fontWeight: "600" }}>{ml.label}</Text>
                  )}
                </View>
              );
            })}
          </View>
          {/* Grid */}
          <View style={{ flexDirection: "row", gap: GAP }}>
            {weeks.map((week, wi) => (
              <View key={wi} style={{ flexDirection: "column", gap: GAP }}>
                {week.map((day) => (
                  <View
                    key={day.date}
                    style={{
                      width: CELL,
                      height: CELL,
                      borderRadius: 2,
                      backgroundColor: getColor(day.count),
                      borderWidth: day.date === today ? 1 : 0,
                      borderColor: GRAMMAR_COLOR,
                    }}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
});

// ─── Radial ring ──────────────────────────────────────────────────────────────
function RadialRing({
  pct, size = 110, stroke = 10, color = "#A855F7", label, sublabel, t,
}: { pct: number; size?: number; stroke?: number; color?: string; label: string; sublabel: string; t: any }) {
  const clamp = Math.min(Math.max(pct, 0), 100);
  const deg = Math.round((clamp / 100) * 360);
  const r = size / 2;
  const rightDeg = Math.min(deg, 180);
  const leftDeg = Math.max(deg - 180, 0);
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View style={{ position: "absolute", width: size, height: size, borderRadius: r, borderWidth: stroke, borderColor: color + "25" }} />
      <View style={{ position: "absolute", width: size, height: size, borderRadius: r, overflow: "hidden" }}>
        <View style={{ position: "absolute", right: 0, width: r, height: size, overflow: "hidden" }}>
          <View style={{
            position: "absolute", left: -r, width: size, height: size, borderRadius: r,
            borderWidth: stroke, borderColor: "transparent",
            borderRightColor: rightDeg > 0 ? color : "transparent",
            borderBottomColor: rightDeg > 90 ? color : "transparent",
            transform: [{ rotate: `${rightDeg - 45}deg` }],
          }} />
        </View>
        {leftDeg > 0 && (
          <View style={{ position: "absolute", left: 0, width: r, height: size, overflow: "hidden" }}>
            <View style={{
              position: "absolute", right: -r, width: size, height: size, borderRadius: r,
              borderWidth: stroke, borderColor: "transparent",
              borderLeftColor: color,
              borderBottomColor: leftDeg > 90 ? color : "transparent",
              transform: [{ rotate: `${leftDeg - 45}deg` }],
            }} />
          </View>
        )}
      </View>
      <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "900", color }}>{label}</Text>
        <Text style={{ fontSize: 10, fontWeight: "700", color: t.textMuted, textAlign: "center" }}>{sublabel}</Text>
      </View>
    </View>
  );
}

// ─── Per-chapter accuracy bar chart ──────────────────────────────────────────
function AccuracyBarChart({ progress, t }: { progress: import("../../lib/grammarProgress").GrammarProgress; t: any }) {
  const stats = computeStats(progress);
  const chapters = ALL_CHAPTERS.filter((c) => (progress.chapters[c.id]?.exerciseAttempts ?? 0) > 0);
  if (chapters.length === 0) return null;
  const barW = Math.max(Math.floor((SCREEN_W - 64) / Math.min(chapters.length, 22)) - 2, 5);
  return (
    <View style={[gc.card, { backgroundColor: t.surface, borderColor: t.border }]}>
      <View style={gc.cardHeader}>
        <BarChart2 size={16} color="#A855F7" strokeWidth={2.5} />
        <Text style={[gc.cardTitle, { color: t.text }]}>Per-Chapter Accuracy</Text>
      </View>
      <View style={gc.chartWrap}>
        {chapters.map((ch) => {
          const acc = stats.accuracy(ch.id) ?? 0;
          const barColor = acc >= 80 ? "#22C55E" : acc >= 60 ? "#F59E0B" : "#EF4444";
          const barHeight = Math.max(Math.round((acc / 100) * 120), 4);
          return (
            <View key={ch.id} style={[gc.barCol, { width: barW }]}>
              <Text style={[gc.barPct, { color: barColor, fontSize: barW < 10 ? 7 : 9 }]}>{acc}</Text>
              <View style={[gc.barTrack, { backgroundColor: t.border }]}>
                <View style={[gc.barFill, { backgroundColor: barColor, height: barHeight }]} />
              </View>
              <Text style={[gc.barLabel, { color: t.textMuted, fontSize: barW < 10 ? 7 : 9 }]}>{ch.number}</Text>
            </View>
          );
        })}
      </View>
      <View style={gc.legend}>
        {[["#22C55E", "≥80%"], ["#F59E0B", "60–79%"], ["#EF4444", "<60%"]].map(([c, l]) => (
          <View key={l} style={gc.legendItem}>
            <View style={[gc.legendDot, { backgroundColor: c }]} />
            <Text style={[gc.legendTxt, { color: t.textMuted }]}>{l}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Visit heatmap ────────────────────────────────────────────────────────────
function VisitHeatmap({ progress, t }: { progress: import("../../lib/grammarProgress").GrammarProgress; t: any }) {
  const maxVisits = Math.max(1, ...ALL_CHAPTERS.map((c) => progress.chapters[c.id]?.visitCount ?? 0));
  const cols = 11;
  const cellSize = Math.floor((SCREEN_W - 64 - cols * 4) / cols);
  const LEVEL_GROUPS = [
    { label: "A1", color: "#A855F7", chapters: GRAMMAR_CHAPTERS },
    { label: "A2", color: "#1CB0F6", chapters: A2_GRAMMAR_CHAPTERS },
    { label: "B1", color: "#22C55E", chapters: B1_GRAMMAR_CHAPTERS },
  ];
  return (
    <View style={[gc.card, { backgroundColor: t.surface, borderColor: t.border }]}>
      <View style={gc.cardHeader}>
        <Flame size={16} color="#F59E0B" strokeWidth={2.5} />
        <Text style={[gc.cardTitle, { color: t.text }]}>Chapter Activity</Text>
        <Text style={[gc.cardSub, { color: t.textMuted }]}>opens per chapter</Text>
      </View>
      {LEVEL_GROUPS.map(({ label, color, chapters }) => (
        <View key={label} style={{ marginBottom: 6 }}>
          <Text style={{ fontSize: 10, fontWeight: "700", color, marginBottom: 4, marginLeft: 2 }}>{label}</Text>
          <View style={gc.heatmapGrid}>
            {chapters.map((ch) => {
              const visits = progress.chapters[ch.id]?.visitCount ?? 0;
              const done = progress.chapters[ch.id]?.completedAt != null;
              const intensity = visits === 0 ? 0 : Math.max(0.15, visits / maxVisits);
              const bg = done ? "#22C55E" : visits === 0 ? t.border + "80" : `rgba(168,85,247,${intensity})`;
              return (
                <View key={ch.id} style={[gc.heatCell, { width: cellSize, height: cellSize, backgroundColor: bg, borderRadius: Math.max(4, cellSize * 0.2) }]}>
                  <Text style={[gc.heatNum, { color: visits === 0 && !done ? t.textMuted : "#fff", fontSize: cellSize > 28 ? 9 : 7 }]}>
                    {ch.number}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      ))}
      <View style={gc.heatLegend}>
        <Text style={[gc.legendTxt, { color: t.textMuted }]}>Less</Text>
        {[0.1, 0.3, 0.5, 0.7, 1].map((v, i) => (
          <View key={i} style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: `rgba(168,85,247,${v})` }} />
        ))}
        <View style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: "#22C55E" }} />
        <Text style={[gc.legendTxt, { color: t.textMuted }]}>Done</Text>
      </View>
    </View>
  );
}

// ─── Score distribution ───────────────────────────────────────────────────────
function AccuracyDistribution({ progress, t }: { progress: import("../../lib/grammarProgress").GrammarProgress; t: any }) {
  const stats = computeStats(progress);
  const withScores = ALL_CHAPTERS.filter((c) => (progress.chapters[c.id]?.exerciseAttempts ?? 0) > 0);
  if (withScores.length === 0) return null;
  const high = withScores.filter((c) => (stats.accuracy(c.id) ?? 0) >= 80).length;
  const mid = withScores.filter((c) => { const a = stats.accuracy(c.id) ?? 0; return a >= 60 && a < 80; }).length;
  const low = withScores.filter((c) => (stats.accuracy(c.id) ?? 101) < 60).length;
  const total = withScores.length;
  const segments = [
    { label: "Strong", count: high, color: "#22C55E" },
    { label: "Fair", count: mid, color: "#F59E0B" },
    { label: "Weak", count: low, color: "#EF4444" },
  ];
  return (
    <View style={[gc.card, { backgroundColor: t.surface, borderColor: t.border }]}>
      <View style={gc.cardHeader}>
        <Target size={16} color="#22C55E" strokeWidth={2.5} />
        <Text style={[gc.cardTitle, { color: t.text }]}>Score Distribution</Text>
      </View>
      <View style={gc.stackBarWrap}>
        {segments.map(({ color, count }) => {
          const pct = total > 0 ? (count / total) * 100 : 0;
          if (pct === 0) return null;
          return <View key={color} style={[gc.stackSeg, { flex: pct, backgroundColor: color }]} />;
        })}
      </View>
      <View style={gc.distLegendRow}>
        {segments.map(({ label, count, color }) => (
          <View key={label} style={gc.distItem}>
            <View style={[gc.distDot, { backgroundColor: color }]} />
            <Text style={[gc.distCount, { color }]}>{count}</Text>
            <Text style={[gc.distLabel, { color: t.textMuted }]}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Recent activity timeline ─────────────────────────────────────────────────
function ProgressTimeline({ progress, t }: { progress: import("../../lib/grammarProgress").GrammarProgress; t: any }) {
  const visited = ALL_CHAPTERS
    .filter((c) => progress.chapters[c.id]?.lastVisited)
    .sort((a, b) => (progress.chapters[b.id]?.lastVisited ?? 0) - (progress.chapters[a.id]?.lastVisited ?? 0))
    .slice(0, 6);
  if (visited.length === 0) return null;
  const now = Date.now();
  const fmt = (ts: number) => {
    const diff = now - ts;
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 2) return "just now";
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${d}d ago`;
  };
  return (
    <View style={[gc.card, { backgroundColor: t.surface, borderColor: t.border }]}>
      <View style={gc.cardHeader}>
        <Zap size={16} color="#F59E0B" strokeWidth={2.5} />
        <Text style={[gc.cardTitle, { color: t.text }]}>Recent Activity</Text>
      </View>
      {visited.map((ch, i) => {
        const cp = progress.chapters[ch.id]!;
        const acc = cp.exerciseAttempts > 0 ? Math.round((cp.exerciseCorrect / cp.exerciseAttempts) * 100) : null;
        const accColor = acc === null ? t.textMuted : acc >= 80 ? "#22C55E" : acc >= 60 ? "#F59E0B" : "#EF4444";
        const done = cp.completedAt != null;
        return (
          <View key={ch.id} style={gc.tlRow}>
            <View style={gc.tlSpineWrap}>
              <View style={[gc.tlDot, { backgroundColor: done ? "#22C55E" : "#A855F7" }]} />
              {i < visited.length - 1 && <View style={[gc.tlLine, { backgroundColor: t.border }]} />}
            </View>
            <View style={gc.tlBody}>
              <View style={gc.tlTop}>
                <Text style={[gc.tlTitle, { color: t.text }]}>{ch.number}. {ch.title}</Text>
                <Text style={[gc.tlTime, { color: t.textMuted }]}>{fmt(cp.lastVisited!)}</Text>
              </View>
              <View style={gc.tlMeta}>
                <Text style={[gc.tlMini, { color: t.textMuted }]}>{cp.visitCount} visit{cp.visitCount !== 1 ? "s" : ""}</Text>
                {done && <Text style={[gc.tlMini, { color: "#22C55E", fontWeight: "800" }]}>✓ done</Text>}
                {acc !== null && <Text style={[gc.tlMini, { color: accColor, fontWeight: "800" }]}>{acc}% accuracy</Text>}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── PRACTICE: Level pass overview (rings per CEFR) ──────────────────────────
function PracticeLevelOverview({ practiceProgress, t }: { practiceProgress: PracticeProgress; t: any }) {
  const hasAny = Object.keys(practiceProgress.chapters).length > 0;
  if (!hasAny) return null;

  return (
    <View style={[gc.card, { backgroundColor: t.surface, borderColor: t.border }]}>
      <View style={gc.cardHeader}>
        <Award size={16} color="#F59E0B" strokeWidth={2.5} />
        <Text style={[gc.cardTitle, { color: t.text }]}>Practice Levels Passed</Text>
      </View>
      <View style={{ gap: 10 }}>
        {GRAMMAR_LEVELS_META.map((lvl) => {
          const chapterIds = lvl.chapters.map(c => c.id);
          const totalLevels = chapterIds.length * 10;
          const passedLevels = chapterIds.reduce((sum, cid) => {
            const results = practiceProgress.chapters[cid];
            if (!results) return sum;
            return sum + results.filter((r: LevelResult) => r.passed).length;
          }, 0);
          const pct = totalLevels > 0 ? Math.round((passedLevels / totalLevels) * 100) : 0;
          return (
            <View key={lvl.id} style={{ gap: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={{ width: 28, height: 18, borderRadius: 5, backgroundColor: lvl.color + "22", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 10, fontWeight: "800", color: lvl.color, letterSpacing: 0.4 }}>{lvl.label}</Text>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: t.textSecondary }}>{lvl.title}</Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: "700", color: lvl.color }}>{passedLevels}/{totalLevels}</Text>
              </View>
              <View style={{ height: 6, borderRadius: 4, backgroundColor: t.border, overflow: "hidden" }}>
                <View style={{ height: 6, borderRadius: 4, backgroundColor: lvl.color, width: `${pct}%` as any, opacity: pct === 0 ? 0.3 : 1 }} />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── PRACTICE: Best score heatmap (chapters × 10 levels) ─────────────────────
function PracticeScoreHeatmap({ practiceProgress, t }: { practiceProgress: PracticeProgress; t: any }) {
  const chaptersWithData = ALL_CHAPTERS.filter(c => practiceProgress.chapters[c.id]);
  if (chaptersWithData.length === 0) return null;

  const scoreColor = (score: number, attempted: boolean) => {
    if (!attempted) return t.border + "60";
    if (score >= 9) return "#22C55E";
    if (score >= 7) return "#4ADE80";
    if (score >= 5) return "#F59E0B";
    if (score >= 3) return "#FB923C";
    return "#EF4444";
  };

  const CELL = 18;

  return (
    <View style={[gc.card, { backgroundColor: t.surface, borderColor: t.border }]}>
      <View style={gc.cardHeader}>
        <Layers size={16} color="#1CB0F6" strokeWidth={2.5} />
        <Text style={[gc.cardTitle, { color: t.text }]}>Practice Score Heatmap</Text>
        <Text style={[gc.cardSub, { color: t.textMuted }]}>10 levels per chapter</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
        <View style={{ width: 36 }} />
        {Array.from({ length: 10 }, (_, i) => (
          <View key={i} style={{ width: CELL + 2, alignItems: "center" }}>
            <Text style={{ fontSize: 9, color: t.textMuted, fontWeight: "700" }}>{i + 1}</Text>
          </View>
        ))}
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 340 }}>
        {chaptersWithData.map((ch) => {
          const results = practiceProgress.chapters[ch.id] ?? [];
          return (
            <View key={ch.id} style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
              <Text style={{ width: 36, fontSize: 9, fontWeight: "700", color: t.textMuted }}>{ch.number}</Text>
              {Array.from({ length: 10 }, (_, li) => {
                const r = results[li];
                const attempted = r && r.attempts > 0;
                const score = r?.bestScore ?? 0;
                return (
                  <View
                    key={li}
                    style={{
                      width: CELL,
                      height: CELL,
                      borderRadius: 3,
                      marginRight: 2,
                      backgroundColor: scoreColor(score, !!attempted),
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {attempted && (
                      <Text style={{ fontSize: 7, fontWeight: "900", color: "#fff" }}>{score}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
      <View style={[gc.legend, { marginTop: 8, flexWrap: "wrap", rowGap: 4 }]}>
        {[
          ["#22C55E", "9-10"],
          ["#4ADE80", "7-8 ✓"],
          ["#F59E0B", "5-6"],
          ["#FB923C", "3-4"],
          ["#EF4444", "0-2"],
        ].map(([c, l]) => (
          <View key={l} style={gc.legendItem}>
            <View style={[gc.legendDot, { backgroundColor: c }]} />
            <Text style={[gc.legendTxt, { color: t.textMuted }]}>{l}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── PRACTICE: Chapter completion bars (levels passed per chapter) ─────────────
function PracticeChapterBars({ practiceProgress, t }: { practiceProgress: PracticeProgress; t: any }) {
  const chaptersWithData = ALL_CHAPTERS.filter(c => practiceProgress.chapters[c.id]);
  if (chaptersWithData.length === 0) return null;

  return (
    <View style={[gc.card, { backgroundColor: t.surface, borderColor: t.border }]}>
      <View style={gc.cardHeader}>
        <Star size={16} color="#F59E0B" strokeWidth={2.5} />
        <Text style={[gc.cardTitle, { color: t.text }]}>Levels Passed per Chapter</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 320 }}>
        {chaptersWithData.map((ch) => {
          const results = practiceProgress.chapters[ch.id] ?? [];
          const passed = results.filter((r: LevelResult) => r.passed).length;
          const pct = (passed / 10) * 100;
          const barColor = pct === 100 ? "#22C55E" : pct >= 70 ? "#A855F7" : pct >= 40 ? "#1CB0F6" : "#F59E0B";
          return (
            <View key={ch.id} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 }}>
              <Text style={{ width: 28, fontSize: 10, fontWeight: "800", color: t.textMuted, textAlign: "right" }}>{ch.number}</Text>
              <View style={{ flex: 1, height: 10, backgroundColor: t.border, borderRadius: 5, overflow: "hidden" }}>
                <View style={{ width: `${pct}%`, height: 10, backgroundColor: barColor, borderRadius: 5 }} />
              </View>
              <Text style={{ width: 32, fontSize: 10, fontWeight: "900", color: barColor, textAlign: "right" }}>{passed}/10</Text>
            </View>
          );
        })}
      </ScrollView>
      <View style={gc.legend}>
        {[["#22C55E", "All 10"], ["#A855F7", "7-9"], ["#1CB0F6", "4-6"], ["#F59E0B", "1-3"]].map(([c, l]) => (
          <View key={l} style={gc.legendItem}>
            <View style={[gc.legendDot, { backgroundColor: c }]} />
            <Text style={[gc.legendTxt, { color: t.textMuted }]}>{l}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── PRACTICE: Average best score per CEFR level ─────────────────────────────
function PracticeCEFRScoreBar({ practiceProgress, t }: { practiceProgress: PracticeProgress; t: any }) {
  const hasAny = Object.keys(practiceProgress.chapters).length > 0;
  if (!hasAny) return null;

  return (
    <View style={[gc.card, { backgroundColor: t.surface, borderColor: t.border }]}>
      <View style={gc.cardHeader}>
        <BarChart2 size={16} color="#1CB0F6" strokeWidth={2.5} />
        <Text style={[gc.cardTitle, { color: t.text }]}>Avg Best Score by Level</Text>
        <Text style={[gc.cardSub, { color: t.textMuted }]}>out of 10</Text>
      </View>
      {GRAMMAR_LEVELS_META.map((lvl) => {
        const scores: number[] = [];
        lvl.chapters.forEach(ch => {
          const results = practiceProgress.chapters[ch.id];
          if (results) results.forEach((r: LevelResult) => { if (r.attempts > 0) scores.push(r.bestScore); });
        });
        if (scores.length === 0) {
          return (
            <View key={lvl.id} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: "800", color: lvl.color }}>{lvl.label}</Text>
                <Text style={{ fontSize: 11, fontWeight: "600", color: t.textMuted }}>No data</Text>
              </View>
              <View style={{ height: 10, backgroundColor: t.border, borderRadius: 5 }} />
            </View>
          );
        }
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        const pct = (avg / 10) * 100;
        return (
          <View key={lvl.id} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: "800", color: lvl.color }}>{lvl.label}</Text>
              <Text style={{ fontSize: 12, fontWeight: "900", color: lvl.color }}>{avg.toFixed(1)}</Text>
            </View>
            <View style={{ height: 10, backgroundColor: t.border, borderRadius: 5, overflow: "hidden" }}>
              <View style={{ width: `${pct}%`, height: 10, backgroundColor: lvl.color, borderRadius: 5 }} />
            </View>
            <Text style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>{scores.length} levels attempted</Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── PRACTICE: Attempts distribution ─────────────────────────────────────────
function PracticeAttemptsChart({ practiceProgress, t }: { practiceProgress: PracticeProgress; t: any }) {
  const counts = [0, 0, 0, 0, 0];
  let total = 0;

  ALL_CHAPTERS.forEach(ch => {
    const results = practiceProgress.chapters[ch.id];
    if (!results) return;
    results.forEach((r: LevelResult) => {
      if (!r.passed || r.attempts === 0) return;
      total++;
      const idx = Math.min(r.attempts - 1, 4);
      counts[idx]++;
    });
  });

  if (total === 0) return null;

  const maxCount = Math.max(...counts, 1);
  const labels = ["1st try", "2nd", "3rd", "4th", "5+"];
  const colors = ["#22C55E", "#4ADE80", "#F59E0B", "#FB923C", "#EF4444"];

  return (
    <View style={[gc.card, { backgroundColor: t.surface, borderColor: t.border }]}>
      <View style={gc.cardHeader}>
        <TrendingUp size={16} color="#22C55E" strokeWidth={2.5} />
        <Text style={[gc.cardTitle, { color: t.text }]}>Attempts to Pass</Text>
        <Text style={[gc.cardSub, { color: t.textMuted }]}>{total} levels passed</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "flex-end", height: 100, gap: 8 }}>
        {counts.map((count, i) => {
          const barH = maxCount > 0 ? Math.max((count / maxCount) * 80, count > 0 ? 6 : 0) : 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <View key={i} style={{ flex: 1, alignItems: "center", gap: 3 }}>
              <Text style={{ fontSize: 10, fontWeight: "900", color: colors[i] }}>{pct > 0 ? `${pct}%` : ""}</Text>
              <View style={{ width: "80%", height: barH, backgroundColor: colors[i], borderRadius: 4 }} />
              <Text style={{ fontSize: 9, fontWeight: "700", color: t.textMuted }}>{labels[i]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── PRACTICE: Top performers & most struggled ───────────────────────────────
function PracticeLeaderboard({ practiceProgress, t }: { practiceProgress: PracticeProgress; t: any }) {
  type ChapterScore = { ch: typeof ALL_CHAPTERS[0]; avgBest: number; passedCount: number };
  const scored: ChapterScore[] = ALL_CHAPTERS.map(ch => {
    const results = practiceProgress.chapters[ch.id] ?? [];
    const attempted = results.filter((r: LevelResult) => r.attempts > 0);
    if (attempted.length === 0) return null;
    const avgBest = attempted.reduce((s: number, r: LevelResult) => s + r.bestScore, 0) / attempted.length;
    const passedCount = results.filter((r: LevelResult) => r.passed).length;
    return { ch, avgBest, passedCount };
  }).filter(Boolean) as ChapterScore[];

  if (scored.length === 0) return null;

  const top = [...scored].sort((a, b) => b.avgBest - a.avgBest).slice(0, 4);
  const bottom = [...scored].sort((a, b) => a.avgBest - b.avgBest).slice(0, 4);

  return (
    <View style={{ gap: 12 }}>
      <View style={[gc.card, { backgroundColor: t.surface, borderColor: t.border }]}>
        <View style={gc.cardHeader}>
          <TrendingUp size={16} color="#22C55E" strokeWidth={2.5} />
          <Text style={[gc.cardTitle, { color: t.text }]}>Practice Strengths</Text>
        </View>
        {top.map(({ ch, avgBest }) => (
          <View key={ch.id} style={gc.strengthRow}>
            <Text style={[gc.strTitle, { color: t.text }]} numberOfLines={1}>{ch.number}. {ch.title}</Text>
            <View style={{ flex: 1, marginHorizontal: 8 }}>
              <View style={[gc.miniBar, { backgroundColor: t.border }]}>
                <View style={[gc.miniBarFill, { backgroundColor: "#22C55E", width: `${(avgBest / 10) * 100}%` as any }]} />
              </View>
            </View>
            <Text style={[gc.strAcc, { color: "#22C55E" }]}>{avgBest.toFixed(1)}</Text>
          </View>
        ))}
      </View>
      <View style={[gc.card, { backgroundColor: t.surface, borderColor: t.border }]}>
        <View style={gc.cardHeader}>
          <TrendingDown size={16} color="#EF4444" strokeWidth={2.5} />
          <Text style={[gc.cardTitle, { color: t.text }]}>Needs More Practice</Text>
        </View>
        {bottom.map(({ ch, avgBest }) => (
          <View key={ch.id} style={gc.strengthRow}>
            <Text style={[gc.strTitle, { color: t.text }]} numberOfLines={1}>{ch.number}. {ch.title}</Text>
            <View style={{ flex: 1, marginHorizontal: 8 }}>
              <View style={[gc.miniBar, { backgroundColor: t.border }]}>
                <View style={[gc.miniBarFill, { backgroundColor: "#EF4444", width: `${(avgBest / 10) * 100}%` as any }]} />
              </View>
            </View>
            <Text style={[gc.strAcc, { color: "#EF4444" }]}>{avgBest.toFixed(1)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── PRACTICE: Mini stat tiles ────────────────────────────────────────────────
function PracticeMiniStats({ practiceProgress, t }: { practiceProgress: PracticeProgress; t: any }) {
  let totalLevelsPassed = 0, totalAttempts = 0, totalLevelsAttempted = 0, perfectLevels = 0;
  ALL_CHAPTERS.forEach(ch => {
    const results = practiceProgress.chapters[ch.id] ?? [];
    results.forEach((r: LevelResult) => {
      if (r.attempts > 0) {
        totalAttempts += r.attempts;
        totalLevelsAttempted++;
        if (r.passed) totalLevelsPassed++;
        if (r.bestScore === 10) perfectLevels++;
      }
    });
  });

  if (totalLevelsAttempted === 0) return null;

  const GRAMMAR_COLOR = "#A855F7";
  const tiles = [
    { label: "Levels Passed", val: totalLevelsPassed, color: "#22C55E" },
    { label: "Attempts", val: totalAttempts, color: GRAMMAR_COLOR },
    { label: "Attempted", val: totalLevelsAttempted, color: "#1CB0F6" },
    { label: "Perfect 10s", val: perfectLevels, color: "#F59E0B" },
  ];

  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      {tiles.map(({ label, val, color }) => (
        <View key={label} style={[gc.miniStat, { backgroundColor: t.surface, borderColor: t.border }]}>
          <Text style={[gc.miniVal, { color }]}>{val}</Text>
          <Text style={[gc.miniLbl, { color: t.textMuted }]}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Grammar analytics dashboard ──────────────────────────────────────────────
function GrammarDashboard() {
  const { theme: t } = useTheme();
  const GRAMMAR_COLOR = "#A855F7";

  const [gp, setGp] = useState<import("../../lib/grammarProgress").GrammarProgress | null>(null);
  const [practiceProgress, setPracticeProgress] = useState<PracticeProgress>({ chapters: {} });
  const [refreshKey, setRefreshKey] = useState(0);

  useShellTopBar({
    left: (
      <>
        <Brain size={22} color={GRAMMAR_COLOR} strokeWidth={2.5} />
        <Text style={{ fontSize: 20, fontWeight: "900", color: t.text }}>Grammar</Text>
      </>
    ),
    accent: GRAMMAR_COLOR,
  });

  useEffect(() => {
    loadGrammarProgress().then(setGp);
    loadPracticeProgress().then(setPracticeProgress);
  }, [refreshKey]);

  const handleReset = () => {
    Alert.alert(
      "Reset Grammar Progress",
      "This will clear all visits, completions, and exercise scores. Cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await resetGrammarProgress();
            setRefreshKey((k) => k + 1);
          },
        },
      ],
    );
  };

  if (!gp) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: t.textMuted, fontSize: 14 }}>Loading…</Text>
      </View>
    );
  }

  const stats = computeStats(gp);
  const hasAnyData = stats.visited > 0 || Object.keys(practiceProgress.chapters).length > 0;

  if (!hasAnyData) {
    return (
      <ScrollView contentContainerStyle={{ padding: 24, alignItems: "center", paddingBottom: 96 }}>
        <View style={{ borderRadius: 20, borderWidth: 1.5, padding: 28, alignItems: "center", gap: 12, width: "100%", backgroundColor: t.surface, borderColor: t.border }}>
          <View style={{ width: 60, height: 60, borderRadius: 18, backgroundColor: GRAMMAR_COLOR + "18", alignItems: "center", justifyContent: "center" }}>
            <LayoutDashboard size={28} color={GRAMMAR_COLOR} strokeWidth={2} />
          </View>
          <Text style={{ fontSize: 18, fontWeight: "800", color: t.text }}>No data yet</Text>
          <Text style={{ fontSize: 14, textAlign: "center", lineHeight: 20, color: t.textMuted }}>
            Open chapters to track visits. Use the Practice tab to attempt MCQ levels.
          </Text>
        </View>
      </ScrollView>
    );
  }

  const completePct = Math.round((stats.completed / stats.total) * 100);
  const visitPct = Math.round((stats.visited / stats.total) * 100);
  const accColor = stats.overallAccuracy === null ? GRAMMAR_COLOR
    : stats.overallAccuracy >= 80 ? "#22C55E"
    : stats.overallAccuracy >= 60 ? "#F59E0B" : "#EF4444";

  // Practice ring calculation
  let totalPassed = 0, totalAvailable = 0;
  ALL_CHAPTERS.forEach(ch => {
    const hasData = PRACTICE_DATA.find(p => p.chapterId === ch.id);
    if (hasData) {
      totalAvailable += 10;
      const results = practiceProgress.chapters[ch.id] ?? [];
      totalPassed += results.filter((r: LevelResult) => r.passed).length;
    }
  });
  const practicePct = totalAvailable > 0 ? Math.round((totalPassed / totalAvailable) * 100) : 0;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 96 }}>

      {/* ── Activity Graph ── */}
      <View style={[gc.card, { backgroundColor: t.surface, borderColor: t.border }]}>
        <View style={gc.cardHeader}>
          <Activity size={16} color="#22C55E" strokeWidth={2.5} />
          <Text style={[gc.cardTitle, { color: t.text }]}>Grammar Activity</Text>
          <Text style={[gc.cardSub, { color: t.textMuted }]}>{stats.activeDays ?? 0} active days</Text>
        </View>
        <GrammarActivityGraph data={stats.weeklyActivity ?? []} t={t} />
      </View>

      {/* ── 3 Rings: Completion, Accuracy, Practice ── */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={[gc.ringCard, { backgroundColor: t.surface, borderColor: t.border }]}>
          <RadialRing pct={completePct} size={90} stroke={8} color="#22C55E" label={`${completePct}%`} sublabel={`${stats.completed}/${stats.total}\ndone`} t={t} />
          <Text style={[gc.ringLabel, { color: t.text, fontSize: 11 }]}>Completed</Text>
        </View>
        <View style={[gc.ringCard, { backgroundColor: t.surface, borderColor: t.border }]}>
          <RadialRing pct={stats.overallAccuracy ?? 0} size={90} stroke={8} color={accColor} label={stats.overallAccuracy !== null ? `${stats.overallAccuracy}%` : "—"} sublabel={stats.overallAccuracy !== null ? "accuracy" : "no data"} t={t} />
          <Text style={[gc.ringLabel, { color: t.text, fontSize: 11 }]}>Accuracy</Text>
        </View>
        <View style={[gc.ringCard, { backgroundColor: t.surface, borderColor: t.border }]}>
          <RadialRing pct={practicePct} size={90} stroke={8} color={GRAMMAR_COLOR} label={`${practicePct}%`} sublabel={`${totalPassed}/${totalAvailable}\nlevels`} t={t} />
          <Text style={[gc.ringLabel, { color: t.text, fontSize: 11 }]}>Practice</Text>
        </View>
      </View>

      {/* ── 4 learn mini stats ── */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        {[
          { Icon: CheckCircle2, val: stats.completed, lbl: "Completed", color: "#22C55E" },
          { Icon: BookOpen,     val: stats.visited,   lbl: "Visited",   color: GRAMMAR_COLOR },
          { Icon: Target,       val: stats.withScores, lbl: "Practiced", color: "#1CB0F6" },
          { Icon: TrendingUp,   val: stats.strengths.length, lbl: "Strong", color: "#F59E0B" },
        ].map(({ Icon, val, lbl, color }) => (
          <View key={lbl} style={[gc.miniStat, { backgroundColor: t.surface, borderColor: t.border }]}>
            <Icon size={16} color={color} strokeWidth={2.5} />
            <Text style={[gc.miniVal, { color }]}>{val}</Text>
            <Text style={[gc.miniLbl, { color: t.textMuted }]}>{lbl}</Text>
          </View>
        ))}
      </View>

      {/* ── Practice mini stats ── */}
      <PracticeMiniStats practiceProgress={practiceProgress} t={t} />

      {/* ── LEARN section label ── */}
      {stats.visited > 0 && (
        <Text style={[gc.sectionLabel, { color: t.textMuted }]}>— LEARN PROGRESS —</Text>
      )}

      {/* ── Completion progress bar ── */}
      {stats.visited > 0 && (
        <View style={[gc.card, { backgroundColor: t.surface, borderColor: t.border }]}>
          <View style={gc.cardHeader}>
            <View style={[gc.levelBadge, { backgroundColor: GRAMMAR_COLOR + "20" }]}>
              <Text style={[gc.levelBadgeTxt, { color: GRAMMAR_COLOR }]}>A1–B1</Text>
            </View>
            <Text style={[gc.cardTitle, { color: t.text }]}>Completion</Text>
            <Text style={[gc.pctBadge, { color: "#22C55E" }]}>{completePct}%</Text>
          </View>
          <AnimatedProgressBar pct={completePct} color="#22C55E" t={t} />
          <Text style={[gc.barSub, { color: t.textMuted }]}>
            {stats.completed} marked done · {stats.visited} visited · {stats.total} total
          </Text>
        </View>
      )}

      {/* ── Score distribution ── */}
      <AccuracyDistribution progress={gp} t={t} />

      {/* ── Per-chapter bar chart ── */}
      <AccuracyBarChart progress={gp} t={t} />

      {/* ── Visit heatmap ── */}
      <VisitHeatmap progress={gp} t={t} />

      {/* ── Timeline ── */}
      <ProgressTimeline progress={gp} t={t} />

      {/* ── Strengths ── */}
      {stats.strengths.length > 0 && (
        <View style={[gc.card, { backgroundColor: t.surface, borderColor: t.border }]}>
          <View style={gc.cardHeader}>
            <TrendingUp size={16} color="#22C55E" strokeWidth={2.5} />
            <Text style={[gc.cardTitle, { color: t.text }]}>Top Strengths</Text>
          </View>
          {stats.strengths.map((ch) => {
            const acc = stats.accuracy(ch.id) ?? 0;
            return (
              <View key={ch.id} style={gc.strengthRow}>
                <Text style={[gc.strTitle, { color: t.text }]}>{ch.number}. {ch.title}</Text>
                <View style={{ flex: 1, marginHorizontal: 10 }}>
                  <View style={[gc.miniBar, { backgroundColor: t.border }]}>
                    <View style={[gc.miniBarFill, { backgroundColor: "#22C55E", width: `${acc}%` as any }]} />
                  </View>
                </View>
                <Text style={[gc.strAcc, { color: "#22C55E" }]}>{acc}%</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* ── Weaknesses ── */}
      {stats.weaknesses.length > 0 && (
        <View style={[gc.card, { backgroundColor: t.surface, borderColor: t.border }]}>
          <View style={gc.cardHeader}>
            <TrendingDown size={16} color="#EF4444" strokeWidth={2.5} />
            <Text style={[gc.cardTitle, { color: t.text }]}>Needs Work</Text>
          </View>
          {stats.weaknesses.map((ch) => {
            const acc = stats.accuracy(ch.id) ?? 0;
            return (
              <View key={ch.id} style={gc.strengthRow}>
                <Text style={[gc.strTitle, { color: t.text }]}>{ch.number}. {ch.title}</Text>
                <View style={{ flex: 1, marginHorizontal: 10 }}>
                  <View style={[gc.miniBar, { backgroundColor: t.border }]}>
                    <View style={[gc.miniBarFill, { backgroundColor: "#EF4444", width: `${acc}%` as any }]} />
                  </View>
                </View>
                <Text style={[gc.strAcc, { color: "#EF4444" }]}>{acc}%</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* ── PRACTICE section label ── */}
      <Text style={[gc.sectionLabel, { color: t.textMuted }]}>— PRACTICE PROGRESS —</Text>

      {/* ── Practice rings per CEFR ── */}
      <PracticeLevelOverview practiceProgress={practiceProgress} t={t} />

      {/* ── Avg score bars per CEFR ── */}
      <PracticeCEFRScoreBar practiceProgress={practiceProgress} t={t} />

      {/* ── Chapter level pass bars ── */}
      <PracticeChapterBars practiceProgress={practiceProgress} t={t} />

      {/* ── Score heatmap ── */}
      <PracticeScoreHeatmap practiceProgress={practiceProgress} t={t} />

      {/* ── Attempts to pass chart ── */}
      <PracticeAttemptsChart practiceProgress={practiceProgress} t={t} />

      {/* ── Practice strengths / needs work ── */}
      <PracticeLeaderboard practiceProgress={practiceProgress} t={t} />

      {/* ── Reset button ── */}
      <TouchableOpacity
        style={[gc.resetBtn, { borderColor: "#EF444440" }]}
        onPress={handleReset}
        activeOpacity={0.8}
      >
        <RefreshCw size={16} color="#EF4444" strokeWidth={2.5} />
        <Text style={gc.resetTxt}>Reset grammar progress</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

// ─── Main Home Screen ──────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const { mode } = useAppMode();
  if (mode === "learn")   return <LearnDashboard />;
  if (mode === "grammar") return <GrammarDashboard />;
  if (mode === "exam")    return <ExamNavigator />;
  return <HomeScreen />;
}

// ─── Learn Analytics Dashboard ────────────────────────────────────────────────
function LearnDashboard() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const LEARN_COLOR = "#1CB0F6";

  const [lp, setLp] = useState<LearnProgress | null>(null);

  useShellTopBar({
    left: (
      <>
        <GraduationCap size={22} color={LEARN_COLOR} strokeWidth={2.5} />
        <Text style={{ fontSize: 20, fontWeight: "900", color: t.text }}>Learn</Text>
      </>
    ),
    accent: LEARN_COLOR,
  });

  useEffect(() => {
    loadLearnProgress().then(setLp);
  }, []);

  // ── Compute stats ──
  const stats = useMemo(() => {
    if (!lp) return null;
    const allChapters = CEFR_LEVELS.flatMap((cl) => cl.units.flatMap((u) => u.chapters));
    const totalChapters = allChapters.length;
    const totalLevels = totalChapters * LEVELS_PER_CHAPTER;

    let levelsCompleted = 0;
    let chaptersStarted = 0;
    let chaptersCompleted = 0;
    let totalScore = 0;
    let totalAttempts = 0;

    for (const ch of allChapters) {
      const chProg = lp.chapters[ch.chapterId];
      if (!chProg) continue;
      const lvls = Object.values(chProg.levels);
      const done = lvls.filter((l) => l.completed).length;
      if (done > 0) chaptersStarted++;
      if (isChapterComplete(lp, ch.chapterId)) chaptersCompleted++;
      levelsCompleted += done;
      for (const l of lvls) {
        if (l.attempts > 0) {
          totalScore += l.score;
          totalAttempts += l.attempts;
        }
      }
    }

    const overallPct = totalLevels > 0 ? Math.round((levelsCompleted / totalLevels) * 100) : 0;
    const avgScore = totalAttempts > 0 ? Math.round((totalScore / (totalAttempts * 10)) * 100) : null;

    // Per-CEFR stats
    const cefrStats = CEFR_LEVELS.map((cl) => {
      const chaps = cl.units.flatMap((u) => u.chapters);
      const total = chaps.length * LEVELS_PER_CHAPTER;
      let done = 0;
      let started = 0;
      let completed = 0;
      for (const ch of chaps) {
        const n = getChapterLevelsCompleted(lp, ch.chapterId);
        done += n;
        if (n > 0) started++;
        if (isChapterComplete(lp, ch.chapterId)) completed++;
      }
      return { id: cl.id, label: cl.id, color: cl.color, chapsTotal: chaps.length, chapsStarted: started, chapsCompleted: completed, levelsDone: done, levelsTotal: total };
    });

    return { totalChapters, chaptersStarted, chaptersCompleted, levelsCompleted, totalLevels, overallPct, avgScore, cefrStats };
  }, [lp]);

  const hasData = stats && stats.chaptersStarted > 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── 4 stat tiles ── */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        {[
          { num: stats?.totalChapters ?? 0,    label: "Chapters",  color: LEARN_COLOR },
          { num: stats?.chaptersStarted ?? 0,  label: "Started",   color: "#A855F7" },
          { num: stats?.chaptersCompleted ?? 0,label: "Completed", color: "#22C55E" },
          { num: stats?.avgScore != null ? `${stats.avgScore}%` : "—", label: "Avg Score", color: "#F59E0B" },
        ].map(({ num, label, color }) => (
          <View key={label} style={{ flex: 1, borderRadius: 14, backgroundColor: t.surface, padding: 10, alignItems: "center", borderWidth: 1, borderColor: t.border }}>
            <Text style={{ fontSize: 17, fontWeight: "900", color }}>{num}</Text>
            <Text style={{ fontSize: 9, fontWeight: "700", color: t.textMuted, textAlign: "center", marginTop: 1 }}>{label}</Text>
          </View>
        ))}
      </View>

      {/* ── XP + Streak ── */}
      {lp && (lp.xp > 0 || lp.streak > 0) && (
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
          <View style={{ flex: 1, borderRadius: 16, backgroundColor: t.surface, padding: 14, borderWidth: 1, borderColor: t.border, alignItems: "center", flexDirection: "row", gap: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#F59E0B20", alignItems: "center", justifyContent: "center" }}>
              <Zap size={18} color="#F59E0B" strokeWidth={2.5} />
            </View>
            <View>
              <Text style={{ fontSize: 22, fontWeight: "900", color: "#F59E0B" }}>{lp.xp}</Text>
              <Text style={{ fontSize: 10, fontWeight: "700", color: t.textMuted }}>Total XP</Text>
            </View>
          </View>
          <View style={{ flex: 1, borderRadius: 16, backgroundColor: t.surface, padding: 14, borderWidth: 1, borderColor: t.border, alignItems: "center", flexDirection: "row", gap: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#FF4B4B20", alignItems: "center", justifyContent: "center" }}>
              <Flame size={18} color="#FF4B4B" strokeWidth={2.5} />
            </View>
            <View>
              <Text style={{ fontSize: 22, fontWeight: "900", color: "#FF4B4B" }}>{lp.streak}</Text>
              <Text style={{ fontSize: 10, fontWeight: "700", color: t.textMuted }}>Day Streak</Text>
            </View>
          </View>
        </View>
      )}

      {/* ── Overall progress bar ── */}
      {stats && (
        <View style={{ borderRadius: 18, backgroundColor: t.surface, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: t.border }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: LEARN_COLOR + "20", alignItems: "center", justifyContent: "center" }}>
                <TrendingUp size={15} color={LEARN_COLOR} strokeWidth={2.5} />
              </View>
              <Text style={{ fontSize: 14, fontWeight: "800", color: t.text }}>Overall Progress</Text>
            </View>
            <Text style={{ fontSize: 18, fontWeight: "900", color: LEARN_COLOR }}>{stats.overallPct}%</Text>
          </View>
          <View style={{ height: 10, borderRadius: 5, backgroundColor: t.border, overflow: "hidden" }}>
            <View style={{ height: 10, borderRadius: 5, backgroundColor: LEARN_COLOR, width: `${stats.overallPct}%` as any }} />
          </View>
          <Text style={{ fontSize: 11, color: t.textMuted, marginTop: 8 }}>
            {stats.levelsCompleted} / {stats.totalLevels} lessons completed
          </Text>
        </View>
      )}

      {/* ── Per-CEFR progress ── */}
      <View style={{ borderRadius: 18, backgroundColor: t.surface, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: t.border }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: LEARN_COLOR + "20", alignItems: "center", justifyContent: "center" }}>
            <Layers size={15} color={LEARN_COLOR} strokeWidth={2.5} />
          </View>
          <Text style={{ fontSize: 14, fontWeight: "800", color: t.text }}>Level Progress</Text>
        </View>
        <View style={{ gap: 18 }}>
          {(stats?.cefrStats ?? []).map((cl) => {
            const startedPct   = cl.chapsTotal > 0 ? (cl.chapsStarted   / cl.chapsTotal) * 100 : 0;
            const completedPct = cl.chapsTotal > 0 ? (cl.chapsCompleted / cl.chapsTotal) * 100 : 0;
            return (
              <TouchableOpacity key={cl.id} onPress={() => router.push("/(tabs)/words")} activeOpacity={0.75}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View style={{ backgroundColor: cl.color + "20", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Text style={{ fontSize: 11, fontWeight: "900", color: cl.color }}>{cl.label}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 11, color: t.textMuted }}>{cl.chapsTotal} chapters</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <Text style={{ width: 62, fontSize: 10, color: t.textMuted, fontWeight: "600" }}>Started</Text>
                  <View style={{ flex: 1, height: 7, borderRadius: 4, backgroundColor: t.border, overflow: "hidden" }}>
                    <View style={{ height: 7, borderRadius: 4, backgroundColor: LEARN_COLOR, width: `${startedPct}%` as any }} />
                  </View>
                  <Text style={{ width: 26, fontSize: 10, color: LEARN_COLOR, fontWeight: "700", textAlign: "right" }}>{cl.chapsStarted}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ width: 62, fontSize: 10, color: t.textMuted, fontWeight: "600" }}>Completed</Text>
                  <View style={{ flex: 1, height: 7, borderRadius: 4, backgroundColor: t.border, overflow: "hidden" }}>
                    <View style={{ height: 7, borderRadius: 4, backgroundColor: "#22C55E", width: `${completedPct}%` as any }} />
                  </View>
                  <Text style={{ width: 26, fontSize: 10, color: "#22C55E", fontWeight: "700", textAlign: "right" }}>{cl.chapsCompleted}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Average Score card ── */}
      {stats?.avgScore != null && (
        <View style={{ borderRadius: 18, backgroundColor: t.surface, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: t.border }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#F59E0B20", alignItems: "center", justifyContent: "center" }}>
              <Target size={15} color="#F59E0B" strokeWidth={2.5} />
            </View>
            <Text style={{ fontSize: 14, fontWeight: "800", color: t.text }}>Lesson Score</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 14 }}>
            <View style={{ flex: 1, backgroundColor: "#F59E0B15", borderRadius: 12, padding: 14, alignItems: "center" }}>
              <Text style={{ fontSize: 32, fontWeight: "900", color: "#F59E0B" }}>{stats.avgScore}%</Text>
              <Text style={{ fontSize: 10, fontWeight: "700", color: t.textMuted, marginTop: 2 }}>average score</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: LEARN_COLOR + "15", borderRadius: 12, padding: 14, alignItems: "center" }}>
              <Text style={{ fontSize: 32, fontWeight: "900", color: LEARN_COLOR }}>{stats.levelsCompleted}</Text>
              <Text style={{ fontSize: 10, fontWeight: "700", color: t.textMuted, marginTop: 2 }}>lessons done</Text>
            </View>
          </View>
          <View style={{ height: 10, borderRadius: 5, backgroundColor: t.border, overflow: "hidden" }}>
            <View style={{ height: 10, borderRadius: 5, backgroundColor: "#F59E0B", width: `${stats.avgScore}%` as any }} />
          </View>
        </View>
      )}

      {/* ── Empty state ── */}
      {!hasData && stats && (
        <View style={{ borderRadius: 18, backgroundColor: t.surface, padding: 28, alignItems: "center", borderWidth: 1, borderColor: t.border, marginTop: 4 }}>
          <Text style={{ fontSize: 36, marginBottom: 10 }}>🎓</Text>
          <Text style={{ fontSize: 16, fontWeight: "800", color: t.text, textAlign: "center" }}>Start your learn journey</Text>
          <Text style={{ fontSize: 13, color: t.textMuted, textAlign: "center", marginTop: 6, lineHeight: 19 }}>
            Complete lessons from the Lessons tab — your stats will appear here.
          </Text>
          <TouchableOpacity
            style={{ marginTop: 16, backgroundColor: LEARN_COLOR, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }}
            onPress={() => router.push("/(tabs)/words")}
            activeOpacity={0.8}
          >
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}>Go to Lessons</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

function HomeScreen() {
  const router = useRouter();
  const { theme: t } = useTheme();
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  const basicStats = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await api.stats.$get();
      if (!res.ok) throw new Error("stats failed");
      return res.json();
    },
    staleTime: 15_000,
    gcTime: 15 * 60_000,
  });

  const dashboard = useQuery({
    queryKey: ["stats", "dashboard"],
    queryFn: async () => {
      const res = await api.stats.dashboard.$get();
      if (!res.ok) throw new Error("dashboard failed");
      return res.json();
    },
    staleTime: 15_000,
    gcTime: 15 * 60_000,
  });

  // Refetch stats every time this tab comes into focus
  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    }, [queryClient])
  );

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["stats"] });
  }, [queryClient]);

  const isLoading = basicStats.isFetching;
  const data = basicStats.data;
  const dash = dashboard.data && 'cardStates' in (dashboard.data as any) ? dashboard.data : undefined;

  useShellTopBar({
    left: (
      <>
        <DeutschForgeMascot mood={(data?.streak ?? 0) > 0 ? "happy" : "neutral"} size={34} />
        <View>
          <Text style={[styles.greeting, { color: t.textMuted }]}>Guten Tag!</Text>
          <Text style={[styles.userName, { color: t.text }]}>{session?.user?.name ?? "Learner"}</Text>
        </View>
      </>
    ),
    accent: t.primary,
  });

  return (
    <View style={[styles.safe, { backgroundColor: t.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={t.primary} />
        }
      >

        {/* ── Streak + XP ── */}
        <View style={styles.row}>
          <StreakBadge streak={data?.streak ?? 0} t={t} />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <XPBar
              xp={data?.xp ?? 0}
              xpForCurrentLevel={data?.xpForCurrentLevel ?? 0}
              xpForNextLevel={data?.xpForNextLevel ?? 100}
              level={data?.level ?? 1}
              t={t}
            />
          </View>
        </View>

        {/* ── Top stats row ── */}
        <View style={styles.statsRow}>
          {[
            { num: data?.wordCount ?? 0, label: "Words", color: t.primary },
            { num: data?.totalReviews ?? 0, label: "Reviews", color: "#1CB0F6" },
            { num: data?.longestStreak ?? 0, label: "Best Streak", color: "#FF4B4B" },
            { num: dash?.masteryPct ?? 0, label: "Mastery %", color: "#22C55E" },
          ].map(({ num, label, color }) => (
            <View key={label} style={[styles.statCard, { backgroundColor: t.surface }]}>
              <Text style={[styles.statNum, { color }]}>{num}</Text>
              <Text style={[styles.statLabel, { color: t.textMuted }]}>{label}</Text>
            </View>
          ))}
        </View>

        {/* ── Daily goal ── */}
        <View style={[card.wrap, { backgroundColor: t.surface, borderColor: t.border }]}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Target size={16} color={t.primary} strokeWidth={2.5} />
              <Text style={{ fontSize: 14, fontWeight: "800", color: t.text }}>Daily Goal</Text>
            </View>
            <Text style={{ fontSize: 13, fontWeight: "800", color: t.primary }}>
              {data?.todayReviews ?? 0} / {data?.dailyGoal ?? 20}
            </Text>
          </View>
          <AnimBar
            pct={Math.min(((data?.todayReviews ?? 0) / (data?.dailyGoal ?? 20)) * 100, 100)}
            color={t.primary}
            height={10}
          />
          {(data?.todayReviews ?? 0) >= (data?.dailyGoal ?? 20) && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 }}>
              <CheckCircle2 size={14} color="#22C55E" strokeWidth={2} />
              <Text style={{ fontSize: 12, color: "#22C55E", fontWeight: "700" }}>Goal complete!</Text>
            </View>
          )}
        </View>

        {/* ── Activity Graph (GitHub style) ── */}
        {dash?.weeklyActivity && (
          <View style={[card.wrap, { backgroundColor: t.surface, borderColor: t.border }]}>
            <ActivityGraph data={dash.weeklyActivity} t={t} />
          </View>
        )}

        {/* ── Mastery ring + Gender ── */}
        {dash && (
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={[card.wrap, { backgroundColor: t.surface, borderColor: t.border, flex: 1, alignItems: "center" }]}>
              <SectionTitle icon={Award} title="Mastery" color="#22C55E" t={t} />
              <MasteryRing pct={dash.masteryPct} mastered={dash.masteredCount} total={dash.cardStates ? Object.values(dash.cardStates).reduce((s: number, v: any) => s + v, 0) : 0} t={t} />
            </View>
            {dash.genderBreakdown && (
              <View style={[card.wrap, { backgroundColor: t.surface, borderColor: t.border, flex: 1 }]}>
                <SectionTitle icon={BookOpen} title="Gender" color="#1CB0F6" t={t} />
                <View style={{ gap: 6 }}>
                  {Object.entries(dash.genderBreakdown).filter(([, v]) => v > 0).map(([g, cnt]) => {
                    const color = GENDER_COLORS[g] ?? "#888";
                    const total = Object.values(dash.genderBreakdown).reduce((s: number, v: any) => s + v, 0);
                    const pct = total > 0 ? Math.round((cnt as number / total) * 100) : 0;
                    return (
                      <View key={g}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                          <Text style={{ fontSize: 10, fontWeight: "800", color, textTransform: "capitalize" }}>{g}</Text>
                          <Text style={{ fontSize: 10, color: t.textMuted }}>{cnt as number}</Text>
                        </View>
                        <AnimBar pct={pct} color={color} height={6} />
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── 14-day review chart ── */}
        {dash?.dailyReviews && (
          <View style={[card.wrap, { backgroundColor: t.surface, borderColor: t.border }]}>
            <DailySparkline data={dash.dailyReviews} t={t} />
          </View>
        )}

        {/* ── Card states ── */}
        {dash?.cardStates && (
          <View style={[card.wrap, { backgroundColor: t.surface, borderColor: t.border }]}>
            <CardStates states={dash.cardStates} t={t} />
          </View>
        )}

        {/* ── Hard words ── */}
        {dash?.hardWords && dash.hardWords.length > 0 && (
          <View style={[card.wrap, { backgroundColor: t.surface, borderColor: t.border }]}>
            <HardWords words={dash.hardWords} t={t} router={router} />
            {dash.hardWords.length > 8 && (
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/words")}
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingTop: 8 }}
              >
                <Text style={{ fontSize: 13, color: "#EF4444", fontWeight: "700" }}>View all {dash.hardWords.length} hard words</Text>
                <ChevronRight size={14} color="#EF4444" strokeWidth={2.5} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── CEFR Breakdown ── */}
        {dash?.cefrBreakdown && (
          <View style={[card.wrap, { backgroundColor: t.surface, borderColor: t.border }]}>
            <CEFRBreakdown data={dash.cefrBreakdown} total={dash.totalWords} t={t} />
          </View>
        )}

        {/* ── POS breakdown ── */}
        {dash?.posBreakdown && (
          <View style={[card.wrap, { backgroundColor: t.surface, borderColor: t.border }]}>
            <POSBreakdown data={dash.posBreakdown} total={dash.totalWords} t={t} />
          </View>
        )}

        {/* ── Rating distribution ── */}
        {dash?.ratingDistribution && (
          <View style={[card.wrap, { backgroundColor: t.surface, borderColor: t.border }]}>
            <RatingDist data={dash.ratingDistribution} t={t} />
          </View>
        )}

        {/* ── Words added chart ── */}
        {dash?.dailyWordsAdded && (
          <View style={[card.wrap, { backgroundColor: t.surface, borderColor: t.border }]}>
            <SectionTitle icon={TrendingUp} title="Words Added — 14 Days" color="#F59E0B" t={t} />
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 3, height: 60 }}>
              {dash.dailyWordsAdded.map((d: any) => {
                const max = Math.max(...dash.dailyWordsAdded.map((x: any) => x.count), 1);
                const h = Math.max((d.count / max) * 56, d.count > 0 ? 4 : 2);
                const isToday = d.date === new Date().toISOString().split("T")[0];
                return (
                  <View key={d.date} style={{ flex: 1, alignItems: "center" }}>
                    <View style={{ width: "100%", height: h, borderRadius: 3, backgroundColor: isToday ? t.accent : (d.count > 0 ? "#F59E0B" : t.border) }} />
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
}

const card = StyleSheet.create({
  wrap: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
});

const hw = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 10,
    gap: 10,
  },
  badge: { width: 44, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  badgeTxt: { fontSize: 16, fontWeight: "900" },
  badgeSub: { fontSize: 8, fontWeight: "700" },
  german: { fontSize: 15, fontWeight: "800" },
  english: { fontSize: 12, fontWeight: "500" },
});

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  container: { padding: 16, paddingBottom: 32 },
  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 16,
  },
  greeting: { fontSize: 13, fontWeight: "600" },
  userName: { fontSize: 22, fontWeight: "800" },
  levelChip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  levelChipText: { fontWeight: "800", fontSize: 14 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  streakBadge: {
    alignItems: "center", borderRadius: 14, padding: 12,
    minWidth: 74, shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  streakCount: { fontSize: 22, fontWeight: "800" },
  streakLabel: { fontSize: 10, fontWeight: "600" },
  xpContainer: { flex: 1 },
  xpHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  xpLevelText: { fontWeight: "800", fontSize: 14 },
  xpText: { fontWeight: "700", fontSize: 14 },
  xpNext: { fontSize: 10, marginTop: 3 },
  studyCta: {
    borderRadius: 16, padding: 14, marginBottom: 12,
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  studyCtaTitle: { fontSize: 16, fontWeight: "800" },
  studyCtaSub: { fontSize: 12 },
  studyBtn: {
    borderRadius: 14, paddingVertical: 12, paddingHorizontal: 18,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35, shadowRadius: 6, elevation: 3,
  },
  studyBtnText: { fontWeight: "800", fontSize: 14, color: "#fff" },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  statCard: {
    flex: 1, borderRadius: 14, padding: 10,
    alignItems: "center", shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 5, elevation: 1,
  },
  statNum: { fontSize: 18, fontWeight: "900" },
  statLabel: { fontSize: 9, fontWeight: "700", textAlign: "center", marginTop: 1 },
});

const gc = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1.5, padding: 16, gap: 10 },
  progTrack: { height: 10, borderRadius: 5, overflow: "hidden" },
  progFill: { height: 10, borderRadius: 5 },
  sectionLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 1.2, textAlign: "center", marginVertical: 4 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { fontSize: 14, fontWeight: "800", flex: 1 },
  cardSub: { fontSize: 11, fontWeight: "600" },
  levelBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  levelBadgeTxt: { fontSize: 11, fontWeight: "900", letterSpacing: 0.8 },
  pctBadge: { fontSize: 15, fontWeight: "900" },
  ringCard: { flex: 1, borderRadius: 18, borderWidth: 1.5, padding: 16, alignItems: "center", gap: 10 },
  ringLabel: { fontSize: 12, fontWeight: "800" },
  miniStat: { flex: 1, borderRadius: 14, borderWidth: 1.5, padding: 10, alignItems: "center", gap: 4 },
  miniVal: { fontSize: 18, fontWeight: "900" },
  miniLbl: { fontSize: 9, fontWeight: "700" },
  barSub: { fontSize: 11, fontWeight: "600" },
  stackBarWrap: { flexDirection: "row", height: 14, borderRadius: 7, overflow: "hidden" },
  stackSeg: { height: 14 },
  distLegendRow: { flexDirection: "row", gap: 16 },
  distItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  distDot: { width: 8, height: 8, borderRadius: 4 },
  distCount: { fontSize: 15, fontWeight: "900" },
  distLabel: { fontSize: 11, fontWeight: "600" },
  chartWrap: { flexDirection: "row", alignItems: "flex-end", gap: 3, paddingTop: 4, height: 160 },
  barCol: { alignItems: "center", gap: 3 },
  barPct: { fontWeight: "800" },
  barTrack: { flex: 1, width: "100%", borderRadius: 3, overflow: "hidden", justifyContent: "flex-end" },
  barFill: { width: "100%", borderRadius: 3 },
  barLabel: { fontWeight: "700" },
  legend: { flexDirection: "row", gap: 14, paddingTop: 4 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendTxt: { fontSize: 11, fontWeight: "600" },
  heatmapGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  heatCell: { alignItems: "center", justifyContent: "center" },
  heatNum: { fontWeight: "800" },
  heatLegend: { flexDirection: "row", alignItems: "center", gap: 6 },
  strengthRow: { flexDirection: "row", alignItems: "center" },
  strTitle: { fontSize: 12, fontWeight: "700", width: 100 },
  strAcc: { fontSize: 12, fontWeight: "900", width: 38, textAlign: "right" },
  miniBar: { height: 6, borderRadius: 3, overflow: "hidden" },
  miniBarFill: { height: 6, borderRadius: 3 },
  tlRow: { flexDirection: "row", gap: 12, minHeight: 48 },
  tlSpineWrap: { alignItems: "center", width: 12 },
  tlDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  tlLine: { flex: 1, width: 2, marginTop: 4, borderRadius: 1 },
  tlBody: { flex: 1, paddingBottom: 12 },
  tlTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  tlTitle: { fontSize: 13, fontWeight: "800", flex: 1, marginRight: 8 },
  tlTime: { fontSize: 11, fontWeight: "600" },
  tlMeta: { flexDirection: "row", gap: 10, marginTop: 3 },
  tlMini: { fontSize: 11, fontWeight: "600" },
  resetBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 14, borderWidth: 1.5, paddingVertical: 14, marginTop: 4,
  },
  resetTxt: { fontSize: 14, fontWeight: "700", color: "#EF4444" },
});
