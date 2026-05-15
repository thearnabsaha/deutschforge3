import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { ChevronLeft, Volume2, CheckCircle2, XCircle, Trophy, AlertTriangle, History } from "lucide-react-native";
import { useTheme } from "../../lib/theme";
import { DeutschForgeMascot } from "../../components/DeutschForgeMascot";
import { Storage } from "../../lib/storage";
import { EXAM_HISTORY_KEY } from "../../lib/confidence";
import type { ExamHistoryEntry } from "../../lib/confidence";
import type { StudyWord } from "../(tabs)/study";

type QType = "meaning" | "article" | "typing_hint";

interface ExamQuestion {
  type: QType;
  word: StudyWord;
  options: string[];
  correct: string;
  promptText: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ARTICLES = ["der", "die", "das"];
const ARTICLE_COLORS: Record<string, string> = { der: "#1CB0F6", die: "#FF4B4B", das: "#58CC02" };

function buildExam(words: StudyWord[], allWords: StudyWord[]): ExamQuestion[] {
  const pool = allWords.length >= 4 ? allWords : words;
  const nouns = words.filter((w) => w.partOfSpeech === "noun" && w.gender);

  return shuffle(words).map((w, i) => {
    const isNoun = w.partOfSpeech === "noun" && w.gender;
    const useArticle = isNoun && nouns.length >= 3 && i % 3 === 0;

    if (useArticle) {
      return {
        type: "article" as QType,
        word: w,
        options: shuffle(ARTICLES),
        correct: w.gender!,
        promptText: `What is the article for "${w.german}"?`,
      };
    } else {
      const correct = w.english;
      const distractors = shuffle(pool.filter((p) => p.id !== w.id && p.english !== correct))
        .slice(0, 3)
        .map((p) => p.english);
      return {
        type: "meaning" as QType,
        word: w,
        options: shuffle([correct, ...distractors]),
        correct,
        promptText: `What does "${w.displayGerman ?? w.german}" mean?`,
      };
    }
  });
}

interface ExamResult {
  question: ExamQuestion;
  selected: string;
  correct: boolean;
  timeMs: number;
}

export default function ExamMode() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ setId: string; setName: string; words: string; allWords: string }>();

  const setWords: StudyWord[] = useMemo(() => {
    try { return JSON.parse(params.words ?? "[]"); } catch { return []; }
  }, [params.words]);
  const allWords: StudyWord[] = useMemo(() => {
    try { return JSON.parse(params.allWords ?? "[]"); } catch { return setWords; }
  }, [params.allWords, setWords]);

  const questions = useMemo(() => buildExam(setWords, allWords), [setWords, allWords]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [done, setDone] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const startTimeRef = useRef(Date.now());
  const qStartRef = useRef(Date.now());

  const q = questions[index];

  const speak = useCallback(() => {
    if (!q) return;
    Speech.stop();
    Speech.speak(q.word.displayGerman ?? q.word.german, { language: "de-DE", rate: 0.85 });
  }, [q]);

  const handleSelect = useCallback((opt: string) => {
    if (selected !== null) return;
    setSelected(opt);
    const correct = opt === q.correct;
    const timeMs = Date.now() - qStartRef.current;
    setResults((prev) => [...prev, { question: q, selected: opt, correct, timeMs }]);
    // No audio feedback in exam mode — no hints!
  }, [selected, q]);

  const handleNext = useCallback(() => {
    if (index + 1 >= questions.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
      qStartRef.current = Date.now();
    }
  }, [index, questions.length]);

  const handleQuit = useCallback(() => {
    Alert.alert("Quit Exam?", "Your progress will be lost.", [
      { text: "Cancel", style: "cancel" },
      { text: "Quit", style: "destructive", onPress: () => router.back() },
    ]);
  }, [router]);

  const handleRestart = useCallback(() => {
    setIndex(0);
    setSelected(null);
    setResults([]);
    setDone(false);
    setShowReview(false);
    qStartRef.current = Date.now();
    startTimeRef.current = Date.now();
  }, []);

  // Save exam result to history when done
  useEffect(() => {
    if (!done || results.length === 0) return;
    const correct = results.filter((r) => r.correct).length;
    const total = results.length;
    const pct = Math.round((correct / total) * 100);
    const totalTimeSec = Math.round((Date.now() - startTimeRef.current) / 1000);
    const grade = pct >= 90 ? "A" : pct >= 75 ? "B" : pct >= 60 ? "C" : pct >= 45 ? "D" : "F";
    const wrongWordIds = results.filter((r) => !r.correct).map((r) => r.question.word.id);

    const entry: ExamHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      setId: params.setId ?? "unknown",
      setName: params.setName ?? "Unnamed Set",
      date: new Date().toISOString(),
      score: correct,
      total,
      grade,
      durationSec: totalTimeSec,
      wrongWordIds,
    };

    Storage.getItem(EXAM_HISTORY_KEY).then((raw) => {
      const existing: ExamHistoryEntry[] = raw ? JSON.parse(raw) : [];
      existing.unshift(entry); // newest first
      // Keep max 200 entries
      const trimmed = existing.slice(0, 200);
      Storage.setItem(EXAM_HISTORY_KEY, JSON.stringify(trimmed));
    }).catch(console.error);
  }, [done]);

  if (done) {
    const correct = results.filter((r) => r.correct).length;
    const total = results.length;
    const pct = Math.round((correct / total) * 100);
    const totalTimeSec = Math.round((Date.now() - startTimeRef.current) / 1000);
    const avgTimeMs = Math.round(results.reduce((s, r) => s + r.timeMs, 0) / results.length / 100) / 10;

    const grade = pct >= 90 ? { label: "A", color: "#58CC02" }
      : pct >= 75 ? { label: "B", color: "#45A800" }
      : pct >= 60 ? { label: "C", color: "#FFC800" }
      : pct >= 45 ? { label: "D", color: "#FF9F1C" }
      : { label: "F", color: "#FF4B4B" };

    if (showReview) {
      return (
        <SafeAreaView style={[styles.safe, { backgroundColor: t.background }]} edges={["top"]}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => setShowReview(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <ChevronLeft size={24} color={t.text} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={[styles.topBarTitle, { color: t.text }]}>Review Answers</Text>
            <View style={{ width: 32 }} />
          </View>
          <ScrollView contentContainerStyle={styles.reviewList}>
            {results.map((r, i) => (
              <View key={i} style={[styles.reviewItem, {
                backgroundColor: r.correct ? "#58CC0215" : "#FF4B4B15",
                borderColor: r.correct ? "#58CC0244" : "#FF4B4B44",
              }]}>
                <View style={styles.reviewItemTop}>
                  {r.correct
                    ? <CheckCircle2 size={18} color="#58CC02" strokeWidth={2.5} />
                    : <XCircle size={18} color="#FF4B4B" strokeWidth={2.5} />
                  }
                  <Text style={[styles.reviewWord, { color: t.text }]}>
                    {r.question.word.displayGerman ?? r.question.word.german}
                  </Text>
                  <Text style={[styles.reviewType, { color: t.textMuted }]}>
                    [{r.question.type}]
                  </Text>
                </View>
                <Text style={[styles.reviewAnswer, { color: r.correct ? "#58CC02" : "#FF4B4B" }]}>
                  Your answer: {r.selected}
                </Text>
                {!r.correct && (
                  <Text style={[styles.reviewCorrect, { color: t.textMuted }]}>
                    Correct: {r.question.correct}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: t.background }]} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.doneContainer}>
          <DeutschForgeMascot mood={pct >= 60 ? "celebrate" : "sad"} size={120} controlled />
          <Text style={[styles.doneTitle, { color: t.text }]}>Exam Complete!</Text>

          {/* Grade circle */}
          <View style={[styles.gradeCircle, { borderColor: grade.color }]}>
            <Text style={[styles.gradeText, { color: grade.color }]}>{grade.label}</Text>
          </View>

          {/* Stats */}
          <View style={[styles.statsBox, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: t.textMuted }]}>Score</Text>
              <Text style={[styles.statValue, { color: t.text }]}>{correct}/{total} ({pct}%)</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: t.border }]} />
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: t.textMuted }]}>Time</Text>
              <Text style={[styles.statValue, { color: t.text }]}>{totalTimeSec}s</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: t.border }]} />
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: t.textMuted }]}>Avg per Q</Text>
              <Text style={[styles.statValue, { color: t.text }]}>{avgTimeMs}s</Text>
            </View>
          </View>

          {/* Score bar */}
          <View style={[styles.scoreBarBg, { backgroundColor: t.border }]}>
            <View style={[styles.scoreBarFill, { width: `${pct}%`, backgroundColor: grade.color }]} />
          </View>

          <TouchableOpacity style={[styles.reviewBtn, { borderColor: t.border }]} onPress={() => setShowReview(true)}>
            <Text style={[styles.reviewBtnText, { color: t.textMuted }]}>Review Answers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { backgroundColor: t.primary }]} onPress={handleRestart}>
            <Text style={styles.btnText}>Retake Exam</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.historyBtn, { borderColor: "#1CB0F6", backgroundColor: "#1CB0F611" }]}
            onPress={() => router.push({
              pathname: "/study/exam-history",
              params: { setId: params.setId, setName: params.setName },
            } as any)}
          >
            <History size={15} color="#1CB0F6" strokeWidth={2} />
            <Text style={[styles.historyBtnText, { color: "#1CB0F6" }]}>View History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnOutline, { borderColor: t.border }]} onPress={() => router.back()}>
            <Text style={[styles.btnOutlineText, { color: t.textMuted }]}>Back to Modes</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const isArticleQ = q?.type === "article";
  const progress = index / questions.length;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.background }]} edges={["top"]}>
      {/* Exam top bar */}
      <View style={[styles.topBar, { borderBottomColor: t.border, borderBottomWidth: 1 }]}>
        <TouchableOpacity onPress={handleQuit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={t.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.examBadge}>
          <Trophy size={14} color="#FFC800" strokeWidth={2} />
          <Text style={[styles.topBarTitle, { color: t.text }]}>Final Exam</Text>
        </View>
        <Text style={[styles.qCounter, { color: t.textMuted }]}>{index + 1}/{questions.length}</Text>
      </View>

      {/* Progress */}
      <View style={[styles.progressBg, { backgroundColor: t.border }]}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: "#FFC800" }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* No hints banner */}
        <View style={[styles.noHintsBanner, { backgroundColor: "#FFC80015", borderColor: "#FFC80044" }]}>
          <AlertTriangle size={13} color="#AA8800" strokeWidth={2} />
          <Text style={styles.noHintsText}>Exam mode — no hints shown until you answer</Text>
        </View>

        {/* Word card */}
        <View style={[styles.wordCard, { backgroundColor: t.surface, borderColor: t.border }]}>
          <Text style={[styles.promptText, { color: t.textMuted }]}>{q?.promptText}</Text>
          <View style={styles.wordRow}>
            <Text style={[styles.wordText, { color: t.text }]}>
              {isArticleQ ? `___ ${q?.word.german}` : (q?.word.displayGerman ?? q?.word.german)}
            </Text>
            <TouchableOpacity onPress={speak} style={styles.audioBtn}>
              <Volume2 size={20} color="#1CB0F6" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          {/* No IPA in exam mode */}
        </View>

        {/* Options */}
        <View style={isArticleQ ? styles.optionsRow : styles.optionsGrid}>
          {q?.options.map((opt, i) => {
            const isSelected = selected === opt;
            const isRight = selected !== null && opt === q.correct;
            const isWrong = isSelected && opt !== q.correct;

            if (isArticleQ) {
              const artColor = ARTICLE_COLORS[opt] ?? t.primary;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.articleBtn, {
                    backgroundColor: isRight ? artColor + "33" : isWrong ? "#FF4B4B22" : t.surface,
                    borderColor: isRight ? artColor : isWrong ? "#FF4B4B" : t.border,
                    borderWidth: isRight || isWrong ? 2.5 : 1.5,
                  }]}
                  onPress={() => handleSelect(opt)}
                  disabled={selected !== null}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.articleText, { color: isRight ? artColor : isWrong ? "#FF4B4B" : t.text }]}>{opt}</Text>
                  {isRight && <CheckCircle2 size={14} color={artColor} strokeWidth={2.5} />}
                  {isWrong && <XCircle size={14} color="#FF4B4B" strokeWidth={2.5} />}
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={i}
                style={[styles.optionBtn, {
                  backgroundColor: isRight ? "#58CC0222" : isWrong ? "#FF4B4B22" : t.surface,
                  borderColor: isRight ? "#58CC02" : isWrong ? "#FF4B4B" : t.border,
                  borderWidth: isRight || isWrong ? 2.5 : 1.5,
                }]}
                onPress={() => handleSelect(opt)}
                disabled={selected !== null}
                activeOpacity={0.75}
              >
                <View style={styles.optionInner}>
                  <View style={[styles.optIdx, { backgroundColor: isRight ? "#58CC02" : isWrong ? "#FF4B4B" : t.surfaceAlt }]}>
                    <Text style={[styles.optIdxText, { color: isRight || isWrong ? "#fff" : t.textMuted }]}>
                      {["A", "B", "C", "D"][i]}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, { color: isRight ? "#58CC02" : isWrong ? "#FF4B4B" : t.text }]}>{opt}</Text>
                  {isRight && <CheckCircle2 size={14} color="#58CC02" strokeWidth={2.5} />}
                  {isWrong && <XCircle size={14} color="#FF4B4B" strokeWidth={2.5} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {selected !== null && (
          <TouchableOpacity style={[styles.nextBtn, { backgroundColor: "#FFC800" }]} onPress={handleNext}>
            <Text style={[styles.nextBtnText, { color: "#1F1F1F" }]}>
              {index + 1 >= questions.length ? "See Results" : "Next →"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  topBarTitle: { fontSize: 16, fontWeight: "800" },
  examBadge: { flexDirection: "row", alignItems: "center", gap: 6 },
  qCounter: { fontSize: 14, fontWeight: "700" },
  progressBg: { height: 6, marginHorizontal: 16, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 12 },
  noHintsBanner: {
    flexDirection: "row", alignItems: "center", gap: 7,
    borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8,
  },
  noHintsText: { fontSize: 12, fontWeight: "600", color: "#AA8800" },
  wordCard: {
    borderRadius: 20, borderWidth: 1.5, padding: 18,
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  promptText: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  wordRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  wordText: { fontSize: 30, fontWeight: "900", flex: 1 },
  audioBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#EAF6FF", alignItems: "center", justifyContent: "center" },
  optionsRow: { flexDirection: "row", gap: 10 },
  optionsGrid: { gap: 8 },
  articleBtn: { flex: 1, borderRadius: 14, padding: 14, alignItems: "center", gap: 3 },
  articleText: { fontSize: 22, fontWeight: "900" },
  optionBtn: { borderRadius: 14, borderWidth: 1.5 },
  optionInner: { flexDirection: "row", alignItems: "center", padding: 13, gap: 10 },
  optIdx: { width: 28, height: 28, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  optIdxText: { fontSize: 12, fontWeight: "800" },
  optionText: { flex: 1, fontSize: 15, fontWeight: "700" },
  nextBtn: { borderRadius: 18, paddingVertical: 14, alignItems: "center" },
  nextBtnText: { fontWeight: "900", fontSize: 16 },
  doneContainer: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 28, gap: 14 },
  doneTitle: { fontSize: 26, fontWeight: "900" },
  gradeCircle: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 4, alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 6,
  },
  gradeText: { fontSize: 42, fontWeight: "900" },
  statsBox: { borderRadius: 18, borderWidth: 1.5, padding: 16, width: "100%" },
  statRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 },
  statDivider: { height: 1 },
  statLabel: { fontSize: 14, fontWeight: "600" },
  statValue: { fontSize: 14, fontWeight: "800" },
  scoreBarBg: { height: 8, borderRadius: 4, width: "100%", overflow: "hidden" },
  scoreBarFill: { height: "100%", borderRadius: 4 },
  reviewBtn: { borderRadius: 20, paddingVertical: 12, paddingHorizontal: 28, borderWidth: 1.5 },
  reviewBtnText: { fontWeight: "700", fontSize: 14 },
  btn: { borderRadius: 22, paddingVertical: 14, paddingHorizontal: 32 },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  btnOutline: { borderRadius: 22, paddingVertical: 13, paddingHorizontal: 32, borderWidth: 2 },
  btnOutlineText: { fontWeight: "700", fontSize: 14 },
  historyBtn: { flexDirection: "row", alignItems: "center", gap: 7, borderRadius: 22, paddingVertical: 13, paddingHorizontal: 28, borderWidth: 1.5 },
  historyBtnText: { fontWeight: "700", fontSize: 14 },
  reviewList: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, gap: 10 },
  reviewItem: { borderRadius: 14, borderWidth: 1.5, padding: 14, gap: 4 },
  reviewItemTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  reviewWord: { fontSize: 16, fontWeight: "800", flex: 1 },
  reviewType: { fontSize: 11, fontWeight: "600" },
  reviewAnswer: { fontSize: 13, fontWeight: "600", paddingLeft: 26 },
  reviewCorrect: { fontSize: 12, paddingLeft: 26 },
});
