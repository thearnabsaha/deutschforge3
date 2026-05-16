import React, { memo, useCallback, useMemo, useRef, useEffect, useState } from "react";
import {
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
import { useRouter } from "expo-router";
import { api } from "../../lib/api";
import { authClient } from "../../lib/auth";
import { useTheme } from "../../lib/theme";
import {
  Flame, CheckCircle2, Zap, Plus, TrendingUp, BookOpen,
  BarChart2, Target, Brain, Star, AlertTriangle, Activity,
  Award, ChevronRight, Layers,
} from "lucide-react-native";
import { useShellTopBar } from "../../lib/AppShell";
import { DeutschForgeMascot } from "../../components/DeutschForgeMascot";
import { useAppMode } from "../../lib/appMode";
import LearnScreen from "../learn";
import GrammarScreen from "../grammar";
import ExamNavigator from "../goethe-exam/ExamNavigator";

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

// ─── Main Home Screen ──────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const { mode } = useAppMode();
  if (mode === "learn")   return <LearnScreen />;
  if (mode === "grammar") return <GrammarScreen />;
  if (mode === "exam")    return <ExamNavigator />;
  return <HomeScreen />;
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
    staleTime: 90_000,
    gcTime: 15 * 60_000,
  });

  const dashboard = useQuery({
    queryKey: ["stats", "dashboard"],
    queryFn: async () => {
      const res = await api.stats.dashboard.$get();
      if (!res.ok) throw new Error("dashboard failed");
      return res.json();
    },
    staleTime: 3 * 60_000,
    gcTime: 15 * 60_000,
  });

  const dueCount = useQuery({
    queryKey: ["review", "count"],
    queryFn: async () => {
      const res = await api.review.count.$get();
      if (!res.ok) throw new Error("count failed");
      return res.json();
    },
    staleTime: 30_000,
    gcTime: 10 * 60_000,
  });

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["stats"] });
    queryClient.invalidateQueries({ queryKey: ["review", "count"] });
  }, [queryClient]);

  const handleStudyPress = useCallback(() => {
    if ((dueCount.data?.count ?? 0) > 0) {
      router.push("/(tabs)/study");
    } else {
      router.push("/(tabs)/words");
    }
  }, [dueCount.data?.count, router]);

  const isLoading = basicStats.isFetching || dueCount.isFetching;
  const count = dueCount.data?.count ?? 0;
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
    right: (
      <View style={[styles.levelChip, { backgroundColor: t.accent }]}>
        <Text style={[styles.levelChipText, { color: t.dark ? "#fff" : "#1F1F1F" }]}>Lv {data?.level ?? 1}</Text>
      </View>
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

        {/* ── Study CTA ── */}
        <View style={[styles.studyCta, { backgroundColor: t.surfaceAlt }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.studyCtaTitle, { color: t.text }]}>
              {count > 0 ? `${count} cards due!` : "All caught up! 🎉"}
            </Text>
            <Text style={[styles.studyCtaSub, { color: t.textMuted }]}>
              {count > 0 ? "Keep your streak alive" : "Add words to keep learning"}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.studyBtn, { backgroundColor: count === 0 ? "#1CB0F6" : t.primary }]}
            onPress={handleStudyPress}
            activeOpacity={0.85}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={styles.studyBtnText}>{count > 0 ? "Review" : "Add"}</Text>
              {count > 0 ? <Zap size={14} color="#fff" strokeWidth={2.5} /> : <Plus size={14} color="#fff" strokeWidth={2.5} />}
            </View>
          </TouchableOpacity>
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
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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
