import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { baseUrl } from "../lib/api";
import { useTheme } from "../lib/theme";
import { ArrowLeft, BarChart2, BookOpen, Flame, Zap, Trophy } from "lucide-react-native";

const { width: SCREEN_W } = Dimensions.get("window");
const CHART_W = SCREEN_W - 64; // inside card padding

const CEFR_COLORS: Record<string, string> = {
  A1: "#58CC02", A2: "#45A800",
  B1: "#1CB0F6", B2: "#0082B9",
  C1: "#CE82FF", C2: "#9B3FCF",
};

const GENDER_COLORS: Record<string, string> = {
  masculine: "#1CB0F6",
  feminine: "#FF4B4B",
  neutral: "#888888",
};

const CARD_STATE_COLORS: Record<string, string> = {
  new: "#1CB0F6",
  learning: "#FFC800",
  review: "#58CC02",
  relearning: "#FF4B4B",
};

const RATING_COLORS: Record<string, string> = {
  again: "#FF4B4B",
  hard: "#1CB0F6",
  good: "#58CC02",
  easy: "#FFC800",
};

const POS_COLORS: Record<string, string> = {
  noun: "#CE82FF", verb: "#1CB0F6", adjective: "#FFC800",
  adverb: "#58CC02", pronoun: "#FF9F1C", preposition: "#FF4B4B",
  conjunction: "#888", other: "#aaa",
};

// ---- helpers ----

function maxVal(arr: number[]): number {
  return arr.length === 0 ? 1 : Math.max(...arr, 1);
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
  return `${d.getDate()} ${m}`;
}

// ---- sub-components ----

function SectionTitle({ label, t }: { label: string; t: any }) {
  return <Text style={[s.sectionTitle, { color: t.text }]}>{label}</Text>;
}

function Card({ children, t }: { children: React.ReactNode; t: any }) {
  return (
    <View style={[s.card, { backgroundColor: t.surface }]}>
      {children}
    </View>
  );
}

const BAR_CHART_H = 110; // fixed pixel height for the bar area

/** Vertical bar chart with x-axis labels */
function BarChart({
  data,
  color,
  labelKey,
  valueKey,
  colorMap,
  t,
}: {
  data: any[];
  color?: string;
  labelKey: string;
  valueKey: string;
  colorMap?: Record<string, string>;
  t: any;
}) {
  const values = data.map((d) => d[valueKey] as number);
  const maxV = maxVal(values);

  return (
    <View style={s.chartArea}>
      <View style={s.barsRow}>
        {data.map((item, i) => {
          const val = item[valueKey] as number;
          const pct = Math.max(val / maxV, val > 0 ? 0.04 : 0);
          const barH = Math.round(pct * BAR_CHART_H);
          const barColor = colorMap?.[item[labelKey]] ?? color ?? "#58CC02";
          return (
            <View key={i} style={s.barCol}>
              <Text style={[s.barValLabel, { color: t.textSecondary ?? t.textMuted }]}>
                {val > 0 ? val : ""}
              </Text>
              {/* fixed height bg, bar grows from bottom */}
              <View style={[s.barBg, { backgroundColor: t.surfaceAlt ?? "#2A2A2A", height: BAR_CHART_H }]}>
                <View
                  style={[
                    s.barFill,
                    { height: barH, backgroundColor: barColor },
                  ]}
                />
              </View>
              <Text style={[s.barXLabel, { color: t.textMuted }]} numberOfLines={1}>
                {item[labelKey]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** Horizontal bar (for gender, POS) */
function HBar({
  label,
  value,
  total,
  color,
  t,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
  t: any;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <View style={s.hbarRow}>
      <Text style={[s.hbarLabel, { color: t.text }]}>{label}</Text>
      <View style={[s.hbarBg, { backgroundColor: t.surfaceAlt ?? "#333" }]}>
        <View style={[s.hbarFill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[s.hbarVal, { color: t.textMuted }]}>{value}</Text>
    </View>
  );
}

/** Card state pill */
function StatePill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[s.pill, { backgroundColor: color + "22", borderColor: color }]}>
      <Text style={[s.pillVal, { color }]}>{value}</Text>
      <Text style={[s.pillLabel, { color }]}>{label}</Text>
    </View>
  );
}

// ---- main ----

export default function DashboardScreen() {
  const router = useRouter();
  const { theme: t } = useTheme();

  const dash = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch(`${baseUrl}/api/stats/dashboard`, { credentials: "include" });
      return res.json();
    },
    staleTime: 60_000,
  });

  const d = dash.data;

  // prep daily review data (last 14 days)
  const dailyReviewData = useMemo(() => {
    if (!d?.dailyReviews) return [];
    return d.dailyReviews.slice(-14).map((r: any) => ({
      date: shortDate(r.date),
      count: r.count,
    }));
  }, [d?.dailyReviews]);

  const dailyWordsData = useMemo(() => {
    if (!d?.dailyWordsAdded) return [];
    return d.dailyWordsAdded.slice(-14).map((r: any) => ({
      date: shortDate(r.date),
      count: r.count,
    }));
  }, [d?.dailyWordsAdded]);

  const cefrData = useMemo(() => {
    if (!d?.cefrBreakdown) return [];
    // Backend returns plain object {A1: 5, A2: 2, ...}
    return Object.entries(d.cefrBreakdown as Record<string, number>)
      .map(([level, count]) => ({ level, count }))
      .filter((x) => x.count > 0);
  }, [d?.cefrBreakdown]);

  const genderData = useMemo(() => {
    if (!d?.genderBreakdown) return [];
    // Backend returns plain object {masculine: 3, feminine: 2, neutral: 1}
    return Object.entries(d.genderBreakdown as Record<string, number>)
      .map(([gender, count]) => ({ gender, count }));
  }, [d?.genderBreakdown]);

  const genderTotal = useMemo(() => genderData.reduce((a: number, g: any) => a + g.count, 0), [genderData]);

  const posData = useMemo(() => {
    if (!d?.posBreakdown) return [];
    // Backend returns plain object {noun: 5, verb: 3, ...}
    return Object.entries(d.posBreakdown as Record<string, number>)
      .map(([pos, count]) => ({ pos, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [d?.posBreakdown]);

  const posTotal = useMemo(() => posData.reduce((a: number, p: any) => a + p.count, 0), [posData]);

  const ratingData = useMemo(() => {
    if (!d?.ratingDistribution) return [];
    const map: Record<string, string> = { "1": "again", "2": "hard", "3": "good", "4": "easy" };
    // Backend returns plain object {1: 5, 2: 3, 3: 8, 4: 2}
    return Object.entries(d.ratingDistribution as Record<string, number>)
      .map(([rating, count]) => ({
        label: map[rating] ?? rating,
        count,
      }));
  }, [d?.ratingDistribution]);

  const cardStates = useMemo(() => {
    if (!d?.cardStates) return { new: 0, learning: 0, review: 0, relearning: 0 };
    return d.cardStates as Record<string, number>;
  }, [d?.cardStates]);

  if (dash.isLoading) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: t.background }]} edges={["top"]}>
        <View style={[s.navbar, { backgroundColor: t.background, borderBottomColor: t.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ArrowLeft size={22} color={t.primary} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={[s.navTitle, { color: t.text }]}>Analytics</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={s.centered}>
          <ActivityIndicator size="large" color={t.primary} />
          <Text style={[s.loadingText, { color: t.textMuted }]}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (dash.isError || !d) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: t.background }]} edges={["top"]}>
        <View style={[s.navbar, { backgroundColor: t.background, borderBottomColor: t.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ArrowLeft size={22} color={t.primary} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={[s.navTitle, { color: t.text }]}>Analytics</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={s.centered}>
          <BarChart2 size={40} color={t.textMuted} strokeWidth={1.5} style={{ marginBottom: 12 }} />
          <Text style={[s.loadingText, { color: t.text, fontWeight: "700" }]}>Failed to load analytics</Text>
          <Text style={[s.loadingText, { color: t.textMuted, marginTop: 4 }]}>Pull down to refresh</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: t.background }]} edges={["top"]}>
      {/* Navbar */}
      <View style={[s.navbar, { backgroundColor: t.background, borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ArrowLeft size={22} color={t.primary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[s.navTitle, { color: t.text }]}>Analytics</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero row */}
        <View style={s.heroRow}>
          {([
            { icon: <BookOpen size={20} color="#CE82FF" strokeWidth={2} />, val: d?.totalWords ?? 0, label: "Words" },
            { icon: <Flame size={20} color="#FF4B4B" strokeWidth={2} />, val: d?.stats?.streak ?? 0, label: "Streak" },
            { icon: <Zap size={20} color="#FFC800" strokeWidth={2} />, val: d?.stats?.xp ?? 0, label: "XP" },
            { icon: <Trophy size={20} color="#58CC02" strokeWidth={2} />, val: `${d?.masteryPct ?? 0}%`, label: "Mastery" },
          ] as Array<{ icon: React.ReactNode; val: string | number; label: string }>).map(({ icon, val, label }) => (
            <View key={label} style={[s.heroCard, { backgroundColor: t.surface }]}>
              <View style={s.heroIconWrap}>{icon}</View>
              <Text style={[s.heroVal, { color: t.text }]}>{val}</Text>
              <Text style={[s.heroLabel, { color: t.textMuted }]}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Dominant CEFR callout */}
        {d?.dominantCefr && (
          <View style={[s.cefrCallout, { backgroundColor: (CEFR_COLORS[d.dominantCefr] ?? "#888") + "22", borderColor: CEFR_COLORS[d.dominantCefr] ?? "#888" }]}>
            <Text style={[s.cefrCalloutLabel, { color: CEFR_COLORS[d.dominantCefr] ?? "#888" }]}>
              Dominant Level
            </Text>
            <Text style={[s.cefrCalloutLevel, { color: CEFR_COLORS[d.dominantCefr] ?? "#888" }]}>
              {d.dominantCefr}
            </Text>
            <Text style={[s.cefrCalloutSub, { color: t.textMuted }]}>
              {d.masteredCount ?? 0} cards mastered
            </Text>
          </View>
        )}

        {/* Card States */}
        <SectionTitle label="Card States" t={t} />
        <Card t={t}>
          <View style={s.pillsRow}>
            {Object.entries(cardStates).map(([state, count]) => (
              <StatePill
                key={state}
                label={state.charAt(0).toUpperCase() + state.slice(1)}
                value={count as number}
                color={CARD_STATE_COLORS[state] ?? "#888"}
              />
            ))}
          </View>
        </Card>

        {/* CEFR Breakdown */}
        {cefrData.length > 0 && (
          <>
            <SectionTitle label="Words by CEFR Level" t={t} />
            <Card t={t}>
              <BarChart
                data={cefrData}
                labelKey="level"
                valueKey="count"
                colorMap={CEFR_COLORS}
                t={t}
              />
            </Card>
          </>
        )}

        {/* Daily Reviews */}
        {dailyReviewData.length > 0 && (
          <>
            <SectionTitle label="Daily Reviews (14 days)" t={t} />
            <Card t={t}>
              <BarChart
                data={dailyReviewData}
                labelKey="date"
                valueKey="count"
                color="#1CB0F6"
                t={t}
              />
            </Card>
          </>
        )}

        {/* Words Added Per Day */}
        {dailyWordsData.length > 0 && (
          <>
            <SectionTitle label="Words Added (14 days)" t={t} />
            <Card t={t}>
              <BarChart
                data={dailyWordsData}
                labelKey="date"
                valueKey="count"
                color="#58CC02"
                t={t}
              />
            </Card>
          </>
        )}

        {/* Gender Breakdown */}
        {genderData.length > 0 && (
          <>
            <SectionTitle label="Gender Breakdown" t={t} />
            <Card t={t}>
              {genderData.map((g: any) => (
                <HBar
                  key={g.gender}
                  label={g.gender.charAt(0).toUpperCase() + g.gender.slice(1)}
                  value={g.count}
                  total={genderTotal}
                  color={GENDER_COLORS[g.gender] ?? "#888"}
                  t={t}
                />
              ))}
            </Card>
          </>
        )}

        {/* POS Breakdown */}
        {posData.length > 0 && (
          <>
            <SectionTitle label="Part of Speech" t={t} />
            <Card t={t}>
              {posData.map((p: any) => (
                <HBar
                  key={p.pos}
                  label={p.pos.charAt(0).toUpperCase() + p.pos.slice(1)}
                  value={p.count}
                  total={posTotal}
                  color={POS_COLORS[p.pos] ?? "#aaa"}
                  t={t}
                />
              ))}
            </Card>
          </>
        )}

        {/* Rating Distribution */}
        {ratingData.length > 0 && (
          <>
            <SectionTitle label="Rating Distribution" t={t} />
            <Card t={t}>
              <BarChart
                data={ratingData}
                labelKey="label"
                valueKey="count"
                colorMap={RATING_COLORS}
                t={t}
              />
            </Card>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 12, fontSize: 15 },

  navbar: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, alignItems: "flex-start", justifyContent: "center" },
  navTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "800" },

  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },

  heroRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  heroCard: {
    flex: 1, borderRadius: 16, padding: 10, alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  heroIconWrap: { marginBottom: 4 },
  heroVal: { fontSize: 18, fontWeight: "800" },
  heroLabel: { fontSize: 10, fontWeight: "600", marginTop: 2, textAlign: "center" },

  cefrCallout: {
    borderRadius: 18, borderWidth: 2, padding: 16, marginBottom: 20,
    alignItems: "center",
  },
  cefrCalloutLabel: { fontSize: 13, fontWeight: "700", marginBottom: 2 },
  cefrCalloutLevel: { fontSize: 40, fontWeight: "900" },
  cefrCalloutSub: { fontSize: 13, marginTop: 4 },

  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 8, marginTop: 4 },

  card: {
    borderRadius: 18, padding: 16, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },

  // Vertical bar chart
  chartArea: { overflow: "visible" },
  barsRow: { flexDirection: "row", alignItems: "flex-end", gap: 3 },
  barCol: { flex: 1, alignItems: "center" },
  barValLabel: { fontSize: 9, fontWeight: "700", marginBottom: 3, textAlign: "center" },
  barBg: {
    width: "100%", borderRadius: 6,
    overflow: "hidden", justifyContent: "flex-end",
  },
  barFill: { width: "100%", borderBottomLeftRadius: 6, borderBottomRightRadius: 6 },
  barXLabel: { fontSize: 8, marginTop: 4, textAlign: "center" } as any,

  // Horizontal bar
  hbarRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  hbarLabel: { width: 80, fontSize: 13, fontWeight: "600" },
  hbarBg: { flex: 1, height: 10, borderRadius: 5, overflow: "hidden", marginHorizontal: 8 },
  hbarFill: { height: "100%", borderRadius: 5 },
  hbarVal: { width: 32, fontSize: 12, fontWeight: "700", textAlign: "right" },

  // Pills
  pillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pill: {
    borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    alignItems: "center", minWidth: 72,
  },
  pillVal: { fontSize: 22, fontWeight: "800" },
  pillLabel: { fontSize: 11, fontWeight: "600", marginTop: 2 },
});
