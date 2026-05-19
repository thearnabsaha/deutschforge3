import React, { useEffect, useState, useCallback } from "react";
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
import { ArrowLeft } from "lucide-react-native";

import { baseUrl } from "../lib/api";
import { useTheme } from "../lib/theme";

// ── local data ──
import {
  loadProgress,
  getUnitCompletionPercent,
} from "../lib/syllabusProgress";
import { SYLLABUS_UNITS, ALL_LESSONS } from "../lib/syllabusData";
import {
  loadGrammarProgress,
  computeStats,
  loadPracticeProgress,
  type PracticeProgress,
  type GrammarProgress,
} from "../lib/grammarProgress";
import {
  loadResults,
  getOverallStats,
  getLevelStats,
  getSectionStats,
  type ExamResultsV2,
} from "../lib/examAnalytics";
import {
  A0_GRAMMAR_CHAPTERS,
  GRAMMAR_CHAPTERS,
  A2_GRAMMAR_CHAPTERS,
  B1_GRAMMAR_CHAPTERS,
} from "../lib/grammarData";
import { getExams } from "../lib/goetheExamData";
import type { Level, Section } from "../lib/goetheExamData";

const SCREEN_W = Dimensions.get("window").width;

// ── grammar CEFR groupings ──
const GRAMMAR_LEVELS = [
  { label: "A0",   chapters: A0_GRAMMAR_CHAPTERS, color: "#F59E0B" },
  { label: "A1",   chapters: GRAMMAR_CHAPTERS,    color: "#A855F7" },
  { label: "A2",   chapters: A2_GRAMMAR_CHAPTERS, color: "#1CB0F6" },
  { label: "B1",   chapters: B1_GRAMMAR_CHAPTERS, color: "#22C55E" },
];

const EXAM_LEVELS: Level[]   = ["A1", "A2", "B1"];
const EXAM_SECTIONS: Section[] = ["hoeren", "lesen", "schreiben", "sprechen"];
const SECTION_LABELS: Record<Section, string> = {
  hoeren:    "Hören",
  lesen:     "Lesen",
  schreiben: "Schreiben",
  sprechen:  "Sprechen",
};
const SECTION_COLORS: Record<Section, string> = {
  hoeren:    "#1CB0F6",
  lesen:     "#22C55E",
  schreiben: "#F59E0B",
  sprechen:  "#A855F7",
};
const LEVEL_COLORS: Record<Level, string> = {
  A1: "#22C55E",
  A2: "#1CB0F6",
  B1: "#A855F7",
};
const CEFR_COLORS: Record<string, string> = {
  A1: "#22C55E",
  A2: "#1CB0F6",
  B1: "#A855F7",
  B2: "#F59E0B",
  C1: "#EF4444",
  C2: "#EC4899",
};
const CARD_STATE_COLORS: Record<string, string> = {
  new:        "#1CB0F6",
  learning:   "#F59E0B",
  review:     "#22C55E",
  relearning: "#EF4444",
};

const TABS = ["Words", "Learn", "Grammar", "Exam"] as const;
type Tab = typeof TABS[number];

// ─────────────────────────────────────────────────────────────
// Primitive chart components (no external libs)
// ─────────────────────────────────────────────────────────────

/** Horizontal bar for a single metric */
function HBar({
  label,
  value,
  max,
  color,
  suffix = "",
  dark,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  suffix?: string;
  dark: boolean;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
        <Text style={{ color: dark ? "#CCC" : "#444", fontSize: 13 }}>{label}</Text>
        <Text style={{ color: dark ? "#FFF" : "#111", fontSize: 13, fontWeight: "700" }}>
          {value}{suffix}
        </Text>
      </View>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: dark ? "#2A2A2A" : "#E5E7EB", overflow: "hidden" }}>
        <View style={{ height: 8, borderRadius: 4, width: `${pct}%`, backgroundColor: color }} />
      </View>
    </View>
  );
}

/** Vertical bar chart */
function VBarChart({
  items,
  maxVal,
  dark,
  height = 80,
}: {
  items: { label: string; value: number; color: string }[];
  maxVal: number;
  dark: boolean;
  height?: number;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6, height: height + 24 }}>
      {items.map((it) => {
        const pct = maxVal > 0 ? Math.min((it.value / maxVal) * 100, 100) : 0;
        const barH = (pct / 100) * height;
        return (
          <View key={it.label} style={{ flex: 1, alignItems: "center", justifyContent: "flex-end" }}>
            <Text style={{ color: dark ? "#FFF" : "#111", fontSize: 10, fontWeight: "700", marginBottom: 2 }}>
              {it.value}
            </Text>
            <View
              style={{
                width: "100%",
                height: Math.max(barH, it.value > 0 ? 3 : 0),
                backgroundColor: it.color,
                borderRadius: 3,
              }}
            />
            <Text style={{ color: dark ? "#AAA" : "#666", fontSize: 10, marginTop: 4, textAlign: "center" }}>
              {it.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

/** Ring / donut using border trick */
function RingChart({
  pct,
  color,
  size = 80,
  label,
  sublabel,
  dark,
}: {
  pct: number;
  color: string;
  size?: number;
  label: string;
  sublabel?: string;
  dark: boolean;
}) {
  const radius = size / 2;
  const stroke = size * 0.12;
  const inner = size - stroke * 2;
  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          borderWidth: stroke,
          borderColor: dark ? "#2A2A2A" : "#E5E7EB",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Filled arc approximation via overlay */}
        {pct > 0 && (
          <View
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: radius,
              borderWidth: stroke,
              borderColor: color,
              borderRightColor: pct < 25 ? "transparent" : color,
              borderBottomColor: pct < 50 ? "transparent" : color,
              borderLeftColor: pct < 75 ? "transparent" : color,
              transform: [{ rotate: "-90deg" }],
            }}
          />
        )}
        <View style={{ alignItems: "center" }}>
          <Text style={{ color: dark ? "#FFF" : "#111", fontSize: size * 0.18, fontWeight: "800" }}>
            {Math.round(pct)}%
          </Text>
          {sublabel ? (
            <Text style={{ color: dark ? "#AAA" : "#666", fontSize: size * 0.13, textAlign: "center" }}>
              {sublabel}
            </Text>
          ) : null}
        </View>
      </View>
      <Text style={{ color: dark ? "#CCC" : "#555", fontSize: 12, marginTop: 6, textAlign: "center" }}>
        {label}
      </Text>
    </View>
  );
}

/** Simple stat pill */
function StatPill({
  label,
  value,
  color,
  dark,
}: {
  label: string;
  value: string | number;
  color: string;
  dark: boolean;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: dark ? "#1A1A1A" : "#F9FAFB",
        borderRadius: 12,
        padding: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: dark ? "#2A2A2A" : "#E5E7EB",
      }}
    >
      <Text style={{ color, fontSize: 20, fontWeight: "800" }}>{value}</Text>
      <Text style={{ color: dark ? "#AAA" : "#666", fontSize: 11, textAlign: "center", marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}

/** Section divider with title */
function SectionTitle({ title, dark }: { title: string; dark: boolean }) {
  return (
    <Text
      style={{
        color: dark ? "#FFF" : "#111",
        fontSize: 15,
        fontWeight: "800",
        marginTop: 20,
        marginBottom: 10,
        letterSpacing: 0.3,
      }}
    >
      {title}
    </Text>
  );
}

/** Card wrapper */
function Card({ children, dark }: { children: React.ReactNode; dark: boolean }) {
  return (
    <View
      style={{
        backgroundColor: dark ? "#1A1A1A" : "#FFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: dark ? "#2A2A2A" : "#E5E7EB",
      }}
    >
      {children}
    </View>
  );
}

/** 30-day activity dots */
function ActivityDots({
  data,
  dark,
}: {
  data: { date: string; count: number }[];
  dark: boolean;
}) {
  const last30 = data.slice(-30);
  const maxVal = Math.max(...last30.map((d) => d.count), 1);
  return (
    <View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
        {last30.map((d, i) => {
          const intensity = d.count / maxVal;
          const bg =
            d.count === 0
              ? dark ? "#2A2A2A" : "#E5E7EB"
              : `rgba(88, 204, 2, ${0.3 + intensity * 0.7})`;
          return (
            <View
              key={i}
              style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: bg }}
            />
          );
        })}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
        <Text style={{ color: dark ? "#888" : "#999", fontSize: 11 }}>30 days ago</Text>
        <Text style={{ color: dark ? "#888" : "#999", fontSize: 11 }}>Today</Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Words
// ─────────────────────────────────────────────────────────────

function WordsTab({
  dash,
  dark,
}: {
  dash: any;
  dark: boolean;
}) {
  if (!dash) {
    return (
      <View style={{ alignItems: "center", padding: 40 }}>
        <Text style={{ color: dark ? "#AAA" : "#666" }}>No word data yet. Add words to get started!</Text>
      </View>
    );
  }

  const cardStates = dash.cardStates ?? { new: 0, learning: 0, review: 0, relearning: 0 };
  const totalCards = Object.values(cardStates).reduce((s: number, v: any) => s + (v as number), 0);
  const masteredCount = dash.masteredCount ?? 0;
  const masteryPct = dash.masteryPct ?? 0;
  const totalWords = dash.totalWords ?? 0;
  const cefrBreakdown = dash.cefrBreakdown ?? {};
  const posBreakdown = dash.posBreakdown ?? {};
  const ratingDist = dash.ratingDistribution ?? {};
  const dailyReviews = dash.dailyReviews ?? [];
  const dailyWordsAdded = dash.dailyWordsAdded ?? [];
  const weeklyActivity = dash.weeklyActivity ?? [];
  const hardWords = dash.hardWords ?? [];

  const cefrItems = ["A1","A2","B1","B2","C1","C2"].map((l) => ({
    label: l,
    value: cefrBreakdown[l] ?? 0,
    color: CEFR_COLORS[l],
  }));
  const cefrMax = Math.max(...cefrItems.map((i) => i.value), 1);

  const posEntries = Object.entries(posBreakdown)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 8);
  const posMax = posEntries.length > 0 ? (posEntries[0][1] as number) : 1;

  const ratingLabels: Record<number, string> = { 1: "Again", 2: "Hard", 3: "Good", 4: "Easy" };
  const ratingColors: Record<number, string> = { 1: "#EF4444", 2: "#F59E0B", 3: "#22C55E", 4: "#1CB0F6" };
  const ratingItems = [1, 2, 3, 4].map((r) => ({
    label: ratingLabels[r],
    value: ratingDist[r] ?? 0,
    color: ratingColors[r],
  }));
  const ratingMax = Math.max(...ratingItems.map((i) => i.value), 1);

  // sparkline for daily reviews
  const reviewMax = Math.max(...dailyReviews.map((d: any) => d.count), 1);
  const wordAddMax = Math.max(...dailyWordsAdded.map((d: any) => d.count), 1);

  const dueCount = cardStates.learning + cardStates.review + cardStates.relearning;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>

      {/* Top stats row */}
      <SectionTitle title="Overview" dark={dark} />
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <StatPill label="Total Words" value={totalWords} color="#1CB0F6" dark={dark} />
        <StatPill label="Cards" value={totalCards} color="#A855F7" dark={dark} />
        <StatPill label="Mastered" value={masteredCount} color="#22C55E" dark={dark} />
      </View>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <StatPill label="Due Now" value={dueCount} color="#F59E0B" dark={dark} />
        <StatPill label="New" value={cardStates.new} color="#1CB0F6" dark={dark} />
        <StatPill label="Relearning" value={cardStates.relearning} color="#EF4444" dark={dark} />
      </View>

      {/* Mastery ring + card states side by side */}
      <SectionTitle title="Card States" dark={dark} />
      <Card dark={dark}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <RingChart
            pct={masteryPct}
            color="#22C55E"
            size={90}
            label="Mastery"
            sublabel={`${masteredCount} mastered`}
            dark={dark}
          />
          <View style={{ flex: 1 }}>
            {Object.entries(cardStates).map(([k, v]) => (
              <HBar
                key={k}
                label={k.charAt(0).toUpperCase() + k.slice(1)}
                value={v as number}
                max={Math.max(totalCards, 1)}
                color={CARD_STATE_COLORS[k] ?? "#888"}
                dark={dark}
              />
            ))}
          </View>
        </View>
      </Card>

      {/* CEFR distribution */}
      <SectionTitle title="CEFR Distribution" dark={dark} />
      <Card dark={dark}>
        <VBarChart items={cefrItems} maxVal={cefrMax} dark={dark} height={80} />
      </Card>

      {/* Part of speech */}
      {posEntries.length > 0 && (
        <>
          <SectionTitle title="Part of Speech" dark={dark} />
          <Card dark={dark}>
            {posEntries.map(([pos, cnt]) => (
              <HBar
                key={pos}
                label={pos.charAt(0).toUpperCase() + pos.slice(1)}
                value={cnt as number}
                max={posMax}
                color="#A855F7"
                dark={dark}
              />
            ))}
          </Card>
        </>
      )}

      {/* Review ratings */}
      <SectionTitle title="Review Ratings (14 days)" dark={dark} />
      <Card dark={dark}>
        <VBarChart items={ratingItems} maxVal={ratingMax} dark={dark} height={70} />
      </Card>

      {/* Daily reviews sparkline */}
      <SectionTitle title="Daily Reviews (14 days)" dark={dark} />
      <Card dark={dark}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4, height: 60 }}>
          {dailyReviews.map((d: any, i: number) => {
            const h = reviewMax > 0 ? Math.max((d.count / reviewMax) * 56, d.count > 0 ? 3 : 0) : 0;
            return (
              <View key={i} style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", height: 60 }}>
                <View style={{ width: "100%", height: h, backgroundColor: "#1CB0F6", borderRadius: 2 }} />
              </View>
            );
          })}
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
          <Text style={{ color: dark ? "#888" : "#999", fontSize: 10 }}>14d ago</Text>
          <Text style={{ color: dark ? "#888" : "#999", fontSize: 10 }}>Today</Text>
        </View>
      </Card>

      {/* Words added per day */}
      <SectionTitle title="Words Added (14 days)" dark={dark} />
      <Card dark={dark}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4, height: 50 }}>
          {dailyWordsAdded.map((d: any, i: number) => {
            const h = wordAddMax > 0 ? Math.max((d.count / wordAddMax) * 46, d.count > 0 ? 3 : 0) : 0;
            return (
              <View key={i} style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", height: 50 }}>
                <View style={{ width: "100%", height: h, backgroundColor: "#22C55E", borderRadius: 2 }} />
              </View>
            );
          })}
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
          <Text style={{ color: dark ? "#888" : "#999", fontSize: 10 }}>14d ago</Text>
          <Text style={{ color: dark ? "#888" : "#999", fontSize: 10 }}>Today</Text>
        </View>
      </Card>

      {/* Activity heatmap */}
      <SectionTitle title="Activity (30 days)" dark={dark} />
      <Card dark={dark}>
        <ActivityDots data={weeklyActivity} dark={dark} />
      </Card>

      {/* Hard words */}
      {hardWords.length > 0 && (
        <>
          <SectionTitle title={`Hard Words (${hardWords.length})`} dark={dark} />
          <Card dark={dark}>
            {hardWords.slice(0, 10).map((w: any) => (
              <View
                key={w.id}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 6,
                  borderBottomWidth: 1,
                  borderBottomColor: dark ? "#2A2A2A" : "#F3F4F6",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: dark ? "#FFF" : "#111", fontSize: 13, fontWeight: "700" }}>
                    {w.displayGerman ?? w.german}
                  </Text>
                  <Text style={{ color: dark ? "#AAA" : "#666", fontSize: 12 }}>{w.english}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ color: "#EF4444", fontSize: 12, fontWeight: "700" }}>
                    {w.lapses} lapses
                  </Text>
                  <Text style={{ color: dark ? "#888" : "#999", fontSize: 11 }}>
                    {w.cefrLevel ?? "?"} · {w.partOfSpeech ?? "?"}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </>
      )}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Learn
// ─────────────────────────────────────────────────────────────

function LearnTab({
  syllabusProgress,
  dark,
}: {
  syllabusProgress: any;
  dark: boolean;
}) {
  const p = syllabusProgress;
  if (!p) {
    return (
      <View style={{ alignItems: "center", padding: 40 }}>
        <Text style={{ color: dark ? "#AAA" : "#666" }}>No progress yet. Start a lesson!</Text>
      </View>
    );
  }

  const completedLessons = p.completedLessonIds?.length ?? 0;
  const totalLessons = ALL_LESSONS.length;
  const completedLevels = p.completedLevelIds?.length ?? 0;
  const completedUnits = p.completedUnitIds?.length ?? 0;
  const xp = p.xp ?? 0;
  const streak = p.streak ?? 0;
  const learnedWords = p.learnedWordIds?.length ?? 0;

  const overallPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Per-unit completion
  const unitData = SYLLABUS_UNITS.map((u) => {
    const pct = getUnitCompletionPercent(u.unitId, p);
    const done = p.completedUnitIds?.includes(u.unitId) ?? false;
    const totalLessonsInUnit = u.levels.reduce((s, lv) => s + lv.lessons.length, 0);
    const completedInUnit = u.levels.reduce(
      (s, lv) => s + lv.lessons.filter((l) => p.completedLessonIds?.includes(l.lessonId)).length,
      0,
    );
    return { unitId: u.unitId, title: u.title, color: u.color, pct, done, totalLessonsInUnit, completedInUnit };
  });

  // Per lesson-slot type (each level always has 5 lessons: intro/practice/challenge/tricky/exam)
  const LESSON_SLOT_NAMES = ["Intro", "Practice", "Challenge", "Tricky", "Exam"];
  const levelTypeCount: Record<string, { completed: number; total: number }> = {};
  for (const name of LESSON_SLOT_NAMES) levelTypeCount[name] = { completed: 0, total: 0 };
  for (const u of SYLLABUS_UNITS) {
    for (const lv of u.levels) {
      lv.lessons.forEach((l, idx) => {
        const key = LESSON_SLOT_NAMES[idx] ?? "Other";
        if (!levelTypeCount[key]) levelTypeCount[key] = { completed: 0, total: 0 };
        levelTypeCount[key].total += 1;
        if (p.completedLessonIds?.includes(l.lessonId)) levelTypeCount[key].completed += 1;
      });
    }
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>

      {/* Top stats */}
      <SectionTitle title="Overview" dark={dark} />
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <StatPill label="Lessons Done" value={completedLessons} color="#22C55E" dark={dark} />
        <StatPill label="Total XP" value={xp} color="#F59E0B" dark={dark} />
        <StatPill label="Streak" value={`${streak}d`} color="#EF4444" dark={dark} />
      </View>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <StatPill label="Units Done" value={`${completedUnits}/${SYLLABUS_UNITS.length}`} color="#A855F7" dark={dark} />
        <StatPill label="Levels Done" value={completedLevels} color="#1CB0F6" dark={dark} />
        <StatPill label="Words Learned" value={learnedWords} color="#22C55E" dark={dark} />
      </View>

      {/* Overall progress ring */}
      <SectionTitle title="Overall Progress" dark={dark} />
      <Card dark={dark}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
          <RingChart
            pct={overallPct}
            color="#22C55E"
            size={90}
            label="Complete"
            sublabel={`${completedLessons}/${totalLessons}`}
            dark={dark}
          />
          <View style={{ flex: 1 }}>
            <HBar
              label="Lessons"
              value={completedLessons}
              max={totalLessons}
              color="#22C55E"
              dark={dark}
            />
            <HBar
              label="Units"
              value={completedUnits}
              max={SYLLABUS_UNITS.length}
              color="#A855F7"
              dark={dark}
            />
            <HBar
              label="Levels"
              value={completedLevels}
              max={SYLLABUS_UNITS.reduce((s, u) => s + u.levels.length, 0)}
              color="#1CB0F6"
              dark={dark}
            />
          </View>
        </View>
      </Card>

      {/* Per-unit progress */}
      <SectionTitle title="Per-Unit Progress" dark={dark} />
      <Card dark={dark}>
        {unitData.map((u) => (
          <View key={u.unitId} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: u.color }} />
                <Text style={{ color: dark ? "#CCC" : "#444", fontSize: 13 }}>{u.title}</Text>
              </View>
              <Text style={{ color: dark ? "#FFF" : "#111", fontSize: 12, fontWeight: "700" }}>
                {u.completedInUnit}/{u.totalLessonsInUnit} {u.done ? "✓" : ""}
              </Text>
            </View>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: dark ? "#2A2A2A" : "#E5E7EB", overflow: "hidden" }}>
              <View style={{ height: 8, borderRadius: 4, width: `${u.pct}%`, backgroundColor: u.color }} />
            </View>
          </View>
        ))}
      </Card>

      {/* Lesson type breakdown */}
      {Object.keys(levelTypeCount).length > 0 && (
        <>
          <SectionTitle title="By Level Type" dark={dark} />
          <Card dark={dark}>
            {Object.entries(levelTypeCount).map(([type, { completed, total }]) => {
              const colors: Record<string, string> = {
                Intro: "#1CB0F6",
                Practice: "#22C55E",
                Challenge: "#F59E0B",
                Tricky: "#EF4444",
                Exam: "#A855F7",
                Other: "#888",
              };
              return (
                <HBar
                  key={type}
                  label={type}
                  value={completed}
                  max={total}
                  color={colors[type] ?? "#888"}
                  suffix={`/${total}`}
                  dark={dark}
                />
              );
            })}
          </Card>
        </>
      )}

      {/* XP level bar */}
      <SectionTitle title="XP Progress" dark={dark} />
      <Card dark={dark}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
          <Text style={{ color: dark ? "#FFF" : "#111", fontSize: 18, fontWeight: "800" }}>
            {xp.toLocaleString()} XP
          </Text>
          <Text style={{ color: dark ? "#AAA" : "#666", fontSize: 13 }}>
            from lessons
          </Text>
        </View>
        <View style={{ height: 10, borderRadius: 5, backgroundColor: dark ? "#2A2A2A" : "#E5E7EB", overflow: "hidden" }}>
          <View
            style={{
              height: 10,
              borderRadius: 5,
              width: `${Math.min((xp / Math.max(xp + 500, 1000)) * 100, 100)}%`,
              backgroundColor: "#F59E0B",
            }}
          />
        </View>
        <Text style={{ color: dark ? "#888" : "#999", fontSize: 11, marginTop: 4 }}>
          10 XP per correct answer · 50 XP level completion bonus
        </Text>
      </Card>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Grammar
// ─────────────────────────────────────────────────────────────

function GrammarTab({
  grammarProgress,
  practiceProgress,
  dark,
}: {
  grammarProgress: GrammarProgress | null;
  practiceProgress: PracticeProgress | null;
  dark: boolean;
}) {
  if (!grammarProgress) {
    return (
      <View style={{ alignItems: "center", padding: 40 }}>
        <Text style={{ color: dark ? "#AAA" : "#666" }}>No grammar progress yet.</Text>
      </View>
    );
  }

  const stats = computeStats(grammarProgress);

  // Per CEFR level stats
  const levelAccuracies = GRAMMAR_LEVELS.map(({ label, chapters, color }) => {
    const withScores = chapters.filter(
      (c) => (grammarProgress.chapters[c.id]?.exerciseAttempts ?? 0) > 0,
    );
    const visited = chapters.filter(
      (c) => (grammarProgress.chapters[c.id]?.visitCount ?? 0) > 0,
    );
    const completed = chapters.filter((c) => grammarProgress.chapters[c.id]?.completedAt != null);
    const acc =
      withScores.length > 0
        ? Math.round(
            withScores.reduce((s, c) => {
              const ch = grammarProgress.chapters[c.id];
              return s + (ch ? (ch.exerciseCorrect / ch.exerciseAttempts) * 100 : 0);
            }, 0) / withScores.length,
          )
        : null;
    return {
      label,
      color,
      total: chapters.length,
      visited: visited.length,
      completed: completed.length,
      withScores: withScores.length,
      acc,
    };
  });

  // Chapter heatmap: show all chapters with color-coded accuracy
  const allChapters = [
    ...A0_GRAMMAR_CHAPTERS.map((c) => ({ ...c, _level: "A0", _color: "#F59E0B" })),
    ...GRAMMAR_CHAPTERS.map((c) => ({ ...c, _level: "A1", _color: "#A855F7" })),
    ...A2_GRAMMAR_CHAPTERS.map((c) => ({ ...c, _level: "A2", _color: "#1CB0F6" })),
    ...B1_GRAMMAR_CHAPTERS.map((c) => ({ ...c, _level: "B1", _color: "#22C55E" })),
  ];

  const chapterColor = (id: string): string => {
    const ch = grammarProgress.chapters[id];
    if (!ch || ch.exerciseAttempts === 0) return dark ? "#2A2A2A" : "#E5E7EB";
    const acc = (ch.exerciseCorrect / ch.exerciseAttempts) * 100;
    if (acc >= 80) return "#22C55E";
    if (acc >= 60) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>

      {/* Top stats */}
      <SectionTitle title="Overview" dark={dark} />
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <StatPill label="Total" value={stats.total} color="#888" dark={dark} />
        <StatPill label="Visited" value={stats.visited} color="#1CB0F6" dark={dark} />
        <StatPill label="Completed" value={stats.completed} color="#22C55E" dark={dark} />
      </View>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <StatPill label="With Scores" value={stats.withScores} color="#A855F7" dark={dark} />
        <StatPill
          label="Accuracy"
          value={stats.overallAccuracy != null ? `${stats.overallAccuracy}%` : "—"}
          color="#F59E0B"
          dark={dark}
        />
        <StatPill label="Active Days" value={stats.activeDays} color="#EF4444" dark={dark} />
      </View>

      {/* Overall accuracy ring */}
      <SectionTitle title="Overall Accuracy" dark={dark} />
      <Card dark={dark}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
          <RingChart
            pct={stats.overallAccuracy ?? 0}
            color="#22C55E"
            size={90}
            label="Accuracy"
            sublabel={`${stats.withScores} chapters`}
            dark={dark}
          />
          <View style={{ flex: 1 }}>
            <HBar label="Visited" value={stats.visited} max={stats.total} color="#1CB0F6" dark={dark} />
            <HBar label="Completed" value={stats.completed} max={stats.total} color="#22C55E" dark={dark} />
            <HBar label="Attempted" value={stats.withScores} max={stats.total} color="#A855F7" dark={dark} />
          </View>
        </View>
      </Card>

      {/* Per CEFR level */}
      <SectionTitle title="Per Level" dark={dark} />
      {levelAccuracies.map((l) => (
        <Card key={l.label} dark={dark}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: l.color + "30",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: l.color, fontWeight: "800", fontSize: 13 }}>{l.label}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: dark ? "#FFF" : "#111", fontSize: 13, fontWeight: "700" }}>
                  {l.visited}/{l.total} visited
                </Text>
                <Text style={{ color: l.acc != null ? "#22C55E" : dark ? "#888" : "#999", fontSize: 13, fontWeight: "700" }}>
                  {l.acc != null ? `${l.acc}%` : "—"}
                </Text>
              </View>
              <View style={{ height: 6, borderRadius: 3, backgroundColor: dark ? "#2A2A2A" : "#E5E7EB", marginTop: 4, overflow: "hidden" }}>
                <View
                  style={{
                    height: 6,
                    borderRadius: 3,
                    width: `${l.total > 0 ? (l.completed / l.total) * 100 : 0}%`,
                    backgroundColor: l.color,
                  }}
                />
              </View>
              <Text style={{ color: dark ? "#888" : "#999", fontSize: 11, marginTop: 2 }}>
                {l.completed} completed · {l.withScores} with scores
              </Text>
            </View>
          </View>
        </Card>
      ))}

      {/* Chapter accuracy heatmap */}
      <SectionTitle title="Chapter Heatmap" dark={dark} />
      <Card dark={dark}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}>
          {allChapters.map((c) => (
            <View
              key={c.id}
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                backgroundColor: chapterColor(c.id),
              }}
            />
          ))}
        </View>
        <View style={{ flexDirection: "row", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
          {[
            { color: dark ? "#2A2A2A" : "#E5E7EB", label: "Not started" },
            { color: "#EF4444", label: "< 60%" },
            { color: "#F59E0B", label: "60–79%" },
            { color: "#22C55E", label: "≥ 80%" },
          ].map((leg) => (
            <View key={leg.label} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: leg.color }} />
              <Text style={{ color: dark ? "#AAA" : "#666", fontSize: 11 }}>{leg.label}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Strengths */}
      {stats.strengths.length > 0 && (
        <>
          <SectionTitle title="Top Strengths" dark={dark} />
          <Card dark={dark}>
            {stats.strengths.map((c) => {
              const acc = stats.accuracy(c.id);
              return (
                <View
                  key={c.id}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingVertical: 6,
                    borderBottomWidth: 1,
                    borderBottomColor: dark ? "#2A2A2A" : "#F3F4F6",
                  }}
                >
                  <Text style={{ color: dark ? "#FFF" : "#111", fontSize: 13, flex: 1 }}>{c.title}</Text>
                  <Text style={{ color: "#22C55E", fontWeight: "700", fontSize: 13 }}>{acc}%</Text>
                </View>
              );
            })}
          </Card>
        </>
      )}

      {/* Weaknesses */}
      {stats.weaknesses.length > 0 && (
        <>
          <SectionTitle title="Needs Work" dark={dark} />
          <Card dark={dark}>
            {stats.weaknesses.map((c) => {
              const acc = stats.accuracy(c.id);
              return (
                <View
                  key={c.id}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingVertical: 6,
                    borderBottomWidth: 1,
                    borderBottomColor: dark ? "#2A2A2A" : "#F3F4F6",
                  }}
                >
                  <Text style={{ color: dark ? "#FFF" : "#111", fontSize: 13, flex: 1 }}>{c.title}</Text>
                  <Text style={{ color: "#EF4444", fontWeight: "700", fontSize: 13 }}>{acc}%</Text>
                </View>
              );
            })}
          </Card>
        </>
      )}

      {/* Activity heatmap */}
      <SectionTitle title="Activity (30 days)" dark={dark} />
      <Card dark={dark}>
        <ActivityDots data={stats.weeklyActivity} dark={dark} />
      </Card>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab: Exam
// ─────────────────────────────────────────────────────────────

function ExamTab({
  examResults,
  dark,
}: {
  examResults: ExamResultsV2;
  dark: boolean;
}) {
  const overall = getOverallStats(examResults);
  const hasAny = overall.totalAttempts > 0;

  // Per-level stats
  const levelStatsList = EXAM_LEVELS.map((level) => {
    const allIds: string[] = [];
    for (const section of EXAM_SECTIONS) {
      const exams = getExams(level, section);
      allIds.push(...exams.map((e) => e.id));
    }
    return { level, stats: getLevelStats(examResults, level, allIds) };
  });

  // Per-section stats across all levels
  const sectionStatsList = EXAM_SECTIONS.map((section) => {
    let attempted = 0, passed = 0, totalScore = 0, scoreCount = 0, bestScore: number | null = null;
    for (const level of EXAM_LEVELS) {
      const exams = getExams(level, section);
      const s = getSectionStats(examResults, level, section, exams.map((e) => e.id));
      attempted += s.attempted;
      passed += s.passed;
      if (s.avgScore != null) { totalScore += s.avgScore; scoreCount++; }
      if (s.bestScore != null && (bestScore === null || s.bestScore > bestScore)) bestScore = s.bestScore;
    }
    return {
      section,
      attempted,
      passed,
      avgScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : null,
      bestScore,
    };
  });

  // Best scores per exam (top 10 by score)
  const bestScoreList: { examId: string; score: number; passed: boolean }[] = [];
  for (const [examId, attempts] of Object.entries(examResults)) {
    if (!attempts || attempts.length === 0) continue;
    const best = Math.max(...attempts.map((a) => a.score));
    const passed = attempts.some((a) => a.passed);
    bestScoreList.push({ examId, score: best, passed });
  }
  bestScoreList.sort((a, b) => b.score - a.score);

  const passRate = overall.passRate ?? 0;
  const failRate = overall.uniqueExamsTried > 0 ? 100 - passRate : 0;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>

      {!hasAny && (
        <View style={{ alignItems: "center", padding: 40 }}>
          <Text style={{ color: dark ? "#AAA" : "#666" }}>No exam attempts yet. Try an exam!</Text>
        </View>
      )}

      {/* Overview stats */}
      <SectionTitle title="Overview" dark={dark} />
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <StatPill label="Attempts" value={overall.totalAttempts} color="#1CB0F6" dark={dark} />
        <StatPill label="Exams Tried" value={overall.uniqueExamsTried} color="#A855F7" dark={dark} />
        <StatPill label="Passed" value={overall.totalPassed} color="#22C55E" dark={dark} />
      </View>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <StatPill
          label="Pass Rate"
          value={overall.passRate != null ? `${overall.passRate}%` : "—"}
          color="#22C55E"
          dark={dark}
        />
        <StatPill
          label="Avg Score"
          value={overall.avgScore != null ? `${overall.avgScore}%` : "—"}
          color="#F59E0B"
          dark={dark}
        />
        <StatPill label="Failed" value={overall.uniqueExamsTried - overall.totalPassed} color="#EF4444" dark={dark} />
      </View>

      {/* Pass/Fail ring */}
      {hasAny && (
        <>
          <SectionTitle title="Pass / Fail Ratio" dark={dark} />
          <Card dark={dark}>
            <View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "center" }}>
              <RingChart
                pct={passRate}
                color="#22C55E"
                size={90}
                label="Pass Rate"
                sublabel={`${overall.totalPassed} passed`}
                dark={dark}
              />
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#22C55E" }} />
                  <Text style={{ color: dark ? "#CCC" : "#444", fontSize: 13 }}>Passed: {overall.totalPassed}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#EF4444" }} />
                  <Text style={{ color: dark ? "#CCC" : "#444", fontSize: 13 }}>
                    Failed: {overall.uniqueExamsTried - overall.totalPassed}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#888" }} />
                  <Text style={{ color: dark ? "#CCC" : "#444", fontSize: 13 }}>
                    Avg: {overall.avgScore ?? "—"}%
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </>
      )}

      {/* Per-level pass rate bars */}
      <SectionTitle title="Pass Rate by Level" dark={dark} />
      <Card dark={dark}>
        {levelStatsList.map(({ level, stats: s }) => (
          <View key={level} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: LEVEL_COLORS[level] }} />
                <Text style={{ color: dark ? "#CCC" : "#444", fontSize: 13 }}>{level}</Text>
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Text style={{ color: dark ? "#AAA" : "#666", fontSize: 12 }}>
                  {s.attempted}/{s.totalExams} tried
                </Text>
                <Text style={{ color: s.passRate != null ? "#22C55E" : dark ? "#888" : "#999", fontSize: 12, fontWeight: "700" }}>
                  {s.passRate != null ? `${s.passRate}% pass` : "—"}
                </Text>
              </View>
            </View>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: dark ? "#2A2A2A" : "#E5E7EB", overflow: "hidden" }}>
              <View
                style={{
                  height: 8,
                  borderRadius: 4,
                  width: `${s.attempted > 0 ? (s.passed / s.attempted) * 100 : 0}%`,
                  backgroundColor: LEVEL_COLORS[level],
                }}
              />
            </View>
          </View>
        ))}
      </Card>

      {/* Per-section accuracy */}
      <SectionTitle title="Per Section" dark={dark} />
      <Card dark={dark}>
        {sectionStatsList.map(({ section, attempted, passed, avgScore }) => (
          <View key={section} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: SECTION_COLORS[section] }} />
                <Text style={{ color: dark ? "#CCC" : "#444", fontSize: 13 }}>{SECTION_LABELS[section]}</Text>
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Text style={{ color: dark ? "#AAA" : "#666", fontSize: 12 }}>{attempted} tried</Text>
                <Text style={{ color: avgScore != null ? "#22C55E" : dark ? "#888" : "#999", fontSize: 12, fontWeight: "700" }}>
                  {avgScore != null ? `${avgScore}% avg` : "—"}
                </Text>
              </View>
            </View>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: dark ? "#2A2A2A" : "#E5E7EB", overflow: "hidden" }}>
              <View
                style={{
                  height: 8,
                  borderRadius: 4,
                  width: `${attempted > 0 ? (passed / attempted) * 100 : 0}%`,
                  backgroundColor: SECTION_COLORS[section],
                }}
              />
            </View>
          </View>
        ))}
      </Card>

      {/* Recent activity */}
      {overall.recentActivity.length > 0 && (
        <>
          <SectionTitle title={`Recent Activity (${overall.recentActivity.length})`} dark={dark} />
          <Card dark={dark}>
            {overall.recentActivity.slice(0, 12).map((a, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 7,
                  borderBottomWidth: i < 11 ? 1 : 0,
                  borderBottomColor: dark ? "#2A2A2A" : "#F3F4F6",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: dark ? "#FFF" : "#111", fontSize: 12, fontWeight: "600" }}>
                    {a.examId}
                  </Text>
                  <Text style={{ color: dark ? "#888" : "#999", fontSize: 11 }}>
                    {new Date(a.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text
                    style={{
                      color: a.score >= 60 ? "#22C55E" : a.score >= 40 ? "#F59E0B" : "#EF4444",
                      fontWeight: "800",
                      fontSize: 14,
                    }}
                  >
                    {a.score}%
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: 7,
                      paddingVertical: 2,
                      borderRadius: 6,
                      backgroundColor: a.passed ? "#22C55E20" : "#EF444420",
                    }}
                  >
                    <Text
                      style={{
                        color: a.passed ? "#22C55E" : "#EF4444",
                        fontSize: 11,
                        fontWeight: "700",
                      }}
                    >
                      {a.passed ? "PASS" : "FAIL"}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </Card>
        </>
      )}

      {/* Top scores */}
      {bestScoreList.length > 0 && (
        <>
          <SectionTitle title="Best Scores" dark={dark} />
          <Card dark={dark}>
            {bestScoreList.slice(0, 10).map((b, i) => (
              <View
                key={b.examId}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 6,
                  borderBottomWidth: i < 9 ? 1 : 0,
                  borderBottomColor: dark ? "#2A2A2A" : "#F3F4F6",
                }}
              >
                <Text style={{ color: dark ? "#CCC" : "#444", fontSize: 12, flex: 1 }}>{b.examId}</Text>
                <Text
                  style={{
                    color: b.score >= 60 ? "#22C55E" : "#EF4444",
                    fontWeight: "800",
                    fontSize: 14,
                  }}
                >
                  {b.score}%
                </Text>
              </View>
            ))}
          </Card>
        </>
      )}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Dashboard Screen
// ─────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const dark = theme.dark;
  const [activeTab, setActiveTab] = useState<Tab>("Words");

  // Server-side dash (Words data)
  const dashQuery = useQuery({
    queryKey: ["stats", "dashboard"],
    queryFn: async () => {
      try {
        const res = await fetch(`${baseUrl}/api/stats/dashboard`, {
          credentials: "include",
        });
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
  });

  // Local progress
  const [syllabusProgress, setSyllabusProgress] = useState<any>(null);
  const [grammarProgress, setGrammarProgress] = useState<GrammarProgress | null>(null);
  const [practiceProgress, setPracticeProgress] = useState<PracticeProgress | null>(null);
  const [examResults, setExamResults] = useState<ExamResultsV2>({});
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      loadProgress(),
      loadGrammarProgress(),
      loadPracticeProgress(),
      loadResults(),
    ]).then(([sp, gp, pp, er]) => {
      setSyllabusProgress(sp);
      setGrammarProgress(gp);
      setPracticeProgress(pp);
      setExamResults(er);
      setLocalLoading(false);
    });
  }, []);

  const isLoading = localLoading || dashQuery.isLoading;

  const bg = dark ? "#0A0A0A" : "#F8F9FA";
  const headerBg = dark ? "#111" : "#FFF";
  const textColor = dark ? "#FFF" : "#111";
  const subColor = dark ? "#888" : "#999";
  const tabActiveBg = dark ? "#1E1E1E" : "#FFF";
  const tabInactiveBg = dark ? "transparent" : "transparent";
  const tabBorderColor = dark ? "#2A2A2A" : "#E5E7EB";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: headerBg,
          borderBottomWidth: 1,
          borderBottomColor: dark ? "#1E1E1E" : "#E5E7EB",
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <ArrowLeft size={22} color={textColor} />
        </TouchableOpacity>
        <Text style={{ color: textColor, fontSize: 18, fontWeight: "800" }}>Analytics</Text>
      </View>

      {/* Tab bar */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: headerBg,
          paddingHorizontal: 12,
          paddingBottom: 8,
          paddingTop: 6,
          borderBottomWidth: 1,
          borderBottomColor: tabBorderColor,
          gap: 6,
        }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab;
          const tabColors: Record<Tab, string> = {
            Words: "#1CB0F6",
            Learn: "#22C55E",
            Grammar: "#A855F7",
            Exam: "#F59E0B",
          };
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 7,
                borderRadius: 10,
                alignItems: "center",
                backgroundColor: active ? tabColors[tab] + "20" : tabInactiveBg,
                borderWidth: active ? 1 : 1,
                borderColor: active ? tabColors[tab] + "60" : tabBorderColor,
              }}
            >
              <Text
                style={{
                  color: active ? tabColors[tab] : subColor,
                  fontSize: 12,
                  fontWeight: active ? "800" : "600",
                }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={dark ? "#FFF" : "#111"} size="large" />
          <Text style={{ color: subColor, marginTop: 12, fontSize: 14 }}>Loading analytics…</Text>
        </View>
      ) : (
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 4 }}>
          {activeTab === "Words" && <WordsTab dash={dashQuery.data} dark={dark} />}
          {activeTab === "Learn" && <LearnTab syllabusProgress={syllabusProgress} dark={dark} />}
          {activeTab === "Grammar" && (
            <GrammarTab
              grammarProgress={grammarProgress}
              practiceProgress={practiceProgress}
              dark={dark}
            />
          )}
          {activeTab === "Exam" && <ExamTab examResults={examResults} dark={dark} />}
        </View>
      )}
    </SafeAreaView>
  );
}
