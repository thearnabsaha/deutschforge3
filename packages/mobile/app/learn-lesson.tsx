/**
 * Learn Lesson Screen — Duolingo-style
 * Flashcard phase (swipeable, TTS) → MCQ phase (no hearts, rich feedback)
 * Sound effects on correct / wrong / complete
 */
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  StatusBar, Animated, ScrollView, Pressable, Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft, Volume2, VolumeX, ChevronRight,
  CheckCircle2, XCircle, Lightbulb, Star, Zap, BookOpen,
} from "lucide-react-native";
import { useTheme } from "../lib/theme";

// ── Legacy imports ────────────────────────────────────────────────────────────
import { PRACTICE_DATA } from "../lib/grammarPracticeData";
import { getUnit } from "../lib/learnData";
import { recordLevelCompletion } from "../lib/learnProgress";

// ── Syllabus imports ──────────────────────────────────────────────────────────
import {
  SYLLABUS_LESSON_QUESTIONS,
  type LessonItem,
  type FlashCard,
} from "../lib/syllabusLearnData";
import { LESSON_MAP, getLessonLevel, getLevelUnit } from "../lib/syllabusData";
import { loadProgress, completeLesson as completeSyllabusLesson } from "../lib/syllabusProgress";
import { speakGerman, stopSpeaking } from "../lib/tts";
import { musicPlayer } from "../lib/music";

const { width: SW } = Dimensions.get("window");
const QUESTIONS_PER_LESSON = 15;
const QUESTIONS_PER_LEGACY = 10;

type AnswerState = "unanswered" | "correct" | "wrong";

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ current, total, color }: { current: number; total: number; color: string }) {
  const { theme: t } = useTheme();
  const pct = total > 0 ? Math.min(current / total, 1) : 0;
  const anim = useRef(new Animated.Value(pct)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: pct, useNativeDriver: false, friction: 8 }).start();
  }, [pct]);
  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  return (
    <View style={[pb.track, { backgroundColor: t.border }]}>
      <Animated.View style={[pb.fill, { width, backgroundColor: color }]} />
    </View>
  );
}
const pb = StyleSheet.create({
  track: { flex: 1, height: 12, borderRadius: 6, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 6 },
});

// ─── Flashcard ────────────────────────────────────────────────────────────────

function FlashCardSlide({
  card, index, total, color, onNext,
}: { card: FlashCard; index: number; total: number; color: string; onNext: () => void }) {
  const { theme: t } = useTheme();
  const [flipped, setFlipped] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setFlipped(false);
    rotateAnim.setValue(0);
    stopSpeaking();
    setSpeaking(false);
    // Entrance animation
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 6, tension: 80 }).start();
  }, [index]);

  const handleFlip = () => {
    musicPlayer.playClick();
    const toVal = flipped ? 0 : 1;
    Animated.spring(rotateAnim, { toValue: toVal, useNativeDriver: true, friction: 7 }).start();
    setFlipped((f) => !f);
  };

  const handleSpeak = () => {
    musicPlayer.playClick();
    if (speaking) { stopSpeaking(); setSpeaking(false); return; }
    const txt = card.example ?? card.front;
    setSpeaking(true);
    speakGerman(txt, { onDone: () => setSpeaking(false) });
  };

  const frontRot = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRot = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });

  const isLast = index + 1 >= total;

  return (
    <View style={fcs.wrapper}>
      {/* Dot progress */}
      <View style={fcs.dots}>
        {Array.from({ length: total }).map((_, i) => (
          <View key={i} style={[fcs.dot, {
            backgroundColor: i === index ? color : i < index ? color + "60" : t.border,
            width: i === index ? 20 : 8,
          }]} />
        ))}
      </View>

      {/* Card */}
      <Pressable onPress={handleFlip} style={fcs.cardPress}>
        {/* Front */}
        <Animated.View style={[
          fcs.card, { backgroundColor: t.surface, borderColor: flipped ? t.border : color },
          { transform: [{ rotateY: frontRot }], backfaceVisibility: "hidden" },
        ]}>
          <View style={[fcs.soundBadge, { backgroundColor: color + "15" }]}>
            <Text style={[fcs.soundLabel, { color }]}>Sound</Text>
          </View>
          <Text style={[fcs.frontGlyph, { color }]}>{card.front}</Text>
          {card.phonetic && (
            <View style={[fcs.phoneticPill, { backgroundColor: color + "18" }]}>
              <Text style={[fcs.phonetic, { color }]}>{card.phonetic}</Text>
            </View>
          )}
          <Text style={[fcs.tapHint, { color: t.textMuted }]}>Tap to flip ↩</Text>
        </Animated.View>

        {/* Back */}
        <Animated.View style={[
          fcs.card, fcs.cardBack, { backgroundColor: color + "08", borderColor: color },
          { transform: [{ rotateY: backRot }], backfaceVisibility: "hidden" },
        ]}>
          <Text style={[fcs.backExplain, { color: t.text }]}>{card.back}</Text>
          {card.example && (
            <View style={[fcs.exBox, { backgroundColor: t.surface, borderColor: color + "40" }]}>
              <Text style={[fcs.exWord, { color }]}>{card.example}</Text>
              {card.exampleMeaning && (
                <Text style={[fcs.exMeaning, { color: t.textMuted }]}>"{card.exampleMeaning}"</Text>
              )}
            </View>
          )}
          {card.moreExamples && card.moreExamples.length > 0 && (
            <View style={fcs.moreBox}>
              {card.moreExamples.map((ex, i) => (
                <Text key={i} style={[fcs.moreItem, { color: t.textMuted }]}>• {ex}</Text>
              ))}
            </View>
          )}
        </Animated.View>
      </Pressable>

      {/* TTS + Next row */}
      <View style={fcs.actions}>
        <TouchableOpacity onPress={handleSpeak}
          style={[fcs.ttsBtn, { backgroundColor: speaking ? color : t.surface, borderColor: color }]}
          activeOpacity={0.75}>
          {speaking
            ? <VolumeX size={18} color="#fff" strokeWidth={2.5} />
            : <Volume2 size={18} color={color} strokeWidth={2.5} />}
          <Text style={[fcs.ttsTxt, { color: speaking ? "#fff" : color }]}>
            {speaking ? "Stop" : "Listen"}
          </Text>
        </TouchableOpacity>

        {flipped && (
          <TouchableOpacity onPress={() => { musicPlayer.playClick(); onNext(); }}
            style={[fcs.nextBtn, { backgroundColor: color }]} activeOpacity={0.85}>
            <Text style={fcs.nextTxt}>{isLast ? "Start Quiz" : "Got it"}</Text>
            <ChevronRight size={18} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        )}
      </View>

      {/* Flip hint when not flipped */}
      {!flipped && (
        <Text style={[fcs.bottomHint, { color: t.textMuted }]}>
          Flip to see explanation, then tap "Got it" to continue
        </Text>
      )}
    </View>
  );
}

const fcs = StyleSheet.create({
  wrapper: { flex: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
  dots: { flexDirection: "row", gap: 5, alignSelf: "center", marginBottom: 16, alignItems: "center" },
  dot: { height: 8, borderRadius: 4 },
  cardPress: { height: 280, marginBottom: 20 },
  card: {
    position: "absolute", width: "100%", height: "100%",
    borderRadius: 28, borderWidth: 2.5,
    alignItems: "center", justifyContent: "center",
    padding: 28, gap: 10,
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 16, elevation: 6,
  },
  cardBack: { justifyContent: "center", gap: 12 },
  soundBadge: { position: "absolute", top: 16, left: 16, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  soundLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  frontGlyph: { fontSize: 80, fontWeight: "900", letterSpacing: -2 },
  phoneticPill: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6 },
  phonetic: { fontSize: 20, fontWeight: "700", fontStyle: "italic" },
  tapHint: { fontSize: 12, fontWeight: "500", position: "absolute", bottom: 16 },
  backExplain: { fontSize: 15, fontWeight: "600", lineHeight: 22, textAlign: "center" },
  exBox: { borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 18, paddingVertical: 10, alignItems: "center" },
  exWord: { fontSize: 24, fontWeight: "800" },
  exMeaning: { fontSize: 13, fontWeight: "500", marginTop: 2 },
  moreBox: { gap: 2, alignSelf: "flex-start" },
  moreItem: { fontSize: 13, fontWeight: "500" },
  actions: { flexDirection: "row", gap: 12, alignItems: "center" },
  ttsBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 14, borderWidth: 2,
    paddingHorizontal: 18, paddingVertical: 12, flex: 1,
    justifyContent: "center",
  },
  ttsTxt: { fontSize: 15, fontWeight: "700" },
  nextBtn: {
    flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 14, paddingVertical: 14,
  },
  nextTxt: { color: "#fff", fontSize: 16, fontWeight: "800" },
  bottomHint: { textAlign: "center", fontSize: 12, marginTop: 14, fontWeight: "500" },
});

// ─── Option Button ────────────────────────────────────────────────────────────

const LETTERS = ["A", "B", "C", "D"];

function OptionBtn({
  letter, text, state, disabled, onPress, color,
}: {
  letter: string; text: string;
  state: "idle" | "correct" | "wrong" | "dimmed";
  disabled: boolean; onPress: () => void; color: string;
}) {
  const { theme: t } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 4 }),
    ]).start();
    onPress();
  };

  const bg = state === "correct" ? "#22C55E18" : state === "wrong" ? "#EF444418" : state === "dimmed" ? t.surfaceAlt : t.surface;
  const border = state === "correct" ? "#22C55E" : state === "wrong" ? "#EF4444" : state === "idle" ? t.border : t.border + "60";
  const txtColor = state === "correct" ? "#22C55E" : state === "wrong" ? "#EF4444" : state === "dimmed" ? t.textMuted : t.text;
  const pillBg = state === "idle" ? color + "20" : bg;
  const pillTxt = state === "idle" ? color : txtColor;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress} disabled={disabled} activeOpacity={0.8}
        style={[ob.btn, { backgroundColor: bg, borderColor: border }]}>
        <View style={[ob.pill, { backgroundColor: pillBg }]}>
          <Text style={[ob.pillTxt, { color: pillTxt }]}>{letter}</Text>
        </View>
        <Text style={[ob.txt, { color: txtColor }]}>{text}</Text>
        {state === "correct" && <CheckCircle2 size={20} color="#22C55E" strokeWidth={2.5} />}
        {state === "wrong" && <XCircle size={20} color="#EF4444" strokeWidth={2.5} />}
      </TouchableOpacity>
    </Animated.View>
  );
}
const ob = StyleSheet.create({
  btn: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 18, borderWidth: 2, padding: 16, marginBottom: 10,
  },
  pill: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  pillTxt: { fontSize: 14, fontWeight: "800" },
  txt: { flex: 1, fontSize: 16, fontWeight: "600", lineHeight: 22 },
});

// ─── Feedback Bar (bottom slide-up) ──────────────────────────────────────────

function FeedbackBar({
  state, explanation, color, onNext, isLast,
}: {
  state: AnswerState; explanation: string; color: string; onNext: () => void; isLast: boolean;
}) {
  const { theme: t } = useTheme();
  const slideAnim = useRef(new Animated.Value(120)).current;

  useEffect(() => {
    if (state !== "unanswered") {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, friction: 7 }).start();
    } else {
      slideAnim.setValue(120);
    }
  }, [state]);

  if (state === "unanswered") return null;

  const correct = state === "correct";
  const bg = correct ? "#22C55E" : "#EF4444";
  const icon = correct ? <CheckCircle2 size={22} color="#fff" strokeWidth={2.5} /> : <XCircle size={22} color="#fff" strokeWidth={2.5} />;
  const label = correct ? "Correct!" : "Incorrect";

  return (
    <Animated.View style={[fb.bar, { backgroundColor: bg, transform: [{ translateY: slideAnim }] }]}>
      <View style={fb.top}>
        {icon}
        <Text style={fb.label}>{label}</Text>
      </View>
      {explanation ? (
        <Text style={fb.explain} numberOfLines={3}>{explanation}</Text>
      ) : null}
      <TouchableOpacity onPress={onNext} style={fb.btn} activeOpacity={0.85}>
        <Text style={[fb.btnTxt, { color: bg }]}>{isLast ? "Finish" : "Continue"}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
const fb = StyleSheet.create({
  bar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 36, gap: 10,
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20, elevation: 12,
  },
  top: { flexDirection: "row", alignItems: "center", gap: 10 },
  label: { color: "#fff", fontSize: 20, fontWeight: "900" },
  explain: { color: "rgba(255,255,255,0.88)", fontSize: 14, fontWeight: "500", lineHeight: 20 },
  btn: {
    backgroundColor: "#fff", borderRadius: 16,
    paddingVertical: 14, alignItems: "center", marginTop: 4,
  },
  btnTxt: { fontSize: 17, fontWeight: "900" },
});

// ─── Streak burst (XP popup) ─────────────────────────────────────────────────

function XPBurst({ xp, color }: { xp: number; color: string }) {
  const yAnim = useRef(new Animated.Value(0)).current;
  const opAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(yAnim, { toValue: -60, duration: 900, useNativeDriver: true }),
      Animated.timing(opAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[xpb.wrap, { transform: [{ translateY: yAnim }], opacity: opAnim }]}>
      <View style={[xpb.pill, { backgroundColor: color }]}>
        <Star size={14} color="#fff" strokeWidth={2.5} fill="#fff" />
        <Text style={xpb.txt}>+{xp} XP</Text>
      </View>
    </Animated.View>
  );
}
const xpb = StyleSheet.create({
  wrap: { position: "absolute", top: 60, right: 20, zIndex: 99 },
  pill: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  txt: { color: "#fff", fontSize: 13, fontWeight: "800" },
});

// ─── Completion Screen ────────────────────────────────────────────────────────

function CompletionScreen({
  score, total, xpEarned, flashCount, isNewCompletion, color, onContinue,
}: {
  score: number; total: number; xpEarned: number; flashCount: number;
  isNewCompletion: boolean; color: string; onContinue: () => void;
}) {
  const { theme: t } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 4, tension: 60 }),
      Animated.timing(opAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const pct = total > 0 ? score / total : 1;
  const perfect = score === total;
  const emoji = perfect ? "🏆" : pct >= 0.8 ? "⭐" : pct >= 0.6 ? "👍" : "💪";
  const grade = perfect ? "Perfect!" : pct >= 0.8 ? "Excellent!" : pct >= 0.6 ? "Good job!" : "Keep going!";

  const stats = [
    { label: "Cards studied", value: flashCount, icon: "📚" },
    { label: "Questions", value: `${score}/${total}`, icon: "✅" },
    { label: "Accuracy", value: `${Math.round(pct * 100)}%`, icon: "🎯" },
  ];

  return (
    <SafeAreaView style={[cs.safe, { backgroundColor: t.background }]}>
      <StatusBar barStyle={"dark-content" as any} backgroundColor={t.background} />
      <ScrollView contentContainerStyle={cs.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={[cs.card, { backgroundColor: t.surface, transform: [{ scale: scaleAnim }], opacity: opAnim }]}>
          <Text style={cs.emoji}>{emoji}</Text>
          <Text style={[cs.grade, { color: t.text }]}>{grade}</Text>
          <Text style={[cs.sub, { color: t.textMuted }]}>Lesson complete!</Text>

          {/* Stats row */}
          <View style={cs.statsRow}>
            {stats.map((s) => (
              <View key={s.label} style={[cs.statBox, { backgroundColor: color + "12", borderColor: color + "30" }]}>
                <Text style={cs.statEmoji}>{s.icon}</Text>
                <Text style={[cs.statVal, { color }]}>{s.value}</Text>
                <Text style={[cs.statLabel, { color: t.textMuted }]}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* XP */}
          <View style={[cs.xpRow, { backgroundColor: "#FFD70018" }]}>
            <Star size={20} color="#FFD700" strokeWidth={2.5} fill="#FFD700" />
            <Text style={cs.xpTxt}>+{xpEarned} XP earned</Text>
            {isNewCompletion && (
              <View style={[cs.newBadge, { backgroundColor: color }]}>
                <Text style={cs.newTxt}>NEW</Text>
              </View>
            )}
          </View>

          {perfect && (
            <View style={[cs.xpRow, { backgroundColor: color + "15" }]}>
              <Zap size={18} color={color} strokeWidth={2.5} fill={color} />
              <Text style={[cs.xpTxt, { color }]}>Perfect score bonus! 🎉</Text>
            </View>
          )}
        </Animated.View>

        <TouchableOpacity onPress={onContinue} style={[cs.btn, { backgroundColor: color }]} activeOpacity={0.85}>
          <Text style={cs.btnTxt}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
const cs = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 24, paddingTop: 40, gap: 16 },
  card: {
    borderRadius: 28, padding: 28, gap: 14,
    alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 20, elevation: 8,
  },
  emoji: { fontSize: 64, marginBottom: 4 },
  grade: { fontSize: 32, fontWeight: "900" },
  sub: { fontSize: 16, fontWeight: "600" },
  statsRow: { flexDirection: "row", gap: 10, width: "100%", marginTop: 4 },
  statBox: {
    flex: 1, borderRadius: 18, borderWidth: 1.5,
    padding: 14, alignItems: "center", gap: 4,
  },
  statEmoji: { fontSize: 22 },
  statVal: { fontSize: 20, fontWeight: "900" },
  statLabel: { fontSize: 11, fontWeight: "600", textAlign: "center" },
  xpRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 16, paddingHorizontal: 20, paddingVertical: 12, width: "100%",
  },
  xpTxt: { fontSize: 16, fontWeight: "800", color: "#CC9900", flex: 1 },
  newBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  newTxt: { color: "#fff", fontSize: 11, fontWeight: "800" },
  btn: { borderRadius: 18, paddingVertical: 18, alignItems: "center" },
  btnTxt: { color: "#fff", fontSize: 18, fontWeight: "900" },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function LearnLessonScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();

  const { lessonId, isSyllabus, chapterId, levelIndex, unitId } =
    useLocalSearchParams<{ lessonId: string; isSyllabus: string; chapterId: string; levelIndex: string; unitId: string }>();

  const isSyllabusMode = isSyllabus === "1";

  // ── Resolve items ─────────────────────────────────────────────────────────

  const { flashCards, mcqQuestions, color, lessonType, mcqTotal, levelName } = React.useMemo(() => {
    if (isSyllabusMode && lessonId) {
      const items: LessonItem[] = SYLLABUS_LESSON_QUESTIONS[lessonId] ?? [];
      const fcs = items.filter((it): it is FlashCard => it.type === "flashcard");
      const mcqs = items.filter((it) => it.type !== "flashcard") as any[];
      const lessonMeta = LESSON_MAP[lessonId];
      const levelMeta = getLessonLevel(lessonId);
      const unitMeta = levelMeta ? getLevelUnit(levelMeta.levelId) : undefined;
      return {
        flashCards: fcs,
        mcqQuestions: mcqs,
        color: unitMeta?.color ?? "#1CB0F6",
        lessonType: lessonMeta?.type ?? "practice",
        mcqTotal: mcqs.length || QUESTIONS_PER_LESSON,
        levelName: levelMeta?.title ?? "",
      };
    } else {
      const levelIdx = parseInt(levelIndex ?? "0", 10);
      const chapterData = PRACTICE_DATA.find((d) => d.chapterId === chapterId);
      const qs = chapterData?.levels[levelIdx] ?? [];
      const legacyUnit = getUnit(unitId ?? "");
      return {
        flashCards: [] as FlashCard[],
        mcqQuestions: qs as any[],
        color: legacyUnit?.color ?? "#1CB0F6",
        lessonType: "practice" as const,
        mcqTotal: QUESTIONS_PER_LEGACY,
        levelName: "",
      };
    }
  }, [isSyllabusMode, lessonId, chapterId, levelIndex, unitId]);

  // ── Phase ─────────────────────────────────────────────────────────────────

  const [phase, setPhase] = useState<"flashcard" | "mcq">(flashCards.length > 0 ? "flashcard" : "mcq");
  const [fcIndex, setFcIndex] = useState(0);

  // MCQ state
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("unanswered");
  const [completed, setCompleted] = useState(false);
  const [completionData, setCompletionData] = useState<{ xpEarned: number; isNewCompletion: boolean } | null>(null);
  const [showXP, setShowXP] = useState(false);

  // Derived
  const fcTotal = flashCards.length;
  const totalItems = fcTotal + mcqTotal;
  const progressCurrent = phase === "flashcard" ? fcIndex : fcTotal + qIndex;

  // ── Flashcard navigation ──────────────────────────────────────────────────

  const handleNextFC = useCallback(() => {
    stopSpeaking();
    if (fcIndex + 1 >= fcTotal) {
      setPhase("mcq");
    } else {
      setFcIndex((i) => i + 1);
    }
  }, [fcIndex, fcTotal]);

  // ── MCQ answer ────────────────────────────────────────────────────────────

  const handleAnswer = useCallback((optIdx: number) => {
    if (answerState !== "unanswered") return;
    const q = mcqQuestions[qIndex];
    if (!q) return;
    const correct = optIdx === q.answer;
    setSelectedAnswer(optIdx);
    setAnswerState(correct ? "correct" : "wrong");
    if (correct) {
      setScore((s) => s + 1);
      musicPlayer.playFx("correct");
      setShowXP(true);
      setTimeout(() => setShowXP(false), 1000);
    } else {
      musicPlayer.playFx("wrong");
    }
  }, [answerState, qIndex, mcqQuestions]);

  // ── Next question / finish ────────────────────────────────────────────────

  const handleNext = useCallback(async () => {
    musicPlayer.playClick();
    const nextIdx = qIndex + 1;

    if (nextIdx >= mcqQuestions.length) {
      // Done — save + show completion
      musicPlayer.playFx("complete");
      const finalScore = score;
      if (isSyllabusMode && lessonId) {
        const p = await loadProgress();
        const alreadyDone = p.completedLessonIds.includes(lessonId);
        const xp = Math.max(10, Math.round((finalScore / Math.max(mcqTotal, 1)) * 100));
        await completeSyllabusLesson(lessonId, finalScore, p);
        setCompletionData({ xpEarned: xp, isNewCompletion: !alreadyDone });
      } else if (chapterId) {
        const levelIdx = parseInt(levelIndex ?? "0", 10);
        const res = await recordLevelCompletion(chapterId, levelIdx, score);
        setCompletionData(res);
      } else {
        setCompletionData({ xpEarned: 50, isNewCompletion: false });
      }
      setCompleted(true);
    } else {
      setQIndex(nextIdx);
      setSelectedAnswer(null);
      setAnswerState("unanswered");
    }
  }, [qIndex, mcqQuestions.length, score, isSyllabusMode, lessonId, chapterId, levelIndex, mcqTotal]);

  const handleContinue = () => {
    stopSpeaking();
    router.back();
  };

  // ── Completion screen ─────────────────────────────────────────────────────

  if (completed && completionData) {
    return (
      <CompletionScreen
        score={score}
        total={mcqTotal}
        xpEarned={completionData.xpEarned}
        flashCount={fcTotal}
        isNewCompletion={completionData.isNewCompletion}
        color={color}
        onContinue={handleContinue}
      />
    );
  }

  // ── Guard: empty ──────────────────────────────────────────────────────────

  if (flashCards.length === 0 && mcqQuestions.length === 0) {
    return (
      <SafeAreaView style={[{ flex: 1 }, { backgroundColor: t.background }]}>
        <Text style={{ color: t.text, padding: 20 }}>No content yet for this lesson.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 20 }}>
          <Text style={{ color: color }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentQ = mcqQuestions[Math.min(qIndex, mcqQuestions.length - 1)];
  const isLastQ = qIndex + 1 >= mcqQuestions.length;
  const lessonLabel = phase === "flashcard"
    ? `Learn · ${fcIndex + 1}/${fcTotal}`
    : `Quiz · Q${qIndex + 1}/${mcqQuestions.length}`;

  return (
    <SafeAreaView style={[scr.safe, { backgroundColor: t.background }]}>
      <StatusBar barStyle={"dark-content" as any} backgroundColor={t.background} />

      {/* Top bar */}
      <View style={[scr.topBar, { backgroundColor: t.surface, borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={() => { stopSpeaking(); router.back(); }}
          style={scr.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={22} color={t.textMuted} strokeWidth={2.5} />
        </TouchableOpacity>
        <ProgressBar current={progressCurrent} total={totalItems} color={color} />
        {/* Phase pill */}
        <View style={[scr.phasePill, { backgroundColor: phase === "flashcard" ? color + "20" : "#22C55E20" }]}>
          {phase === "flashcard"
            ? <BookOpen size={13} color={color} strokeWidth={2.5} />
            : <CheckCircle2 size={13} color="#22C55E" strokeWidth={2.5} />}
          <Text style={[scr.phaseLabel, { color: phase === "flashcard" ? color : "#22C55E" }]}>
            {phase === "flashcard" ? "Learn" : "Quiz"}
          </Text>
        </View>
      </View>

      {/* Level name + question counter subtitle */}
      <View style={scr.subBar}>
        <Text style={[scr.levelName, { color: t.textMuted }]} numberOfLines={1}>{levelName}</Text>
        <Text style={[scr.lessonLabel, { color }]}>{lessonLabel}</Text>
      </View>

      {/* ── Flashcard Phase ── */}
      {phase === "flashcard" && (
        <FlashCardSlide
          card={flashCards[fcIndex]}
          index={fcIndex}
          total={fcTotal}
          color={color}
          onNext={handleNextFC}
        />
      )}

      {/* ── MCQ Phase ── */}
      {phase === "mcq" && currentQ && (
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={scr.mcqScroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Question */}
            <View style={[scr.qCard, { backgroundColor: t.surface, borderColor: t.border }]}>
              <Text style={[scr.qText, { color: t.text }]}>{currentQ.q}</Text>
            </View>

            {/* Intro hint before answering */}
            {lessonType === "intro" && answerState === "unanswered" && currentQ.explanation && (
              <View style={[scr.hintBox, { backgroundColor: color + "12", borderColor: color + "40" }]}>
                <Lightbulb size={16} color={color} strokeWidth={2.5} />
                <Text style={[scr.hintTxt, { color: t.text }]}>{currentQ.explanation}</Text>
              </View>
            )}

            {/* Options */}
            <View style={scr.options}>
              {currentQ.options.map((opt: string, i: number) => {
                let state: "idle" | "correct" | "wrong" | "dimmed" = "idle";
                if (answerState !== "unanswered") {
                  if (i === currentQ.answer) state = "correct";
                  else if (i === selectedAnswer && selectedAnswer !== currentQ.answer) state = "wrong";
                  else state = "dimmed";
                }
                return (
                  <OptionBtn
                    key={i} letter={LETTERS[i]} text={opt} state={state}
                    disabled={answerState !== "unanswered"}
                    onPress={() => handleAnswer(i)} color={color}
                  />
                );
              })}
            </View>

            <View style={{ height: 200 }} />
          </ScrollView>

          {/* Feedback bar */}
          {answerState !== "unanswered" && (
            <FeedbackBar
              state={answerState}
              explanation={currentQ.explanation ?? ""}
              color={color}
              onNext={handleNext}
              isLast={isLastQ}
            />
          )}

          {/* XP burst on correct */}
          {showXP && answerState === "correct" && <XPBurst xp={10} color={color} />}
        </View>
      )}
    </SafeAreaView>
  );
}

const scr = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, gap: 12,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  phasePill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5,
  },
  phaseLabel: { fontSize: 11, fontWeight: "800" },
  subBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 10,
  },
  levelName: { fontSize: 13, fontWeight: "600", flex: 1 },
  lessonLabel: { fontSize: 13, fontWeight: "800" },
  mcqScroll: { padding: 20, paddingTop: 8 },
  qCard: {
    borderRadius: 20, borderWidth: 1.5, padding: 22, marginBottom: 20,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  qText: { fontSize: 19, fontWeight: "700", lineHeight: 27 },
  hintBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    borderRadius: 16, borderWidth: 1.5, padding: 14, marginBottom: 16,
  },
  hintTxt: { flex: 1, fontSize: 14, fontWeight: "500", lineHeight: 20 },
  options: { gap: 0 },
});
