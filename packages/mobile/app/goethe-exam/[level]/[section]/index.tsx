import React, { useEffect, useState } from "react";
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
import { useTheme } from "../../../../lib/theme";
import {
  SECTION_META,
  LEVEL_META,
  getExams,
} from "../../../../lib/goetheExamData";
import type { Section, Level, AnyExam } from "../../../../lib/goetheExamData";
import { Storage } from "../../../../lib/storage";

const RESULTS_KEY = "goethe_exam_results_v1";

interface ExamResult {
  examId: string;
  score: number;
  total: number;
  passed: boolean;
  date: string;
}

export default function GoetheExamListScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const { level, section } = useLocalSearchParams<{ level: string; section: string }>();
  const lvl = (level as Level) || "A1";
  const sec = (section as Section) || "hoeren";

  const exams = getExams(lvl, sec) as AnyExam[];
  const sectionMeta = SECTION_META[sec];
  const levelMeta = LEVEL_META[lvl];

  const [results, setResults] = useState<Record<string, ExamResult>>({});

  useEffect(() => {
    Storage.getItem(RESULTS_KEY).then((raw) => {
      if (raw) try { setResults(JSON.parse(raw)); } catch {}
    });
  }, []);

  const getResultBadge = (examId: string) => {
    const r = results[examId];
    if (!r) return null;
    return r;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }}>
      <StatusBar barStyle={t.dark ? "light-content" : "dark-content"} backgroundColor={t.background} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={[styles.backText, { color: t.primary }]}>‹ Sections</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: sectionMeta.color + "20" }]}>
            <Text style={styles.icon}>{sectionMeta.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionName, { color: sectionMeta.color }]}>
              {lvl} · {sectionMeta.label}
            </Text>
            <Text style={[styles.sectionDesc, { color: t.textSecondary }]}>
              {sectionMeta.description}
            </Text>
          </View>
        </View>

        {/* Stats Bar */}
        <View style={[styles.statsBar, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: t.text }]}>{exams.length}</Text>
            <Text style={[styles.statLabel, { color: t.textMuted }]}>Exams</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: t.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: t.text }]}>
              {Object.values(results).filter((r) => r.passed && exams.find((e) => e.id === r.examId)).length}
            </Text>
            <Text style={[styles.statLabel, { color: t.textMuted }]}>Passed</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: t.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: t.text }]}>
              {Object.values(results).filter((r) => exams.find((e) => e.id === r.examId)).length}
            </Text>
            <Text style={[styles.statLabel, { color: t.textMuted }]}>Attempted</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: t.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: levelMeta.color }]}>{levelMeta.passScore}</Text>
            <Text style={[styles.statLabel, { color: t.textMuted }]}>Pass Score</Text>
          </View>
        </View>

        {/* Exam List */}
        <Text style={[styles.sectionLabel, { color: t.textMuted }]}>30 MOCK EXAMS</Text>
        <View style={styles.grid}>
          {exams.map((exam, idx) => {
            const result = getResultBadge(exam.id);
            const isNew = !result;
            return (
              <TouchableOpacity
                key={exam.id}
                style={[
                  styles.examCard,
                  {
                    backgroundColor: t.surface,
                    borderColor: result
                      ? result.passed
                        ? "#4CAF50"
                        : "#F44336"
                      : t.border,
                    borderWidth: result ? 2 : 1,
                  },
                ]}
                onPress={() =>
                  router.push(`/goethe-exam/${lvl}/${sec}/${exam.id}` as any)
                }
                activeOpacity={0.7}
              >
                <View style={styles.examNumber}>
                  <Text
                    style={[
                      styles.examNum,
                      { color: result ? (result.passed ? "#4CAF50" : "#F44336") : sectionMeta.color },
                    ]}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </Text>
                </View>
                {result ? (
                  <View style={styles.examResult}>
                    <Text
                      style={[
                        styles.resultScore,
                        { color: result.passed ? "#4CAF50" : "#F44336" },
                      ]}
                    >
                      {result.score}/{result.total}
                    </Text>
                    <Text style={[styles.resultLabel, { color: t.textMuted }]}>
                      {result.passed ? "✓ Passed" : "✗ Failed"}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.examNew}>
                    <Text style={[styles.newLabel, { color: t.textMuted }]}>New</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  backBtn: { marginBottom: 16 },
  backText: { fontSize: 16, fontWeight: "600" },
  header: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 },
  iconBox: { width: 54, height: 54, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 28 },
  sectionName: { fontSize: 18, fontWeight: "800" },
  sectionDesc: { fontSize: 13, marginTop: 2 },
  statsBar: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  statItem: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, marginTop: 2, fontWeight: "600" },
  statDivider: { width: 1, marginHorizontal: 8 },
  sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  examCard: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
  },
  examNumber: { alignItems: "center" },
  examNum: { fontSize: 18, fontWeight: "800" },
  examResult: { alignItems: "center", marginTop: 2 },
  resultScore: { fontSize: 12, fontWeight: "700" },
  resultLabel: { fontSize: 10, marginTop: 1 },
  examNew: { alignItems: "center", marginTop: 2 },
  newLabel: { fontSize: 11, fontWeight: "600" },
});
