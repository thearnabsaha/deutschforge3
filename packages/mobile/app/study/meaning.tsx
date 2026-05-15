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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Question {
  word: StudyWord;
  options: string[]; // 4 choices
  correct: string;
}

function buildQuestions(words: StudyWord[], allWords: StudyWord[]): Question[] {
  const pool = allWords.length >= 4 ? allWords : words;
  return shuffle(words).map((w) => {
    const correct = w.english;
    const distractors = shuffle(
      pool.filter((p) => p.id !== w.id && p.english !== correct)
    )
      .slice(0, 3)
      .map((p) => p.english);
    const options = shuffle([correct, ...distractors]);
    return { word: w, options, correct };
  });
}

export default function MeaningMode() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ setId: string; setName: string; words: string; allWords: string }>();

  const setWords: StudyWord[] = useMemo(() => {
    try { return JSON.parse(params.words ?? "[]"); } catch { return []; }
  }, [params.words]);

  const allWords: StudyWord[] = useMemo(() => {
    try { return JSON.parse(params.allWords ?? "[]"); } catch { return setWords; }
  }, [params.allWords, setWords]);

  const questions = useMemo(() => buildQuestions(setWords, allWords), [setWords, allWords]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [done, setDone] = useState(false);
  const [shakeAnim] = useState(new Animated.Value(0));

  const q = questions[index];
  const isCorrect = selected === q?.correct;

  const speak = useCallback(() => {
    if (!q) return;
    const word = q.word.displayGerman ?? q.word.german;
    Speech.stop();
    Speech.speak(word, { language: "de-DE", rate: 0.8 });
  }, [q]);

  const handleSelect = useCallback((option: string) => {
    if (selected !== null) return;
    setSelected(option);
    const correct = option === q.correct;
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    Speech.stop();
    Speech.speak(q.word.displayGerman ?? q.word.german, { language: "de-DE", rate: 0.8 });
    if (!correct) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 5, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -5, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [selected, q, shakeAnim]);

  const handleNext = useCallback(() => {
    if (index + 1 >= questions.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  }, [index, questions.length]);

  if (done) {
    const pct = Math.round((score.correct / score.total) * 100);
    const perfect = pct === 100;
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: t.background }]} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.doneContainer}>
          <DeutschForgeMascot mood={perfect ? "celebrate" : pct >= 60 ? "happy" : "sad"} size={120} controlled />
          <Text style={[styles.doneTitle, { color: t.text }]}>
            {perfect ? "Perfect!" : pct >= 60 ? "Well done!" : "Keep going!"}
          </Text>
          <View style={[styles.scoreBox, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
            <Text style={[styles.scoreBig, { color: t.primary }]}>{score.correct}/{score.total}</Text>
            <Text style={[styles.scorePct, { color: t.textMuted }]}>{pct}% correct</Text>
          </View>
          <TouchableOpacity style={[styles.btn, { backgroundColor: t.primary }]} onPress={() => { setIndex(0); setSelected(null); setScore({ correct: 0, total: 0 }); setDone(false); }}>
            <Text style={styles.btnText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnOutline, { borderColor: t.border }]} onPress={() => router.back()}>
            <Text style={[styles.btnOutlineText, { color: t.textMuted }]}>Back to Modes</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const progress = index / questions.length;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.background }]} edges={["top"]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={t.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: t.text }]}>Meaning Guessing</Text>
        <Text style={[styles.scoreText, { color: t.accent }]}>{score.correct}/{score.total}</Text>
      </View>

      <View style={[styles.progressBg, { backgroundColor: t.border }]}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: t.primary }]} />
      </View>
      <Text style={[styles.progressLabel, { color: t.textMuted }]}>{index + 1} / {questions.length}</Text>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Word card */}
        <Animated.View style={[styles.wordCard, { backgroundColor: t.surface, borderColor: t.border, transform: [{ translateX: shakeAnim }] }]}>
          <Text style={[styles.instruction, { color: t.textMuted }]}>What does this mean?</Text>
          <View style={styles.wordRow}>
            <Text style={[styles.wordText, { color: t.text }]}>{q?.word.displayGerman ?? q?.word.german}</Text>
            <TouchableOpacity onPress={speak} style={styles.audioBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Volume2 size={22} color="#1CB0F6" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          {q?.word.ipa && <Text style={[styles.ipaText, { color: t.textMuted }]}>{q.word.ipa}</Text>}
          {q?.word.exampleSentence && (
            <View style={styles.exampleBox}>
              <Text style={styles.exampleLabel}>EXAMPLE</Text>
              <Text style={styles.exampleText}>"{q.word.exampleSentence}"</Text>
            </View>
          )}
        </Animated.View>

        {/* Options */}
        <View style={styles.optionsGrid}>
          {q?.options.map((opt, i) => {
            const isSelected = selected === opt;
            const isRight = selected !== null && opt === q.correct;
            const isWrong = isSelected && opt !== q.correct;

            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.optionBtn,
                  {
                    backgroundColor: isRight
                      ? "#58CC0222"
                      : isWrong
                      ? "#FF4B4B22"
                      : t.surface,
                    borderColor: isRight
                      ? "#58CC02"
                      : isWrong
                      ? "#FF4B4B"
                      : t.border,
                    borderWidth: isRight || isWrong ? 2.5 : 1.5,
                  },
                ]}
                onPress={() => handleSelect(opt)}
                disabled={selected !== null}
                activeOpacity={0.75}
              >
                <View style={styles.optionInner}>
                  <View style={[styles.optionIndex, {
                    backgroundColor: isRight ? "#58CC02" : isWrong ? "#FF4B4B" : t.surfaceAlt,
                  }]}>
                    <Text style={[styles.optionIndexText, { color: isRight || isWrong ? "#fff" : t.textMuted }]}>
                      {["A", "B", "C", "D"][i]}
                    </Text>
                  </View>
                  <Text style={[styles.optionText, { color: isRight ? "#58CC02" : isWrong ? "#FF4B4B" : t.text }]}>
                    {opt}
                  </Text>
                  {isRight && <CheckCircle2 size={16} color="#58CC02" strokeWidth={2.5} />}
                  {isWrong && <XCircle size={16} color="#FF4B4B" strokeWidth={2.5} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Feedback */}
        {selected !== null && (
          <>
            <View style={[styles.feedbackBox, {
              backgroundColor: isCorrect ? "#58CC0222" : "#FF4B4B22",
              borderColor: isCorrect ? "#58CC02" : "#FF4B4B",
            }]}>
              {isCorrect
                ? <CheckCircle2 size={20} color="#58CC02" strokeWidth={2.5} />
                : <XCircle size={20} color="#FF4B4B" strokeWidth={2.5} />
              }
              <View style={{ flex: 1 }}>
                <Text style={[styles.feedbackTitle, { color: isCorrect ? "#58CC02" : "#FF4B4B" }]}>
                  {isCorrect ? "Correct!" : "Not quite!"}
                </Text>
                <Text style={[styles.feedbackSub, { color: t.textMuted }]}>
                  {q.word.displayGerman ?? q.word.german} = <Text style={{ fontWeight: "700" }}>{q.correct}</Text>
                </Text>
              </View>
            </View>

            <TouchableOpacity style={[styles.nextBtn, { backgroundColor: t.primary }]} onPress={handleNext}>
              <Text style={styles.nextBtnText}>
                {index + 1 >= questions.length ? "See Results" : "Next Word →"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  topBarTitle: { fontSize: 16, fontWeight: "800" },
  scoreText: { fontSize: 14, fontWeight: "800" },
  progressBg: { height: 6, marginHorizontal: 16, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  progressLabel: { fontSize: 12, fontWeight: "700", textAlign: "center", marginTop: 4 },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 12 },
  wordCard: {
    borderRadius: 20, borderWidth: 1.5, padding: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  instruction: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  wordRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  wordText: { fontSize: 34, fontWeight: "900", flex: 1 },
  audioBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#EAF6FF", alignItems: "center", justifyContent: "center" },
  ipaText: { fontSize: 14, fontStyle: "italic", marginTop: 4 },
  exampleBox: { backgroundColor: "#F0F4FF", borderRadius: 12, padding: 10, marginTop: 10, borderLeftWidth: 3, borderLeftColor: "#1CB0F6" },
  exampleLabel: { fontSize: 9, fontWeight: "800", color: "#1CB0F6", marginBottom: 3, letterSpacing: 1 },
  exampleText: { fontSize: 13, color: "#333", fontStyle: "italic" },
  optionsGrid: { gap: 8 },
  optionBtn: { borderRadius: 14, borderWidth: 1.5, overflow: "hidden" },
  optionInner: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  optionIndex: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  optionIndexText: { fontSize: 13, fontWeight: "800" },
  optionText: { flex: 1, fontSize: 16, fontWeight: "700" },
  feedbackBox: {
    borderRadius: 16, borderWidth: 2, padding: 14,
    flexDirection: "row", alignItems: "flex-start", gap: 10,
  },
  feedbackTitle: { fontSize: 15, fontWeight: "800" },
  feedbackSub: { fontSize: 13, marginTop: 2 },
  nextBtn: { borderRadius: 20, paddingVertical: 16, alignItems: "center" },
  nextBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  doneContainer: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 28, gap: 14 },
  doneTitle: { fontSize: 28, fontWeight: "900" },
  scoreBox: { borderRadius: 20, borderWidth: 1.5, padding: 24, alignItems: "center", width: "100%" },
  scoreBig: { fontSize: 48, fontWeight: "900" },
  scorePct: { fontSize: 16, fontWeight: "700" },
  btn: { borderRadius: 24, paddingVertical: 15, paddingHorizontal: 36 },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  btnOutline: { borderRadius: 24, paddingVertical: 14, paddingHorizontal: 36, borderWidth: 2 },
  btnOutlineText: { fontWeight: "700", fontSize: 15 },
});
