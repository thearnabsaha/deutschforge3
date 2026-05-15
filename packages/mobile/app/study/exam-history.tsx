import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Trophy, Clock, Trash2, Calendar } from "lucide-react-native";
import { useTheme } from "../../lib/theme";
import { Storage } from "../../lib/storage";
import { EXAM_HISTORY_KEY } from "../../lib/confidence";
import type { ExamHistoryEntry } from "../../lib/confidence";

const GRADE_COLORS: Record<string, string> = {
  A: "#58CC02", B: "#45A800", C: "#FFC800", D: "#FF9F1C", F: "#FF4B4B",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec / 60)}m ${sec % 60}s`;
}

export default function ExamHistory() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ setId: string; setName: string }>();

  const [history, setHistory] = useState<ExamHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const raw = await Storage.getItem(EXAM_HISTORY_KEY);
      const all: ExamHistoryEntry[] = raw ? JSON.parse(raw) : [];
      // Filter to this set if setId provided
      const filtered = params.setId
        ? all.filter((e) => e.setId === params.setId)
        : all;
      setHistory(filtered);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [params.setId]);

  useEffect(() => { load(); }, [load]);

  const clearHistory = useCallback(() => {
    Alert.alert(
      "Clear History?",
      params.setId
        ? `Delete all exam history for "${params.setName}"?`
        : "Delete all exam history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear", style: "destructive", onPress: async () => {
            if (params.setId) {
              // Only clear this set's entries
              const raw = await Storage.getItem(EXAM_HISTORY_KEY);
              const all: ExamHistoryEntry[] = raw ? JSON.parse(raw) : [];
              const remaining = all.filter((e) => e.setId !== params.setId);
              await Storage.setItem(EXAM_HISTORY_KEY, JSON.stringify(remaining));
            } else {
              await Storage.removeItem(EXAM_HISTORY_KEY);
            }
            setHistory([]);
          },
        },
      ]
    );
  }, [params.setId, params.setName]);

  // Best score
  const bestEntry = history.length > 0
    ? history.reduce((best, e) => ((e.score / e.total) > (best.score / best.total) ? e : best))
    : null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.background }]} edges={["top"]}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={t.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={{ flex: 1, paddingHorizontal: 10 }}>
          <Text style={[styles.topBarTitle, { color: t.text }]}>Exam History</Text>
          {params.setName ? (
            <Text style={[styles.topBarSub, { color: t.textMuted }]} numberOfLines={1}>{params.setName}</Text>
          ) : null}
        </View>
        {history.length > 0 && (
          <TouchableOpacity onPress={clearHistory} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Trash2 size={20} color="#FF4B4B" strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.emptyBox}>
          <Text style={[styles.emptyText, { color: t.textMuted }]}>Loading…</Text>
        </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={{ fontSize: 48 }}>📋</Text>
          <Text style={[styles.emptyTitle, { color: t.text }]}>No history yet</Text>
          <Text style={[styles.emptyText, { color: t.textMuted }]}>Complete an exam to see your results here</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Summary stats */}
          <View style={[styles.summaryBox, { backgroundColor: t.surface, borderColor: t.border }]}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNum, { color: t.text }]}>{history.length}</Text>
              <Text style={[styles.summaryLabel, { color: t.textMuted }]}>Attempts</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: t.border }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNum, { color: "#58CC02" }]}>
                {bestEntry ? `${Math.round((bestEntry.score / bestEntry.total) * 100)}%` : "—"}
              </Text>
              <Text style={[styles.summaryLabel, { color: t.textMuted }]}>Best Score</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: t.border }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNum, { color: t.text }]}>
                {Math.round(history.reduce((s, e) => s + (e.score / e.total), 0) / history.length * 100)}%
              </Text>
              <Text style={[styles.summaryLabel, { color: t.textMuted }]}>Avg Score</Text>
            </View>
          </View>

          {/* Entries */}
          {history.map((entry, i) => {
            const pct = Math.round((entry.score / entry.total) * 100);
            const gradeColor = GRADE_COLORS[entry.grade] ?? "#888";
            const isBest = entry.id === bestEntry?.id;

            return (
              <View key={entry.id} style={[styles.entryCard, { backgroundColor: t.surface, borderColor: t.border }]}>
                <View style={styles.entryTop}>
                  {/* Grade */}
                  <View style={[styles.gradeBox, { borderColor: gradeColor, backgroundColor: gradeColor + "15" }]}>
                    <Text style={[styles.gradeText, { color: gradeColor }]}>{entry.grade}</Text>
                  </View>

                  {/* Score + set name */}
                  <View style={{ flex: 1 }}>
                    <View style={styles.scoreRow}>
                      <Text style={[styles.scoreText, { color: t.text }]}>{entry.score}/{entry.total}</Text>
                      <Text style={[styles.pctText, { color: gradeColor }]}>{pct}%</Text>
                      {isBest && (
                        <View style={[styles.bestBadge, { backgroundColor: "#FFC80022", borderColor: "#FFC800" }]}>
                          <Trophy size={10} color="#FFC800" strokeWidth={2} />
                          <Text style={styles.bestBadgeText}>Best</Text>
                        </View>
                      )}
                    </View>
                    {!params.setId && (
                      <Text style={[styles.setNameText, { color: t.textMuted }]} numberOfLines={1}>{entry.setName}</Text>
                    )}
                  </View>
                </View>

                {/* Score bar */}
                <View style={[styles.barBg, { backgroundColor: t.border }]}>
                  <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: gradeColor }]} />
                </View>

                {/* Meta */}
                <View style={styles.entryMeta}>
                  <View style={styles.metaItem}>
                    <Calendar size={11} color={t.textMuted} strokeWidth={2} />
                    <Text style={[styles.metaText, { color: t.textMuted }]}>{formatDate(entry.date)}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Clock size={11} color={t.textMuted} strokeWidth={2} />
                    <Text style={[styles.metaText, { color: t.textMuted }]}>{formatTime(entry.date)}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={[styles.metaText, { color: t.textMuted }]}>⏱ {formatDuration(entry.durationSec)}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  topBarTitle: { fontSize: 16, fontWeight: "800" },
  topBarSub: { fontSize: 12, fontWeight: "600", marginTop: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 10 },
  emptyBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: "800" },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  summaryBox: {
    borderRadius: 16, borderWidth: 1.5, padding: 16,
    flexDirection: "row", alignItems: "center",
    marginBottom: 4,
  },
  summaryItem: { flex: 1, alignItems: "center", gap: 3 },
  summaryDivider: { width: 1, height: 36, marginHorizontal: 8 },
  summaryNum: { fontSize: 22, fontWeight: "900" },
  summaryLabel: { fontSize: 11, fontWeight: "600" },
  entryCard: {
    borderRadius: 16, borderWidth: 1.5, padding: 14,
    gap: 8,
  },
  entryTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  gradeBox: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 2.5,
    alignItems: "center", justifyContent: "center",
  },
  gradeText: { fontSize: 20, fontWeight: "900" },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  scoreText: { fontSize: 16, fontWeight: "800" },
  pctText: { fontSize: 14, fontWeight: "700" },
  bestBadge: { flexDirection: "row", alignItems: "center", gap: 3, borderRadius: 8, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2 },
  bestBadgeText: { fontSize: 10, fontWeight: "800", color: "#FFC800" },
  setNameText: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  barBg: { height: 5, borderRadius: 3, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 3 },
  entryMeta: { flexDirection: "row", gap: 14, flexWrap: "wrap" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11, fontWeight: "600" },
});
