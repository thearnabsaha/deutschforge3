import React, { useState, useRef, useCallback, memo, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { speakGerman, stopSpeaking } from "../../lib/tts";
import { Volume2, ChevronLeft, Trophy, Award } from "lucide-react-native";
import { api } from "../../lib/api";
import { DeutschForgeMascot } from "../../components/DeutschForgeMascot";
import { useTheme } from "../../lib/theme";
import type { StudyWord } from "../(tabs)/study";

const RATING_COLORS = { 1: "#FF4B4B", 2: "#FF9F1C", 3: "#58CC02", 4: "#1CB0F6" } as const;
const RATING_LABELS = { 1: "Again", 2: "Hard", 3: "Good", 4: "Easy" } as const;

const POS_COLORS: Record<string, string> = {
  noun: "#CE82FF", verb: "#1CB0F6", adjective: "#FFC800",
  adverb: "#58CC02", pronoun: "#FF9F1C", preposition: "#FF4B4B",
  conjunction: "#888", article: "#888", unknown: "#aaa",
};
const GENDER_COLORS: Record<string, string> = {
  masculine: "#1CB0F6", feminine: "#FF4B4B", neutral: "#888",
};
const CEFR_COLORS: Record<string, string> = {
  A1: "#58CC02", A2: "#45A800", B1: "#1CB0F6", B2: "#0082B9", C1: "#CE82FF", C2: "#9B3FCF",
};

interface FlashCardProps {
  word: StudyWord;
  onFlip: (flipped: boolean) => void;
  isFlipped: boolean;
}

const FlashCard = memo(function FlashCard({ word, onFlip, isFlipped }: FlashCardProps) {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const wordDisplay = word.displayGerman ?? word.german;
  const posColor = POS_COLORS[word.partOfSpeech] ?? "#aaa";
  const cefrColor = word.cefrLevel ? CEFR_COLORS[word.cefrLevel] ?? "#888" : null;
  const genderColor = word.genderCategory ? GENDER_COLORS[word.genderCategory] ?? "#888" : null;

  // Reset flip animation when isFlipped prop resets to false (new card)
  useEffect(() => {
    if (!isFlipped) {
      flipAnim.setValue(0);
    }
  }, [isFlipped, flipAnim]);

  useEffect(() => {
    setIsSpeaking(true);
    const timer = setTimeout(() =>
      speakGerman(wordDisplay, {
        onStart: () => setIsSpeaking(true),
        onDone: () => setIsSpeaking(false),
      }), 200);
    return () => { clearTimeout(timer); stopSpeaking(); setIsSpeaking(false); };
  }, [wordDisplay]);

  const flip = useCallback(() => {
    if (isFlipped) return;
    onFlip(true);
    Animated.spring(flipAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  }, [isFlipped, flipAnim, onFlip]);

  const speakWord = useCallback((e: any) => {
    e.stopPropagation?.();
    if (isSpeaking) { stopSpeaking(); setIsSpeaking(false); return; }
    speakGerman(wordDisplay, {
      onStart: () => setIsSpeaking(true),
      onDone: () => setIsSpeaking(false),
    });
  }, [wordDisplay, isSpeaking]);

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });
  const frontOpacity = flipAnim.interpolate({ inputRange: [0, 0.45, 0.5], outputRange: [1, 1, 0] });
  const backOpacity = flipAnim.interpolate({ inputRange: [0.5, 0.55, 1], outputRange: [0, 1, 1] });

  const BadgeRow = (
    <View style={styles.badgeRow}>
      <View style={[styles.chip, { backgroundColor: posColor + "22", borderColor: posColor }]}>
        <Text style={[styles.chipText, { color: posColor }]}>{word.partOfSpeech}</Text>
      </View>
      {word.cefrLevel && cefrColor && (
        <View style={[styles.chip, { backgroundColor: cefrColor + "22", borderColor: cefrColor }]}>
          <Text style={[styles.chipText, { color: cefrColor }]}>{word.cefrLevel}</Text>
        </View>
      )}
      {word.genderCategory && genderColor && (
        <View style={[styles.chip, { backgroundColor: genderColor + "22", borderColor: genderColor }]}>
          <Text style={[styles.chipText, { color: genderColor }]}>{word.genderCategory}</Text>
        </View>
      )}
    </View>
  );

  return (
    <TouchableOpacity onPress={flip} activeOpacity={1} style={styles.cardWrapper}>
      {/* FRONT */}
      <Animated.View
        style={[styles.card, { transform: [{ rotateY: frontRotate }], opacity: frontOpacity }]}
        pointerEvents={isFlipped ? "none" : "auto"}
      >
        {/* Top row: badges + audio */}
        <View style={styles.cardTopRow}>
          {BadgeRow}
          <TouchableOpacity onPress={speakWord} style={styles.audioBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            {isSpeaking
              ? <ActivityIndicator size="small" color="#1CB0F6" />
              : <Volume2 size={18} color="#888" strokeWidth={2} />}
          </TouchableOpacity>
        </View>

        {/* Main word */}
        <View style={styles.wordBlock}>
          <Text style={styles.germanWord}>{wordDisplay}</Text>
          {word.gender && genderColor && (
            <View style={[styles.genderPill, { backgroundColor: genderColor + "18", borderColor: genderColor }]}>
              <Text style={[styles.genderPillText, { color: genderColor }]}>{word.gender}</Text>
            </View>
          )}
          {word.ipa && <Text style={styles.ipaText}>{word.ipa}</Text>}
        </View>

        {/* Example */}
        {word.exampleSentence && (
          <View style={styles.exampleBox}>
            <Text style={styles.exampleLabel}>EXAMPLE</Text>
            <Text style={styles.exampleText}>"{word.exampleSentence}"</Text>
          </View>
        )}

        {/* Tap hint */}
        <View style={styles.tapHintRow}>
          <Text style={styles.tapHintText}>Tap to reveal meaning</Text>
        </View>
      </Animated.View>

      {/* BACK */}
      <Animated.View
        style={[styles.card, styles.cardBack, { transform: [{ rotateY: backRotate }], opacity: backOpacity }]}
        pointerEvents={isFlipped ? "auto" : "none"}
      >
        {/* Top row: badges + audio */}
        <View style={styles.cardTopRow}>
          {BadgeRow}
          <TouchableOpacity onPress={speakWord} style={styles.audioBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            {isSpeaking
              ? <ActivityIndicator size="small" color="#1CB0F6" />
              : <Volume2 size={18} color="#888" strokeWidth={2} />}
          </TouchableOpacity>
        </View>

        {/* Word + meaning */}
        <View style={styles.wordBlock}>
          <Text style={styles.germanWordSmall}>{wordDisplay}</Text>
          <Text style={styles.englishMeaning}>{word.english}</Text>
        </View>

        {/* Example with translation */}
        {word.exampleSentence && (
          <View style={styles.exampleBox}>
            <Text style={styles.exampleLabel}>EXAMPLE</Text>
            <Text style={styles.exampleText}>"{word.exampleSentence}"</Text>
            {word.exampleTranslation && (
              <Text style={styles.exampleTranslation}>"{word.exampleTranslation}"</Text>
            )}
          </View>
        )}

        {/* AI tip */}
        {word.aiNotes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>TIP</Text>
            <Text style={styles.notesText}>{word.aiNotes}</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
});

export default function FlashcardMode() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ setId: string; setName: string; words: string; allWords: string }>();

  const setWords: StudyWord[] = useMemo(() => {
    try { return JSON.parse(params.words ?? "[]"); } catch { return []; }
  }, [params.words]);

  const dueCards = useQuery({
    queryKey: ["review", "due", params.setId],
    queryFn: async () => {
      const res = await api.review.due.$get();
      const data = await res.json();
      const setWordIds = new Set(setWords.map((w) => w.id));
      return { cards: data.cards.filter((c: any) => setWordIds.has(c.word.id)) };
    },
    staleTime: 0,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [cardsReviewed, setCardsReviewed] = useState(0);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [sessionRatings, setSessionRatings] = useState<number[]>([]);

  const submitReview = useMutation({
    mutationFn: async (data: { cardId: string; rating: number; sessionRatings?: number[]; sessionComplete?: boolean }) =>
      (await api.review.submit.$post({ json: data })).json(),
    onSuccess: (data: any) => {
      setXpGained((prev) => prev + (data.xpEarned ?? 0));
      if (data.newBadges?.length) setNewBadges((prev) => [...prev, ...data.newBadges]);
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  const cards = dueCards.data?.cards ?? [];
  const currentCard = cards[currentIndex];

  const handleRate = useCallback((rating: 1 | 2 | 3 | 4) => {
    if (!currentCard) return;
    const allRatings = [...sessionRatings, rating];
    setSessionRatings(allRatings);
    setCardsReviewed((p) => p + 1);
    const isLast = currentIndex === cards.length - 1;

    // Advance immediately — no await
    if (isLast) {
      setSessionDone(true);
    } else {
      setIsFlipped(false);
      setCurrentIndex((p) => p + 1);
    }

    // Submit in background
    submitReview.mutate({
      cardId: currentCard.card.id,
      rating,
      sessionRatings: allRatings,
      sessionComplete: isLast,
    });
  }, [currentCard, currentIndex, cards.length, sessionRatings, submitReview]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (dueCards.isLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: t.background }]} edges={["top"]}>
        <View style={styles.centered}><ActivityIndicator size="large" color={t.primary} /></View>
      </SafeAreaView>
    );
  }

  // ── Done / empty ─────────────────────────────────────────────────────────
  if (sessionDone || cards.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: t.background }]} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.doneContainer}>
          <DeutschForgeMascot mood={cards.length === 0 ? "thinking" : "celebrate"} size={120} controlled />
          <Text style={[styles.doneTitle, { color: t.text }]}>
            {cards.length === 0 ? "All caught up!" : "Session Complete!"}
          </Text>
          <Text style={[styles.doneSub, { color: t.textMuted }]}>
            {cards.length === 0 ? "No cards due right now." : `${cardsReviewed} cards reviewed`}
          </Text>
          {xpGained > 0 && (
            <View style={[styles.xpBadge, { backgroundColor: t.accent + "22" }]}>
              <Trophy size={16} color={t.accent} strokeWidth={2} />
              <Text style={[styles.xpBadgeText, { color: t.accent }]}>+{xpGained} XP</Text>
            </View>
          )}
          {newBadges.length > 0 && (
            <View style={[styles.badgesBox, { backgroundColor: t.surfaceAlt }]}>
              <Award size={16} color={t.accent} strokeWidth={2} />
              <Text style={[styles.badgesTitle, { color: t.accent }]}>New badges unlocked</Text>
              {newBadges.map((b) => (
                <Text key={b} style={[styles.badgeItem, { color: t.text }]}>• {b.replace(/_/g, " ")}</Text>
              ))}
            </View>
          )}
          <TouchableOpacity style={[styles.doneBtn, { backgroundColor: t.primary }]} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Back to Sets</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const progress = (currentIndex / cards.length) * 100;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.background }]} edges={["top"]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={t.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: t.text }]}>Word Repetition</Text>
        <Text style={[styles.counterText, { color: t.textMuted }]}>{currentIndex + 1}/{cards.length}</Text>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressBg, { backgroundColor: t.border }]}>
        <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: t.primary }]} />
      </View>

      {/* Card */}
      <View style={styles.cardArea}>
        <FlashCard
          key={`card-${currentIndex}`}
          word={{ reps: null, state: null, ...(currentCard.word as any) } as StudyWord}
          onFlip={setIsFlipped}
          isFlipped={isFlipped}
        />
      </View>

      {/* Bottom action area — fixed height so layout never jumps */}
      <View style={[styles.bottomArea, { borderTopColor: t.border }]}>
        {isFlipped ? (
          <View style={styles.ratingRow}>
            {([1, 2, 3, 4] as const).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.ratingBtn, { backgroundColor: RATING_COLORS[r] }]}
                onPress={() => handleRate(r)}
                activeOpacity={0.75}
              >
                <Text style={styles.ratingBtnLabel}>{RATING_LABELS[r]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={[styles.tapHintBottom, { color: t.textMuted }]}>Tap the card to flip</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  topBarTitle: { fontSize: 16, fontWeight: "800" },
  counterText: { fontSize: 13, fontWeight: "700", minWidth: 40, textAlign: "right" },

  // Progress
  progressBg: { height: 4, marginHorizontal: 16, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },

  // Card area — takes remaining space, centers card
  cardArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    justifyContent: "center",
  },

  // Card wrapper for flip
  cardWrapper: { width: "100%" },

  // The actual card — no space-between, content stacks naturally
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    backfaceVisibility: "hidden",
    gap: 16,                   // ← even spacing between every section
  },
  cardBack: {
    position: "absolute",
    top: 0, left: 0, right: 0,
  },

  // Top row inside card
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  badgeRow: { flexDirection: "row", gap: 6, flexWrap: "wrap", flex: 1, marginRight: 8 },
  chip: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  chipText: { fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  audioBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#F5F5F5",
    alignItems: "center", justifyContent: "center",
  },

  // Word block — centered, compact
  wordBlock: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  germanWord: {
    fontSize: 38,
    fontWeight: "800",
    color: "#1F1F1F",
    textAlign: "center",
    lineHeight: 44,
  },
  germanWordSmall: {
    fontSize: 16,
    fontWeight: "700",
    color: "#999",
    textAlign: "center",
    lineHeight: 22,
  },
  genderPill: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  genderPillText: { fontSize: 13, fontWeight: "700" },
  ipaText: {
    fontSize: 15,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
  },
  englishMeaning: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F1F1F",
    textAlign: "center",
    lineHeight: 34,
  },

  // Example box
  exampleBox: {
    backgroundColor: "#F0F5FF",
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#1CB0F6",
    gap: 4,
  },
  exampleLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1CB0F6",
    letterSpacing: 0.8,
  },
  exampleText: { fontSize: 13, color: "#334", fontStyle: "italic", lineHeight: 19 },
  exampleTranslation: { fontSize: 12, color: "#778", lineHeight: 18 },

  // Notes box
  notesBox: {
    backgroundColor: "#FFFBEC",
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#FFC800",
    gap: 4,
  },
  notesLabel: { fontSize: 10, fontWeight: "800", color: "#AA8800", letterSpacing: 0.8 },
  notesText: { fontSize: 12, color: "#554400", lineHeight: 18 },

  // Tap hint inside card
  tapHintRow: { alignItems: "center" },
  tapHintText: { fontSize: 13, color: "#bbb", fontWeight: "600" },

  // Bottom area — fixed height so layout is stable
  bottomArea: {
    height: 100,
    paddingHorizontal: 16,
    paddingBottom: 20,
    justifyContent: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  ratingRow: { flexDirection: "row", gap: 8 },
  ratingBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingBtnLabel: { color: "#fff", fontWeight: "800", fontSize: 14 },
  tapHintBottom: { textAlign: "center", fontSize: 14, fontWeight: "600" },

  // Done screen
  doneContainer: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  doneEmoji: { fontSize: 56 },
  doneTitle: { fontSize: 26, fontWeight: "800", textAlign: "center" },
  doneSub: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  xpBadge: {
    borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10,
    flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4,
  },
  xpBadgeText: { fontWeight: "800", fontSize: 16 },
  badgesBox: {
    borderRadius: 16, padding: 16, width: "100%",
    alignItems: "center", gap: 4,
  },
  badgesTitle: { fontWeight: "800", fontSize: 15 },
  badgeItem: { fontSize: 14 },
  doneBtn: {
    borderRadius: 24, paddingVertical: 15, paddingHorizontal: 40, marginTop: 12,
  },
  doneBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
