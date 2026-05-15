/**
 * ExamDetailScreen — per-exam attempt history, score chart, improvement card.
 * Pure RN views, no chart libraries.
 */
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { ChevronLeft, Check, X, TrendingUp, TrendingDown, Minus, ClipboardList, Headphones, BookOpen, PenLine, Mic } from "lucide-react-native";
import { useTheme } from "../../lib/theme";
import {
  getBestScore,
  getAttemptCount,
  hasEverPassed,
  scoreColor,
} from "../../lib/examAnalytics";
import type { ExamResultsV2, ExamAttempt } from "../../lib/examAnalytics";
import { LEVEL_META, SECTION_META, getExamById } from "../../lib/goetheExamData";
import type { Level, Section } from "../../lib/goetheExamData";

function SectionIcon({ section, size = 18, color }: { section: Section; size?: number; color: string }) {
  if (section === "hoeren")    return <Headphones size={size} color={color} strokeWidth={1.8} />;
  if (section === "lesen")     return <BookOpen   size={size} color={color} strokeWidth={1.8} />;
  if (section === "schreiben") return <PenLine    size={size} color={color} strokeWidth={1.8} />;
  return <Mic size={size} color={color} strokeWidth={1.8} />;
}

interface Props {
  examId: string;
  level: Level;
  section: Section;
  results: ExamResultsV2;
  onBack: () => void;
  onRetake: () => void;
}

export default function ExamDetailScreen({
  examId,
  level,
  section,
  results,
  onBack,
  onRetake,
}: Props) {
  const { theme: t } = useTheme();
  const lm = LEVEL_META[level];
  const sm = SECTION_META[section];
  const exam = getExamById(level, section, examId);
  const attempts: ExamAttempt[] = results[examId] ?? [];

  // Sorted oldest → newest for chart display
  const chronological = [...attempts].reverse();

  const best = getBestScore(results, examId);
  const count = getAttemptCount(results, examId);
  const passed = hasEverPassed(results, examId);

  const latest = attempts.length > 0 ? attempts[0] : null;
  const allScores = attempts.map((a) => a.score).filter((s) => s > 0);
  const avg =
    allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : null;

  const fmtDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${d.getFullYear()} ${d.getHours().toString().padStart(2, "0")}:${d
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    } catch {
      return iso.slice(0, 10);
    }
  };

  const improvement =
    chronological.length >= 2
      ? (chronological[chronological.length - 1]?.score ?? 0) - (chronological[0]?.score ?? 0)
      : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }}>
      <StatusBar barStyle={t.dark ? "light-content" : "dark-content"} backgroundColor={t.background} />
      {/* Header */}
      <View style={[d.header, { backgroundColor: t.surface, borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={onBack} style={{ padding: 4 }}>
          <ChevronLeft size={24} color={t.primary} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <SectionIcon section={section} size={15} color={sm.color} />
            <Text style={[d.headerTitle, { color: t.text }]}>{level} · {sm.label}</Text>
          </View>
          <Text style={[d.headerSub, { color: t.textMuted }]}>
            {exam?.title ?? examId}
          </Text>
        </View>
        <TouchableOpacity
          style={[d.retakeBtn, { backgroundColor: lm.color }]}
          onPress={onRetake}
          activeOpacity={0.8}
        >
          <Text style={d.retakeBtnTxt}>Retake</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={d.page} showsVerticalScrollIndicator={false}>
        {attempts.length === 0 ? (
          <View style={[d.emptyCard, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
            <View style={{ alignItems: "center", marginBottom: 8 }}>
              <ClipboardList size={36} color={t.textMuted} strokeWidth={1.5} />
            </View>
            <Text style={[d.emptyTitle, { color: t.text }]}>No attempts yet</Text>
            <TouchableOpacity
              style={[d.retakeBtn, { backgroundColor: lm.color, marginTop: 12 }]}
              onPress={onRetake}
            >
              <Text style={d.retakeBtnTxt}>Start Exam</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Stats row */}
            <View style={[d.statsRow, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
              {[
                { label: "Attempts", value: count },
                {
                  label: "Best",
                  value: best !== null ? `${best}%` : "—",
                  color: best !== null ? scoreColor(best) : undefined,
                },
                {
                  label: "Latest",
                  value: latest ? (latest.rawTotal > 0 ? `${latest.score}%` : latest.passed ? "P" : "F") : "—",
                  color: latest
                    ? latest.rawTotal > 0
                      ? scoreColor(latest.score)
                      : latest.passed
                      ? "#4CAF50"
                      : "#F44336"
                    : undefined,
                },
                {
                  label: "Avg",
                  value: avg !== null ? `${avg}%` : "—",
                  color: avg !== null ? scoreColor(avg) : undefined,
                },
                {
                  label: "Status",
                  value: passed ? "Pass" : "Not yet",
                  color: passed ? "#4CAF50" : "#F44336",
                },
              ].map((stat, idx) => (
                <React.Fragment key={stat.label}>
                  {idx > 0 && <View style={[d.statDiv, { backgroundColor: t.border }]} />}
                  <View style={{ flex: 1, alignItems: "center" }}>
                    <Text style={[d.statNum, { color: stat.color ?? t.text }]}>{stat.value}</Text>
                    <Text style={[d.statLbl, { color: t.textMuted }]}>{stat.label}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>

            {/* Score trend bars (chronological) */}
            {chronological.some((a) => a.rawTotal > 0) && (
              <>
                <Text style={[d.sectionLabel, { color: t.textMuted }]}>SCORE TREND</Text>
                <View style={[d.chartCard, { backgroundColor: t.surface, borderColor: t.border }]}>
                  {/* Y-axis labels */}
                  <View style={{ flexDirection: "row" }}>
                    <View style={d.yAxis}>
                      {[100, 75, 60, 25, 0].map((v) => (
                        <Text key={v} style={[d.yLabel, { color: t.textMuted }]}>
                          {v}
                        </Text>
                      ))}
                    </View>
                    {/* Bars */}
                    <View style={{ flex: 1, flexDirection: "row", alignItems: "flex-end", gap: 6, height: 120 }}>
                      {chronological.map((a, idx) => {
                        if (a.rawTotal === 0) return null;
                        const pct = a.score;
                        const barH = Math.max(3, (pct / 100) * 120);
                        const color = scoreColor(pct);
                        return (
                          <View key={idx} style={{ flex: 1, alignItems: "center", justifyContent: "flex-end" }}>
                            <View
                              style={[
                                d.bar,
                                {
                                  height: barH,
                                  backgroundColor: color,
                                },
                              ]}
                            />
                            <Text style={[d.barLabel, { color: t.textMuted }]}>{idx + 1}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                  {/* Pass line marker text */}
                  <Text style={[d.passLineNote, { color: "#F59E0B" }]}>— 60% pass line</Text>
                </View>
              </>
            )}

            {/* Improvement card */}
            {improvement !== null && (
              <>
                <Text style={[d.sectionLabel, { color: t.textMuted }]}>IMPROVEMENT</Text>
                <View
                  style={[
                    d.improveCard,
                    {
                      backgroundColor:
                        improvement > 0 ? "#4CAF5015" : improvement < 0 ? "#F4433615" : t.surfaceAlt,
                      borderColor:
                        improvement > 0 ? "#4CAF5040" : improvement < 0 ? "#F4433640" : t.border,
                    },
                  ]}
                >
                  <View style={{ marginRight: 12 }}>
                    {improvement > 0
                      ? <TrendingUp size={36} color="#4CAF50" strokeWidth={1.5} />
                      : improvement < 0
                        ? <TrendingDown size={36} color="#F44336" strokeWidth={1.5} />
                        : <Minus size={36} color={t.textSecondary} strokeWidth={1.5} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        d.improveNum,
                        {
                          color:
                            improvement > 0
                              ? "#4CAF50"
                              : improvement < 0
                              ? "#F44336"
                              : t.textSecondary,
                        },
                      ]}
                    >
                      {improvement > 0 ? `+${improvement}%` : `${improvement}%`}
                    </Text>
                    <Text style={[d.improveSub, { color: t.textSecondary }]}>
                      {improvement > 0
                        ? "Great progress from first to latest attempt!"
                        : improvement < 0
                        ? "Score dropped — review the material and try again."
                        : "Same score — keep practicing!"}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {/* Attempt list */}
            <Text style={[d.sectionLabel, { color: t.textMuted }]}>ATTEMPT HISTORY</Text>
            <View style={[d.attemptCard, { backgroundColor: t.surface, borderColor: t.border }]}>
              {attempts.map((a, idx) => {
                const prev = attempts[idx + 1];
                const delta =
                  prev && a.rawTotal > 0 && prev.rawTotal > 0 ? a.score - prev.score : null;
                const color = a.rawTotal > 0 ? scoreColor(a.score) : a.passed ? "#4CAF50" : "#F44336";
                return (
                  <View
                    key={`${a.date}_${idx}`}
                    style={[
                      d.attemptRow,
                      idx < attempts.length - 1 && { borderBottomWidth: 1, borderBottomColor: t.border },
                    ]}
                  >
                    <View style={[d.attemptNum, { backgroundColor: color + "20" }]}>
                      <Text style={[d.attemptNumTxt, { color }]}>#{attempts.length - idx}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[d.attemptDate, { color: t.textSecondary }]}>
                        {fmtDate(a.date)}
                      </Text>
                      {delta !== null && (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                          {delta >= 0
                            ? <TrendingUp size={11} color="#4CAF50" />
                            : <TrendingDown size={11} color="#F44336" />}
                          <Text style={[d.attemptDelta, { color: delta >= 0 ? "#4CAF50" : "#F44336" }]}>
                            {delta >= 0 ? `+${delta}%` : `${delta}%`} vs prev
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={[d.attemptBadge, { backgroundColor: color + "15" }]}>
                      {a.rawTotal > 0
                        ? <Text style={[d.attemptBadgeTxt, { color }]}>{a.score}%</Text>
                        : a.passed
                          ? <Check size={13} color={color} strokeWidth={3} />
                          : <X size={13} color={color} strokeWidth={3} />}
                    </View>
                    <View style={[d.passBadge, { backgroundColor: a.passed ? "#4CAF5020" : "#F4433620" }]}>
                      <Text style={{ fontSize: 11, fontWeight: "700", color: a.passed ? "#4CAF50" : "#F44336" }}>
                        {a.passed ? "PASS" : "FAIL"}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const d = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  headerTitle: { fontSize: 15, fontWeight: "700" },
  headerSub: { fontSize: 12, marginTop: 1 },
  retakeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    alignItems: "center",
  },
  retakeBtnTxt: { color: "#fff", fontSize: 13, fontWeight: "700" },
  page: { padding: 20 },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
    gap: 10,
  },
  emptyTitle: { fontSize: 15, fontWeight: "700" },
  statsRow: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 24,
  },
  statNum: { fontSize: 15, fontWeight: "800" },
  statLbl: { fontSize: 10, marginTop: 2, fontWeight: "600" },
  statDiv: { width: 1, marginHorizontal: 4 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
  },
  chartCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  yAxis: {
    width: 28,
    justifyContent: "space-between",
    height: 120,
    paddingRight: 4,
  },
  yLabel: { fontSize: 9, textAlign: "right" },
  bar: { width: "100%", borderRadius: 3 },
  barLabel: { fontSize: 9, marginTop: 3 },
  passLineNote: { fontSize: 10, marginTop: 8, fontWeight: "600" },
  improveCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    marginBottom: 20,
  },
  improveNum: { fontSize: 22, fontWeight: "800" },
  improveSub: { fontSize: 12, marginTop: 3, lineHeight: 18 },
  attemptCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  attemptRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  attemptNum: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  attemptNumTxt: { fontSize: 12, fontWeight: "800" },
  attemptDate: { fontSize: 12 },
  attemptDelta: { fontSize: 11, marginTop: 2, fontWeight: "600" },
  attemptBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  attemptBadgeTxt: { fontSize: 14, fontWeight: "800" },
  passBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
