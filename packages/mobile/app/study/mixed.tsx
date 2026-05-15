import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { Volume2, ChevronLeft, CheckCircle2, XCircle } from "lucide-react-native";
import { useTheme } from "../../lib/theme";
import { DeutschForgeMascot } from "../../components/DeutschForgeMascot";
import type { StudyWord } from "../(tabs)/study";

type QuestionType = "meaning" | "article" | "fillblank";

interface MixedQuestion {
  type: QuestionType;
  word: StudyWord;
  options: string[];
  correct: string;
  prompt: string;
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

function buildMixedQuestions(words: StudyWord[], allWords: StudyWord[]): MixedQuestion[] {
  const pool = allWords.length >= 4 ? allWords : words;
  const nouns = words.filter((w) => w.partOfSpeech === "noun" && w.gender);
  const qs: MixedQuestion[] = [];

  for (const w of shuffle(words)) {
    const rand = Math.random();

    if (w.partOfSpeech === "noun" && w.gender && nouns.length >= 3 && rand < 0.35) {
      // Article question
      qs.push({
        type: "article",
        word: w,
        options: shuffle(ARTICLES),
        correct: w.gender!,
        prompt: `What is the article for "${w.german}"?`,
      });
    } else {
      // Meaning question
      const correct = w.english;
      const distractors = shuffle(pool.filter((p) => p.id !== w.id && p.english !== correct))
        .slice(0, 3)
        .map((p) => p.english);
      qs.push({
        type: "meaning",
        word: w,
        options: shuffle([correct, ...distractors]),
        correct,
        prompt: `What does "${w.displayGerman ?? w.german}" mean?`,
      });
    }
  }
  return qs;
}

export default function MixedMode() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ setId: string; setName: string; words: string; allWords: string }>();

  const setWords: StudyWord[] = useMemo(() => {
    try { return JSON.parse(params.words ?? "[]"); } catch { return []; }
  }, [params.words]);
  const allWords: StudyWord[] = useMemo(() => {
    try { return JSON.parse(params.allWords ?? "[]"); } catch { return setWords; }
  }, [params.allWords, setWords]);

  const questions = useMemo(() => buildMixedQuestions(setWords, allWords), [setWords, allWords]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [done, setDone] = useState(false);
  const [shakeAnim] = useState(new Animated.Value(0));

  const q = questions[index];
  const isCorrect = selected === q?.correct;

  const speak = useCallback(() => {
    if (!q) return;
    Speech.stop();
    Speech.speak(q.word.displayGerman ?? q.word.german, { language: "de-DE", rate: 0.8 });
  }, [q]);

  const handleSelect = useCallback((opt: string) => {
    if (selected !== null) return;
    setSelected(opt);
    const correct = opt === q.correct;
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    speak();
    if (!correct) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 5, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [selected, q, shakeAnim, speak]);

  const handleNext = useCallback(() => {
    if (index + 1 >= questions.length) { setDone(true); }
    else { setIndex((i) => i + 1); setSelected(null); }
  }, [index, questions.length]);

  if (done) {
    const pct = Math.round((score.correct / score.total) * 100);
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: t.background }]} edges={["top"]}>
        <View style={styles.centered}>
          <DeutschForgeMascot mood={pct === 100 ? "celebrate" : pct >= 60 ? "happy" : "sad"} size={120} controlled />
          <Text style={[styles.doneTitle, { color: t.text }]}>{pct === 100 ? "Perfect Mix!" : "Mixed done!"}</Text>
          <View style={[styles.scoreBox, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
            <Text style={[styles.scoreBig, { color: t.primary }]}>{score.correct}/{score.total}</Text>
            <Text style={[styles.scorePct, { color: t.textMuted }]}>{pct}% correct</Text>
          </View>
          <TouchableOpacity style={[styles.btn, { backgroundColor: t.primary }]} onPress={() => { setIndex(0); setSelected(null); setScore({ correct: 0, total: 0 }); setDone(false); }}>
            <Text style={styles.btnText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnOutline, { borderColor: t.border }]} onPress={() => router.back()}>
            <Text style={[styles.btnOutlineText, { color: t.textMuted }]}>Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isArticleQ = q?.type === "article";
  const TYPE_LABEL: Record<QuestionType, string> = { meaning: "MEANING", article: "ARTICLE", fillblank: "FILL IN" };
  const TYPE_COLOR: Record<QuestionType, string> = { meaning: "#58CC02", article: "#CE82FF", fillblank: "#1CB0F6" };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.background }]} edges={["top"]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={t.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: t.text }]}>Mixed Practice</Text>
        <Text style={[styles.scoreLabel, { color: t.accent }]}>{score.correct}/{score.total}</Text>
      </View>

      <View style={[styles.progressBg, { backgroundColor: t.border }]}>
        <View style={[styles.progressFill, { width: `${(index / questions.length) * 100}%`, backgroundColor: t.primary }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Type badge */}
        <View style={[styles.typeBadge, { backgroundColor: TYPE_COLOR[q?.type ?? "meaning"] + "22", borderColor: TYPE_COLOR[q?.type ?? "meaning"] }]}>
          <Text style={[styles.typeBadgeText, { color: TYPE_COLOR[q?.type ?? "meaning"] }]}>
            {TYPE_LABEL[q?.type ?? "meaning"]}
          </Text>
        </View>

        {/* Card */}
        <Animated.View style={[styles.wordCard, { backgroundColor: t.surface, borderColor: t.border, transform: [{ translateX: shakeAnim }] }]}>
          <Text style={[styles.promptText, { color: t.textMuted }]}>{q?.prompt}</Text>
          <View style={styles.wordRow}>
            <Text style={[styles.wordText, { color: t.text }]}>
              {isArticleQ ? `___ ${q?.word.german}` : (q?.word.displayGerman ?? q?.word.german)}
            </Text>
            <TouchableOpacity onPress={speak} style={styles.audioBtn}>
              <Volume2 size={20} color="#1CB0F6" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          {q?.word.ipa && <Text style={[styles.ipaText, { color: t.textMuted }]}>{q.word.ipa}</Text>}
        </Animated.View>

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
          <>
            <View style={[styles.feedbackBox, {
              backgroundColor: isCorrect ? "#58CC0222" : "#FF4B4B22",
              borderColor: isCorrect ? "#58CC02" : "#FF4B4B",
            }]}>
              {isCorrect ? <CheckCircle2 size={18} color="#58CC02" strokeWidth={2.5} /> : <XCircle size={18} color="#FF4B4B" strokeWidth={2.5} />}
              <View style={{ flex: 1 }}>
                <Text style={[styles.feedbackTitle, { color: isCorrect ? "#58CC02" : "#FF4B4B" }]}>
                  {isCorrect ? "Correct!" : "Not quite!"}
                </Text>
                <Text style={[styles.feedbackSub, { color: t.textMuted }]}>
                  Answer: <Text style={{ fontWeight: "800" }}>{q.correct}</Text>
                </Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.nextBtn, { backgroundColor: t.primary }]} onPress={handleNext}>
              <Text style={styles.nextBtnText}>{index + 1 >= questions.length ? "See Results" : "Next →"}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 28 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  topBarTitle: { fontSize: 16, fontWeight: "800" },
  scoreLabel: { fontSize: 14, fontWeight: "800" },
  progressBg: { height: 6, marginHorizontal: 16, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 12 },
  typeBadge: { alignSelf: "flex-start", borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 4 },
  typeBadgeText: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  wordCard: {
    borderRadius: 20, borderWidth: 1.5, padding: 18,
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  promptText: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  wordRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  wordText: { fontSize: 30, fontWeight: "900", flex: 1 },
  audioBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#EAF6FF", alignItems: "center", justifyContent: "center" },
  ipaText: { fontSize: 13, fontStyle: "italic", marginTop: 4 },
  optionsRow: { flexDirection: "row", gap: 10 },
  optionsGrid: { gap: 8 },
  articleBtn: { flex: 1, borderRadius: 14, padding: 14, alignItems: "center", gap: 3 },
  articleText: { fontSize: 22, fontWeight: "900" },
  optionBtn: { borderRadius: 14, borderWidth: 1.5 },
  optionInner: { flexDirection: "row", alignItems: "center", padding: 13, gap: 10 },
  optIdx: { width: 28, height: 28, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  optIdxText: { fontSize: 12, fontWeight: "800" },
  optionText: { flex: 1, fontSize: 15, fontWeight: "700" },
  feedbackBox: { borderRadius: 14, borderWidth: 2, padding: 12, flexDirection: "row", alignItems: "flex-start", gap: 8 },
  feedbackTitle: { fontSize: 14, fontWeight: "800" },
  feedbackSub: { fontSize: 12, marginTop: 2 },
  nextBtn: { borderRadius: 18, paddingVertical: 14, alignItems: "center" },
  nextBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  doneTitle: { fontSize: 26, fontWeight: "900" },
  scoreBox: { borderRadius: 18, borderWidth: 1.5, padding: 20, alignItems: "center", width: "100%" },
  scoreBig: { fontSize: 44, fontWeight: "900" },
  scorePct: { fontSize: 15, fontWeight: "700" },
  btn: { borderRadius: 22, paddingVertical: 14, paddingHorizontal: 32 },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  btnOutline: { borderRadius: 22, paddingVertical: 13, paddingHorizontal: 32, borderWidth: 2 },
  btnOutlineText: { fontWeight: "700", fontSize: 14 },
});
