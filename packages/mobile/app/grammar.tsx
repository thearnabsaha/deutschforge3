import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import {
  Activity,
  BarChart2,
  BookOpen,

  ChevronRight,

  Flame,
  LayoutDashboard,
  List,
  Lock,
  RefreshCw,
  Target,
  TrendingDown,
  TrendingUp,

  Zap,
  CheckCircle2,
  Circle,
} from "lucide-react-native";
import { useTheme } from "../lib/theme";
import { GRAMMAR_CHAPTERS, A2_GRAMMAR_CHAPTERS, B1_GRAMMAR_CHAPTERS, type GrammarChapter } from "../lib/grammarData";
import { ModeBadge } from "../lib/ModeSwitcher";
import {
  computeStats,
  loadGrammarProgress,
  resetGrammarProgress,
  type GrammarProgress,
} from "../lib/grammarProgress";

const GRAMMAR_COLOR = "#A855F7";
const SCREEN_W = Dimensions.get("window").width;

// ─── Level definitions ────────────────────────────────────────────────────────
const LEVELS = [
  {
    id: "a1",
    label: "A1",
    title: "Beginner",
    desc: "22 chapters · Pronouns to Perfekt",
    available: true,
    chapters: GRAMMAR_CHAPTERS,
  },
  {
    id: "a2",
    label: "A2",
    title: "Elementary",
    desc: "19 chapters · Prepositions to Passive Voice",
    available: true,
    chapters: A2_GRAMMAR_CHAPTERS,
  },
  {
    id: "b1",
    label: "B1",
    title: "Intermediate",
    desc: "20 chapters · Präteritum to Advanced Passiv",
    available: true,
    chapters: B1_GRAMMAR_CHAPTERS,
  },
];

// ─── Bottom tab bar ───────────────────────────────────────────────────────────
type TabId = "dashboard" | "chapters";

const TAB_META: { id: TabId; label: string; Icon: any }[] = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "chapters", label: "Chapters", Icon: List },
];

// ─── Radial ring ──────────────────────────────────────────────────────────────
function RadialRing({
  pct,
  size = 110,
  stroke = 10,
  color = GRAMMAR_COLOR,
  label,
  sublabel,
  t,
}: {
  pct: number; size?: number; stroke?: number; color?: string;
  label: string; sublabel: string; t: any;
}) {
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

// ─── Animated progress bar ────────────────────────────────────────────────────
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

// ─── Per-chapter accuracy bar chart ──────────────────────────────────────────
function AccuracyBarChart({ progress, t }: { progress: GrammarProgress; t: any }) {
  const stats = computeStats(progress);
  const chapters = GRAMMAR_CHAPTERS.filter((c) => (progress.chapters[c.id]?.exerciseAttempts ?? 0) > 0);
  if (chapters.length === 0) return null;
  const barW = Math.max(Math.floor((SCREEN_W - 64) / chapters.length) - 3, 6);

  return (
    <View style={[gc.card, { backgroundColor: t.surface, borderColor: t.border }]}>
      <View style={gc.cardHeader}>
        <BarChart2 size={16} color={GRAMMAR_COLOR} strokeWidth={2.5} />
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
function VisitHeatmap({ progress, t }: { progress: GrammarProgress; t: any }) {
  const maxVisits = Math.max(1, ...GRAMMAR_CHAPTERS.map((c) => progress.chapters[c.id]?.visitCount ?? 0));
  const cellSize = Math.floor((SCREEN_W - 64 - 11 * 6) / 11);

  return (
    <View style={[gc.card, { backgroundColor: t.surface, borderColor: t.border }]}>
      <View style={gc.cardHeader}>
        <Flame size={16} color="#F59E0B" strokeWidth={2.5} />
        <Text style={[gc.cardTitle, { color: t.text }]}>Chapter Activity</Text>
        <Text style={[gc.cardSub, { color: t.textMuted }]}>opens per chapter</Text>
      </View>
      <View style={gc.heatmapGrid}>
        {GRAMMAR_CHAPTERS.map((ch) => {
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
function AccuracyDistribution({ progress, t }: { progress: GrammarProgress; t: any }) {
  const stats = computeStats(progress);
  const withScores = GRAMMAR_CHAPTERS.filter((c) => (progress.chapters[c.id]?.exerciseAttempts ?? 0) > 0);
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
function ProgressTimeline({ progress, t }: { progress: GrammarProgress; t: any }) {
  const visited = GRAMMAR_CHAPTERS
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
              <View style={[gc.tlDot, { backgroundColor: done ? "#22C55E" : GRAMMAR_COLOR }]} />
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

// ─── Grammar activity heatmap ─────────────────────────────────────────────────
function GrammarActivityGraph({ data, t }: { data: { date: string; count: number }[]; t: any }) {
  const scrollRef = useRef<ScrollView>(null);
  const weeks: { date: string; count: number }[][] = [];
  for (let i = 0; i < data.length; i += 7) weeks.push(data.slice(i, i + 7));
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const today = new Date().toISOString().split("T")[0];
  const getColor = (count: number) => {
    if (count === 0) return t.border;
    const intensity = count / maxCount;
    if (intensity < 0.25) return "#581C87";
    if (intensity < 0.5) return "#7C3AED";
    if (intensity < 0.75) return "#A855F7";
    return "#C084FC";
  };

  // Month labels
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

  const CELL = 11; const GAP = 3;
  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
    >
      <View>
        {/* Month labels */}
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
                <View key={day.date} style={{ width: CELL, height: CELL, borderRadius: 2, backgroundColor: getColor(day.count), opacity: day.date > today ? 0.3 : 1 }} />
              ))}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Dashboard tab ────────────────────────────────────────────────────────────
function DashboardTab({ t, onReset }: { t: any; onReset: () => void }) {
  const [progress, setProgress] = useState<GrammarProgress | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadGrammarProgress().then(setProgress);
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
            onReset();
          },
        },
      ],
    );
  };

  if (!progress) {
    return (
      <View style={dash.center}>
        <Text style={[dash.muted, { color: t.textMuted }]}>Loading…</Text>
      </View>
    );
  }

  const stats = computeStats(progress);
  const hasAnyData = stats.visited > 0;

  if (!hasAnyData) {
    return (
      <ScrollView contentContainerStyle={dash.emptyWrap}>
        <View style={[dash.emptyCard, { backgroundColor: t.surface, borderColor: t.border }]}>
          <View style={[dash.emptyIcon, { backgroundColor: GRAMMAR_COLOR + "18" }]}>
            <LayoutDashboard size={28} color={GRAMMAR_COLOR} strokeWidth={2} />
          </View>
          <Text style={[dash.emptyTitle, { color: t.text }]}>No data yet</Text>
          <Text style={[dash.emptyDesc, { color: t.textMuted }]}>
            Open chapters to track visits. Mark chapters done to track completion.
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

      {/* ── Rings: Completion & Accuracy ── */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={[gc.ringCard, { backgroundColor: t.surface, borderColor: t.border }]}>
          <RadialRing pct={completePct} color="#22C55E" label={`${completePct}%`} sublabel={`${stats.completed}/${stats.total}\ncompleted`} t={t} />
          <Text style={[gc.ringLabel, { color: t.text }]}>Completed</Text>
        </View>
        <View style={[gc.ringCard, { backgroundColor: t.surface, borderColor: t.border }]}>
          <RadialRing pct={stats.overallAccuracy ?? 0} color={accColor} label={stats.overallAccuracy !== null ? `${stats.overallAccuracy}%` : "—"} sublabel={stats.overallAccuracy !== null ? "accuracy" : "no exercises"} t={t} />
          <Text style={[gc.ringLabel, { color: t.text }]}>Accuracy</Text>
        </View>
      </View>

      {/* ── 4 mini stats ── */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        {[
          { Icon: CheckCircle2, val: stats.completed, lbl: "Completed", color: "#22C55E" },
          { Icon: BookOpen, val: stats.visited, lbl: "Visited", color: GRAMMAR_COLOR },
          { Icon: Target, val: stats.withScores, lbl: "Practiced", color: "#1CB0F6" },
          { Icon: TrendingUp, val: stats.strengths.length, lbl: "Strong", color: "#F59E0B" },
        ].map(({ Icon, val, lbl, color }) => (
          <View key={lbl} style={[gc.miniStat, { backgroundColor: t.surface, borderColor: t.border }]}>
            <Icon size={16} color={color} strokeWidth={2.5} />
            <Text style={[gc.miniVal, { color }]}>{val}</Text>
            <Text style={[gc.miniLbl, { color: t.textMuted }]}>{lbl}</Text>
          </View>
        ))}
      </View>

      {/* ── Completion progress bar (done chapters) ── */}
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

      {/* ── Visited progress bar ── */}
      <View style={[gc.card, { backgroundColor: t.surface, borderColor: t.border }]}>
        <View style={gc.cardHeader}>
          <BookOpen size={14} color={GRAMMAR_COLOR} strokeWidth={2.5} />
          <Text style={[gc.cardTitle, { color: t.text }]}>Chapters Opened</Text>
          <Text style={[gc.pctBadge, { color: GRAMMAR_COLOR }]}>{visitPct}%</Text>
        </View>
        <AnimatedProgressBar pct={visitPct} color={GRAMMAR_COLOR} t={t} />
        <Text style={[gc.barSub, { color: t.textMuted }]}>{stats.visited} of {stats.total} chapters opened</Text>
      </View>

      {/* ── Score distribution ── */}
      <AccuracyDistribution progress={progress} t={t} />

      {/* ── Per-chapter bar chart ── */}
      <AccuracyBarChart progress={progress} t={t} />

      {/* ── Heatmap ── */}
      <VisitHeatmap progress={progress} t={t} />

      {/* ── Timeline ── */}
      <ProgressTimeline progress={progress} t={t} />

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

// ─── Chapters tab ─────────────────────────────────────────────────────────────
function ChapterRow({ item, t, router, progress }: { item: GrammarChapter; t: any; router: any; progress: GrammarProgress | null }) {
  const done = progress?.chapters[item.id]?.completedAt != null;
  return (
    <TouchableOpacity
      style={[row.card, { backgroundColor: t.surface, borderColor: t.border }]}
      onPress={() => router.push(`/grammar-chapter?id=${item.id}`)}
      activeOpacity={0.78}
    >
      <View style={[row.numBadge, { backgroundColor: done ? "#22C55E20" : GRAMMAR_COLOR + "20" }]}>
        {done ? (
          <CheckCircle2 size={18} color="#22C55E" strokeWidth={2.5} />
        ) : (
          <Text style={[row.numTxt, { color: GRAMMAR_COLOR }]}>{String(item.number).padStart(2, "0")}</Text>
        )}
      </View>
      <View style={row.body}>
        <Text style={[row.title, { color: t.text }]}>{item.title}</Text>
        <Text style={[row.sub, { color: t.textMuted }]}>{item.subtitle}</Text>
      </View>
      <ChevronRight size={18} color={t.border} strokeWidth={2} />
    </TouchableOpacity>
  );
}

function LevelSection({ level, t, router, progress }: { level: typeof LEVELS[number]; t: any; router: any; progress: GrammarProgress | null }) {
  return (
    <View>
      <View style={s.sectionHeader}>
        <View style={[s.levelPill, { backgroundColor: GRAMMAR_COLOR + "20" }]}>
          <Text style={[s.levelPillTxt, { color: GRAMMAR_COLOR }]}>{level.label}</Text>
        </View>
        <Text style={[s.sectionTitle, { color: t.text }]}>{level.title}</Text>
        <View style={[s.activeBadge, { backgroundColor: "#22C55E18", borderColor: "#22C55E44" }]}>
          <View style={[s.activeDot, { backgroundColor: "#22C55E" }]} />
          <Text style={[s.activeTxt, { color: "#22C55E" }]}>Available</Text>
        </View>
      </View>
      <Text style={[s.chapterCount, { color: t.textMuted }]}>
        {level.chapters?.length ?? 0} chapters
      </Text>
      {(level.chapters ?? []).map((ch) => (
        <ChapterRow key={ch.id} item={ch} t={t} router={router} progress={progress} />
      ))}
    </View>
  );
}

function ChaptersTab({ t, router, progress }: { t: any; router: any; progress: GrammarProgress | null }) {
  const availableLevels = LEVELS.filter((l) => l.available);
  const lockedLevels = LEVELS.filter((l) => !l.available);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 96 }}>
      {availableLevels.map((lvl) => (
        <LevelSection key={lvl.id} level={lvl} t={t} router={router} progress={progress} />
      ))}
      <View style={{ gap: 12, marginTop: 8 }}>
        {lockedLevels.map((lvl) => (
          <LockedLevelCard key={lvl.id} level={lvl as any} theme={t} />
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Locked level card ────────────────────────────────────────────────────────
function LockedLevelCard({ level, theme: t }: { level: { id: string; label: string; title: string; desc: string; available: boolean; preview?: string[] }; theme: any }) {
  return (
    <View style={[lc.wrap, { backgroundColor: t.surface, borderColor: t.border }]}>
      <View style={lc.header}>
        <View style={[lc.badge, { backgroundColor: GRAMMAR_COLOR + "18" }]}>
          <Lock size={16} color={GRAMMAR_COLOR} strokeWidth={2.5} />
        </View>
        <View style={lc.headerText}>
          <Text style={[lc.levelLabel, { color: GRAMMAR_COLOR }]}>{level.label}</Text>
          <Text style={[lc.levelTitle, { color: t.text }]}>{level.title}</Text>
          <Text style={[lc.levelDesc, { color: t.textMuted }]}>{level.desc}</Text>
        </View>

      </View>
      <View style={[lc.divider, { backgroundColor: t.border }]} />
      <View style={lc.previewList}>
        {level.preview?.map((item, i) => (
          <View key={i} style={lc.previewRow}>
            <View style={[lc.dot, { backgroundColor: GRAMMAR_COLOR + "60" }]} />
            <Text style={[lc.previewTxt, { color: t.textMuted }]}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function GrammarScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("chapters");
  const [progress, setProgress] = useState<GrammarProgress | null>(null);

  // Load progress once so chapters tab can show completion state
  useEffect(() => {
    loadGrammarProgress().then(setProgress);
  }, []);

  const refreshProgress = () => loadGrammarProgress().then(setProgress);

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Top bar */}
        <View style={s.topBar}>
          <View style={[s.iconWrap, { backgroundColor: GRAMMAR_COLOR + "18" }]}>
            <BookOpen size={18} color={GRAMMAR_COLOR} strokeWidth={2.5} />
          </View>
          <Text style={[s.topTitle, { color: t.text }]}>Grammar</Text>
          <ModeBadge />
        </View>

        {/* Tab content */}
        {activeTab === "dashboard" && <DashboardTab t={t} onReset={refreshProgress} />}
        {activeTab === "chapters" && <ChaptersTab t={t} router={router} progress={progress} />}
      </SafeAreaView>

      {/* Full-width bottom tab bar */}
      <SafeAreaView edges={["bottom"]} style={{ backgroundColor: t.tabBar }}>
        <View style={[btab.bar, { backgroundColor: t.tabBar, borderTopColor: t.tabBarBorder }]}>
          {TAB_META.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            const color = isActive ? GRAMMAR_COLOR : t.textMuted;
            return (
              <TouchableOpacity
                key={id}
                style={btab.tab}
                onPress={() => { setActiveTab(id); if (id === "chapters") refreshProgress(); }}
                activeOpacity={0.7}
              >
                <Icon size={22} color={color} strokeWidth={isActive ? 2.5 : 2} />
                <Text style={[btab.label, { color }]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const btab = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderTopWidth: 1,
    height: 56,
    paddingBottom: 8,
    paddingTop: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
  },
});

const s = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  topTitle: { fontSize: 17, fontWeight: "800", flex: 1 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 4,
  },
  levelPill: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  levelPillTxt: { fontSize: 12, fontWeight: "900", letterSpacing: 0.8 },
  sectionTitle: { fontSize: 16, fontWeight: "800", flex: 1 },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  activeDot: { width: 6, height: 6, borderRadius: 3 },
  activeTxt: { fontSize: 11, fontWeight: "800" },
  chapterCount: { fontSize: 12, fontWeight: "600", paddingHorizontal: 16, marginBottom: 10 },
});

const row = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    gap: 12,
  },
  numBadge: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  numTxt: { fontSize: 14, fontWeight: "900", letterSpacing: 0.5 },
  body: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: "800" },
  sub: { fontSize: 12, fontWeight: "600" },
});

const lc = StyleSheet.create({
  wrap: { marginHorizontal: 16, borderRadius: 18, borderWidth: 1.5, padding: 16, gap: 12 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  badge: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  headerText: { flex: 1, gap: 2 },
  levelLabel: { fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  levelTitle: { fontSize: 16, fontWeight: "800" },
  levelDesc: { fontSize: 12, fontWeight: "500" },
  pill: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  pillTxt: { fontSize: 11, fontWeight: "800", color: "#F59E0B" },
  divider: { height: StyleSheet.hairlineWidth },
  previewList: { gap: 8 },
  previewRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  previewTxt: { fontSize: 13, fontWeight: "500", flex: 1 },
});

const gc = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1.5, padding: 16, gap: 10 },
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
  progTrack: { height: 10, borderRadius: 5, overflow: "hidden" },
  progFill: { height: 10, borderRadius: 5 },
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 14,
    marginTop: 4,
  },
  resetTxt: { fontSize: 14, fontWeight: "700", color: "#EF4444" },
});

const dash = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  muted: { fontSize: 14 },
  emptyWrap: { padding: 24, alignItems: "center", paddingBottom: 96 },
  emptyCard: { borderRadius: 20, borderWidth: 1.5, padding: 28, alignItems: "center", gap: 12, width: "100%" },
  emptyIcon: { width: 60, height: 60, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "800" },
  emptyDesc: { fontSize: 14, textAlign: "center", lineHeight: 20 },
});


