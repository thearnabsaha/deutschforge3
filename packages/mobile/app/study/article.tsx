import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { Volume2, ChevronLeft, CheckCircle2, XCircle } from "lucide-react-native";
import { useTheme } from "../../lib/theme";
import { DeutschForgeMascot } from "../../components/DeutschForgeMascot";
import type { StudyWord } from "../(tabs)/study";

const ARTICLES = ["der", "die", "das"] as const;
type Article = (typeof ARTICLES)[number];

const ARTICLE_COLORS: Record<Article, string> = {
  der: "#1CB0F6",
  die: "#FF4B4B",
  das: "#58CC02",
};

const ARTICLE_MEANINGS: Record<Article, string> = {
  der: "masculine",
  die: "feminine",
  das: "neutral",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ArticleMode() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ setId: string; setName: string; words: string }>();

  const setWords: StudyWord[] = useMemo(() => {
    try { return JSON.parse(params.words ?? "[]"); } catch { return []; }
  }, [params.words]);

  const nouns = useMemo(
    () => shuffle(setWords.filter((w) => w.partOfSpeech === "noun" && w.gender)),
    [setWords],
  );

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Article | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [done, setDone] = useState(false);
  const [shakeAnim] = useState(new Animated.Value(0));

  const current = nouns[index];
  const correctArticle = current?.gender as Article | undefined;
  const isCorrect = selected === correctArticle;

  const speak = useCallback(() => {
    if (!current) return;
    const word = current.displayGerman ?? `${current.gender} ${current.german}`;
    Speech.stop();
    Speech.speak(word, { language: "de-DE", rate: 0.8 });
  }, [current]);

  const handleSelect = useCallback((art: Article) => {
    if (selected !== null) return;
    setSelected(art);
    const correct = art === correctArticle;
    if (correct) {
      setScore((s) => ({ correct: s.correct + 1, total: s.total + 1 }));
      Speech.stop();
      Speech.speak(`${correctArticle} ${current?.german}`, { language: "de-DE", rate: 0.8 });
    } else {
      setScore((s) => ({ ...s, total: s.total + 1 }));
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [selected, correctArticle, current, shakeAnim]);

  const handleNext = useCallback(() => {
    if (index + 1 >= nouns.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  }, [index, nouns.length]);

  if (nouns.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: t.background }]} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={[styles.emptyTitle, { color: t.text }]}>No nouns in this set</Text>
          <Text style={[styles.emptySub, { color: t.textMuted }]}>Add nouns to practice articles</Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: t.primary }]} onPress={() => router.back()}>
            <Text style={styles.btnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (done) {
    const pct = Math.round((score.correct / score.total) * 100);
    const perfect = pct === 100;
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: t.background }]} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.doneContainer}>
          <DeutschForgeMascot mood={perfect ? "celebrate" : pct >= 60 ? "happy" : "sad"} size={120} controlled />
          <Text style={[styles.doneTitle, { color: t.text }]}>
            {perfect ? "Perfect!" : pct >= 60 ? "Good job!" : "Keep practicing!"}
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

  const progress = index / nouns.length;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.background }]} edges={["top"]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={t.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: t.text }]}>Article Guessing</Text>
        <Text style={[styles.scoreText, { color: t.accent }]}>{score.correct}/{score.total}</Text>
      </View>

      {/* Progress */}
      <View style={[styles.progressBg, { backgroundColor: t.border }]}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: t.primary }]} />
      </View>
      <Text style={[styles.progressLabel, { color: t.textMuted }]}>{index + 1} / {nouns.length}</Text>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Word card */}
        <Animated.View style={[styles.wordCard, { backgroundColor: t.surface, borderColor: t.border, transform: [{ translateX: shakeAnim }] }]}>
          <View style={styles.wordCardTop}>
            <View style={[styles.posChip, { backgroundColor: "#CE82FF22", borderColor: "#CE82FF" }]}>
              <Text style={[styles.posChipText, { color: "#CE82FF" }]}>noun</Text>
            </View>
            {current.cefrLevel && (
              <View style={[styles.posChip, { backgroundColor: "#1CB0F622", borderColor: "#1CB0F6" }]}>
                <Text style={[styles.posChipText, { color: "#1CB0F6" }]}>{current.cefrLevel}</Text>
              </View>
            )}
          </View>

          <Text style={[styles.question, { color: t.textMuted }]}>What is the article?</Text>

          <View style={styles.wordRow}>
            <Text style={[styles.wordText, { color: t.text }]}>___ {current.german}</Text>
            <TouchableOpacity
              onPress={speak}
              style={styles.audioBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Volume2 size={22} color="#1CB0F6" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.meaningText, { color: t.textMuted }]}>{current.english}</Text>

          {current.ipa && (
            <Text style={[styles.ipaText, { color: t.textMuted }]}>{current.ipa}</Text>
          )}
        </Animated.View>

        {/* Article choices */}
        <View style={styles.choicesRow}>
          {ARTICLES.map((art) => {
            const isSelected = selected === art;
            const isRight = isSelected && art === correctArticle;
            const isWrong = isSelected && art !== correctArticle;
            const showCorrect = selected !== null && art === correctArticle && !isRight;

            return (
              <TouchableOpacity
                key={art}
                style={[
                  styles.articleBtn,
                  {
                    backgroundColor: isRight
                      ? ARTICLE_COLORS[art] + "33"
                      : isWrong
                      ? "#FF4B4B22"
                      : showCorrect
                      ? ARTICLE_COLORS[art] + "22"
                      : t.surface,
                    borderColor: isRight
                      ? ARTICLE_COLORS[art]
                      : isWrong
                      ? "#FF4B4B"
                      : showCorrect
                      ? ARTICLE_COLORS[art]
                      : t.border,
                    borderWidth: isSelected || showCorrect ? 2.5 : 1.5,
                    transform: [{ scale: isSelected ? 0.96 : 1 }],
                  },
                ]}
                onPress={() => handleSelect(art)}
                activeOpacity={0.8}
                disabled={selected !== null}
              >
                <Text style={[styles.articleText, { color: isSelected || showCorrect ? ARTICLE_COLORS[art] : t.text }]}>
                  {art}
                </Text>
                <Text style={[styles.articleMeaning, { color: t.textMuted }]}>{ARTICLE_MEANINGS[art]}</Text>
                {(isRight || showCorrect) && <CheckCircle2 size={18} color={ARTICLE_COLORS[art]} strokeWidth={2.5} />}
                {isWrong && <XCircle size={18} color="#FF4B4B" strokeWidth={2.5} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Feedback */}
        {selected !== null && (
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
              {!isCorrect && (
                <Text style={[styles.feedbackSub, { color: t.textMuted }]}>
                  It's <Text style={{ fontWeight: "800", color: ARTICLE_COLORS[correctArticle!] }}>{correctArticle}</Text> {current.german} ({ARTICLE_MEANINGS[correctArticle!]})
                </Text>
              )}
            </View>
          </View>
        )}

        {selected !== null && (
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: t.primary }]}
            onPress={handleNext}
          >
            <Text style={styles.nextBtnText}>
              {index + 1 >= nouns.length ? "See Results" : "Next Word →"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  emptyTitle: { fontSize: 22, fontWeight: "800" },
  emptySub: { fontSize: 15, textAlign: "center" },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  topBarTitle: { fontSize: 16, fontWeight: "800" },
  scoreText: { fontSize: 14, fontWeight: "800" },
  progressBg: { height: 6, marginHorizontal: 16, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  progressLabel: { fontSize: 12, fontWeight: "700", textAlign: "center", marginTop: 4 },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 14 },
  wordCard: {
    borderRadius: 20, borderWidth: 1.5, padding: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  wordCardTop: { flexDirection: "row", gap: 6, marginBottom: 12 },
  posChip: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  posChipText: { fontSize: 11, fontWeight: "700" },
  question: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  wordRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  wordText: { fontSize: 34, fontWeight: "900", flex: 1 },
  audioBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#EAF6FF", alignItems: "center", justifyContent: "center" },
  meaningText: { fontSize: 16, fontWeight: "600", marginTop: 6 },
  ipaText: { fontSize: 14, fontStyle: "italic", marginTop: 4 },
  choicesRow: { flexDirection: "row", gap: 10 },
  articleBtn: {
    flex: 1, borderRadius: 16, padding: 16,
    alignItems: "center", justifyContent: "center", gap: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  articleText: { fontSize: 24, fontWeight: "900" },
  articleMeaning: { fontSize: 11, fontWeight: "600" },
  feedbackBox: {
    borderRadius: 16, borderWidth: 2, padding: 14,
    flexDirection: "row", alignItems: "center", gap: 10,
  },
  feedbackTitle: { fontSize: 15, fontWeight: "800" },
  feedbackSub: { fontSize: 13, fontWeight: "500", marginTop: 2 },
  nextBtn: { borderRadius: 20, paddingVertical: 16, alignItems: "center" },
  nextBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  btn: { borderRadius: 24, paddingVertical: 15, paddingHorizontal: 36 },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  btnOutline: { borderRadius: 24, paddingVertical: 14, paddingHorizontal: 36, borderWidth: 2, marginTop: 4 },
  btnOutlineText: { fontWeight: "700", fontSize: 15 },
  doneContainer: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 28, gap: 14 },
  doneTitle: { fontSize: 28, fontWeight: "900" },
  scoreBox: { borderRadius: 20, borderWidth: 1.5, padding: 24, alignItems: "center", width: "100%" },
  scoreBig: { fontSize: 48, fontWeight: "900" },
  scorePct: { fontSize: 16, fontWeight: "700" },
});
