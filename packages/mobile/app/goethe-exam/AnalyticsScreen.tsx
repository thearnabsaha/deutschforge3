/**
 * AnalyticsScreen — overall exam performance dashboard.
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
import { ChevronLeft, BarChart2, Check, X, Headphones, BookOpen, PenLine, Mic, ClipboardList } from "lucide-react-native";
import { useTheme } from "../../lib/theme";
import {
  getBestScore,
  getAttemptCount,
  hasEverPassed,
  scoreColor,
} from "../../lib/examAnalytics";
import type { ExamResultsV2 } from "../../lib/examAnalytics";
import { LEVEL_META, SECTION_META, getExams } from "../../lib/goetheExamData";
import type { Level, Section } from "../../lib/goetheExamData";

function SectionIcon({ section, size = 18, color }: { section: Section; size?: number; color: string }) {
  if (section === "hoeren")    return <Headphones size={size} color={color} strokeWidth={1.8} />;
  if (section === "lesen")     return <BookOpen   size={size} color={color} strokeWidth={1.8} />;
  if (section === "schreiben") return <PenLine    size={size} color={color} strokeWidth={1.8} />;
  return <Mic size={size} color={color} strokeWidth={1.8} />;
}

const LEVELS: Level[] = ["A1", "A2", "B1"];
const SECTIONS: Section[] = ["hoeren", "lesen", "schreiben", "sprechen"];

interface Props {
  results: ExamResultsV2;
  onBack: () => void;
  onViewExamDetail: (examId: string, level: Level, section: Section) => void;
}

export default function AnalyticsScreen({ results, onBack, onViewExamDetail }: Props) {
  const { theme: t } = useTheme();

  // ── Global stats ──────────────────────────────────────────────
  const allExamIds = Object.keys(results);
  const totalAttempts = allExamIds.reduce((s, id) => s + (results[id]?.length ?? 0), 0);
  const totalExams = allExamIds.filter((id) => getAttemptCount(results, id) > 0).length;
  const totalPassed = allExamIds.filter((id) => hasEverPassed(results, id)).length;
  const passRate = totalExams > 0 ? Math.round((totalPassed / totalExams) * 100) : 0;

  // Scores of all best-scores
  const allBest = allExamIds
    .map((id) => getBestScore(results, id))
    .filter((s): s is number => s !== null);
  const avgScore = allBest.length > 0 ? Math.round(allBest.reduce((a, b) => a + b, 0) / allBest.length) : 0;

  // ── Recent activity (last 10 attempts across all exams) ───────
  type RecentItem = { examId: string; date: string; score: number; total: number; passed: boolean };
  const recent: RecentItem[] = [];
  for (const [examId, attempts] of Object.entries(results)) {
    if (!attempts?.length) continue;
    for (const a of attempts) {
      recent.push({ examId, date: a.date, score: a.score, total: a.rawTotal, passed: a.passed });
    }
  }
  recent.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const recentSlice = recent.slice(0, 10);

  const fmtDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes()
        .toString()
        .padStart(2, "0")}`;
    } catch {
      return iso.slice(0, 10);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }}>
      <StatusBar barStyle={t.dark ? "light-content" : "dark-content"} backgroundColor={t.background} />
      {/* Header */}
      <View style={[a.header, { backgroundColor: t.surface, borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={onBack} style={{ padding: 4 }}>
          <ChevronLeft size={24} color={t.primary} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <BarChart2 size={16} color={t.text} strokeWidth={2} />
          <Text style={[a.headerTitle, { color: t.text }]}>Analytics</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={a.page} showsVerticalScrollIndicator={false}>
        {/* Overall stats bar */}
        <View style={[a.statsBar, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
          {[
            { num: totalExams, label: "Attempted" },
            { num: totalPassed, label: "Passed" },
            { num: `${passRate}%`, label: "Pass Rate" },
            { num: avgScore > 0 ? `${avgScore}%` : "—", label: "Avg Score" },
            { num: totalAttempts, label: "Total Tries" },
          ].map((stat, idx) => (
            <React.Fragment key={stat.label}>
              {idx > 0 && <View style={[a.statDiv, { backgroundColor: t.border }]} />}
              <View style={{ flex: 1, alignItems: "center" }}>
                <Text style={[a.statNum, { color: t.text }]}>{stat.num}</Text>
                <Text style={[a.statLbl, { color: t.textMuted }]}>{stat.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Level breakdown */}
        <Text style={[a.sectionLabel, { color: t.textMuted }]}>BY LEVEL</Text>
        {LEVELS.map((level) => {
          const lm = LEVEL_META[level];
          const exams = SECTIONS.flatMap((sec) => getExams(level, sec));
          const lvlAttempted = exams.filter((e) => getAttemptCount(results, e.id) > 0).length;
          const lvlPassed = exams.filter((e) => hasEverPassed(results, e.id)).length;
          const lvlPassRate = lvlAttempted > 0 ? Math.round((lvlPassed / lvlAttempted) * 100) : 0;
          return (
            <View
              key={level}
              style={[a.levelCard, { backgroundColor: t.surface, borderColor: t.border }]}
            >
              <View style={a.levelCardRow}>
                <View style={[a.levelCircle, { backgroundColor: lm.color }]}>
                  <Text style={a.levelCircleTxt}>{level}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[a.cardTitle, { color: t.text }]}>{lm.label}</Text>
                  <Text style={[a.cardSub, { color: t.textSecondary }]}>
                    {lvlAttempted} attempted · {lvlPassed} passed · {lvlPassRate}%
                  </Text>
                </View>
              </View>
              {/* Section mini-grid */}
              <View style={a.secGrid}>
                {SECTIONS.map((sec) => {
                  const sm = SECTION_META[sec];
                  const secExams = getExams(level, sec);
                  const secAttempted = secExams.filter((e) => getAttemptCount(results, e.id) > 0).length;
                  const secPassed = secExams.filter((e) => hasEverPassed(results, e.id)).length;
                  const secBest = secExams
                    .map((e) => getBestScore(results, e.id))
                    .filter((s): s is number => s !== null);
                  const secAvg =
                    secBest.length > 0
                      ? Math.round(secBest.reduce((a, b) => a + b, 0) / secBest.length)
                      : null;
                  return (
                    <View
                      key={sec}
                      style={[a.secCell, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}
                    >
                      <SectionIcon section={sec} size={18} color={sm.color} />
                      <Text style={[a.secCellLbl, { color: t.textSecondary }]}>
                        {sm.label.split(" ")[0]}
                      </Text>
                      <Text style={[a.secCellNum, { color: secAttempted > 0 ? lm.color : t.textMuted }]}>
                        {secAttempted > 0 ? `${secPassed}/${secAttempted}` : "—"}
                      </Text>
                      {secAvg !== null && (
                        <View
                          style={[
                            a.secBar,
                            { backgroundColor: t.border },
                          ]}
                        >
                          <View
                            style={[
                              a.secBarFill,
                              {
                                width: `${secAvg}%` as any,
                                backgroundColor: scoreColor(secAvg),
                              },
                            ]}
                          />
                        </View>
                      )}
                      {secAvg !== null && (
                        <Text style={[a.secCellAvg, { color: scoreColor(secAvg) }]}>
                          avg {secAvg}%
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        {/* Recent activity */}
        {recentSlice.length > 0 && (
          <>
            <Text style={[a.sectionLabel, { color: t.textMuted }]}>RECENT ACTIVITY</Text>
            <View style={[a.recentCard, { backgroundColor: t.surface, borderColor: t.border }]}>
              {recentSlice.map((item, idx) => {
                // parse level/section from examId e.g. "a1_h_001" or "b1_sc_005"
                const parts = item.examId.split("_");
                const levelStr = (parts[0]?.toUpperCase() ?? "A1") as Level;
                const secCode = parts[1] ?? "h";
                const secMap: Record<string, Section> = {
                  h: "hoeren",
                  ho: "hoeren",
                  l: "lesen",
                  le: "lesen",
                  sc: "schreiben",
                  sp: "sprechen",
                };
                const secStr: Section = secMap[secCode] ?? "hoeren";
                const sm = SECTION_META[secStr];
                const color = scoreColor(item.score);
                return (
                  <TouchableOpacity
                    key={`${item.examId}_${item.date}_${idx}`}
                    style={[
                      a.recentRow,
                      idx < recentSlice.length - 1 && { borderBottomWidth: 1, borderBottomColor: t.border },
                    ]}
                    onPress={() => onViewExamDetail(item.examId, levelStr, secStr)}
                    activeOpacity={0.7}
                  >
                    <SectionIcon section={secStr} size={20} color={sm.color} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[a.recentExamId, { color: t.text }]}>
                        {levelStr} · {sm.label} · #{item.examId.split("_").pop()}
                      </Text>
                      <Text style={[a.recentDate, { color: t.textMuted }]}>{fmtDate(item.date)}</Text>
                    </View>
                    <View style={[a.recentBadge, { backgroundColor: color + "20" }]}>
                      {item.total > 0
                        ? <Text style={[a.recentBadgeTxt, { color }]}>{item.score}%</Text>
                        : item.passed
                          ? <Check size={14} color={color} strokeWidth={3} />
                          : <X size={14} color={color} strokeWidth={3} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {totalExams === 0 && (
          <View style={[a.emptyCard, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
            <View style={{ alignItems: "center", marginBottom: 8 }}>
              <ClipboardList size={40} color={t.textMuted} strokeWidth={1.5} />
            </View>
            <Text style={[a.emptyTitle, { color: t.text }]}>No exams attempted yet</Text>
            <Text style={[a.emptySub, { color: t.textSecondary }]}>
              Start practicing to see your analytics here.
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const a = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  page: { padding: 20 },
  statsBar: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 24,
  },
  statNum: { fontSize: 18, fontWeight: "800" },
  statLbl: { fontSize: 10, marginTop: 2, fontWeight: "600" },
  statDiv: { width: 1, marginHorizontal: 4 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 4,
  },
  levelCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  levelCardRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  levelCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  levelCircleTxt: { color: "#fff", fontSize: 15, fontWeight: "800" },
  cardTitle: { fontSize: 15, fontWeight: "700" },
  cardSub: { fontSize: 12, marginTop: 2 },
  secGrid: { flexDirection: "row", gap: 8 },
  secCell: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    padding: 8,
    alignItems: "center",
    gap: 3,
  },
  secCellLbl: { fontSize: 10, fontWeight: "600" },
  secCellNum: { fontSize: 13, fontWeight: "800" },
  secBar: { width: "100%", height: 3, borderRadius: 2, overflow: "hidden", marginTop: 2 },
  secBarFill: { height: 3, borderRadius: 2 },
  secCellAvg: { fontSize: 9, fontWeight: "700" },
  recentCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 16 },
  recentRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12 },
  recentExamId: { fontSize: 13, fontWeight: "600" },
  recentDate: { fontSize: 11, marginTop: 2 },
  recentBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  recentBadgeTxt: { fontSize: 13, fontWeight: "800" },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
    gap: 10,
    marginTop: 16,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700" },
  emptySub: { fontSize: 13, textAlign: "center", lineHeight: 20 },
});
