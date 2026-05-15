import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import {
  Volume2,
  ChevronLeft,
  ChevronRight,
  Play,
  RotateCcw,
  CheckCircle2,
  Eye,
  EyeOff,
  Mic,
  MicOff,
} from "lucide-react-native";
import { useTheme } from "../../lib/theme";
import { baseUrl } from "../../lib/api";
import type { StudyWord } from "../(tabs)/study";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SPEEDS = [
  { label: "Slow", rate: 0.6 },
  { label: "Normal", rate: 0.85 },
  { label: "Fast", rate: 1.1 },
];

interface PronunciationResult {
  transcribed: string;
  score: number;
  feedback: string;
}

export default function SpeakingMode() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ setId: string; setName: string; words: string }>();

  const setWords: StudyWord[] = useMemo(() => {
    try { return JSON.parse(params.words ?? "[]"); } catch { return []; }
  }, [params.words]);

  const words = useMemo(() => shuffle(setWords), [setWords]);

  // Shared state
  const [mode, setMode] = useState<"listen" | "speak">("listen");
  const [index, setIndex] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [showMeaning, setShowMeaning] = useState(false);
  const [showIPA, setShowIPA] = useState(true);
  const [done, setDone] = useState(false);

  // Listen mode
  const [isPlaying, setIsPlaying] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Speak mode
  const [isRecording, setIsRecording] = useState(false);
  const [isAssessing, setIsAssessing] = useState(false);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const autoStopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const micPulse = useRef(new Animated.Value(1)).current;
  const micPulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  // Track speak mode scores for summary
  const [speakScores, setSpeakScores] = useState<number[]>([]);

  const word = words[index];
  const speed = SPEEDS[speedIdx];

  // ── Listen mode ──────────────────────────────────────────────────────────

  const speak = useCallback(async () => {
    if (!word || isPlaying) return;
    setIsPlaying(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      { iterations: 3 }
    ).start(() => setIsPlaying(false));
    Speech.stop();
    Speech.speak(word.displayGerman ?? word.german, {
      language: "de-DE",
      rate: speed.rate,
      onDone: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  }, [word, isPlaying, speed, pulseAnim]);

  const speakExample = useCallback(() => {
    if (!word?.exampleSentence) return;
    Speech.stop();
    Speech.speak(word.exampleSentence, { language: "de-DE", rate: 0.8 });
  }, [word]);

  // ── Speak mode ───────────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
      setResult(null);

      // Pulse animation
      micPulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(micPulse, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(micPulse, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      );
      micPulseLoop.current.start();

      // Auto-stop after 4 seconds
      autoStopTimer.current = setTimeout(() => stopRecording(), 4000);
    } catch (e) {
      console.error("Recording error:", e);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) return;

    // Clear auto-stop timer
    if (autoStopTimer.current) {
      clearTimeout(autoStopTimer.current);
      autoStopTimer.current = null;
    }

    // Stop pulse
    micPulseLoop.current?.stop();
    Animated.timing(micPulse, { toValue: 1, duration: 150, useNativeDriver: true }).start();

    setIsRecording(false);
    setIsAssessing(true);

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri || !word) {
        setIsAssessing(false);
        return;
      }

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64" as any,
      });

      // Call backend
      const res = await fetch(`${baseUrl}/api/pronunciation/assess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: word.displayGerman ?? word.german,
          audioBase64: base64,
          mimeType: "audio/m4a",
        }),
      });

      if (res.ok) {
        const data: PronunciationResult = await res.json();
        setResult(data);
        setSpeakScores((prev) => [...prev, data.score]);
      } else {
        setResult({ transcribed: "", score: 0, feedback: "Server error — try again." });
      }
    } catch (e) {
      console.error("Assessment error:", e);
      setResult({ transcribed: "", score: 0, feedback: "Couldn't connect — try again." });
    } finally {
      setIsAssessing(false);
    }
  }, [word]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
      if (autoStopTimer.current) clearTimeout(autoStopTimer.current);
    };
  }, []);

  // ── Navigation ───────────────────────────────────────────────────────────

  const handleNext = useCallback(() => {
    if (index + 1 >= words.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setShowMeaning(false);
      setResult(null);
    }
  }, [index, words.length]);

  const handleRestart = useCallback(() => {
    setIndex(0);
    setShowMeaning(false);
    setResult(null);
    setDone(false);
    setSpeakScores([]);
  }, []);

  // ── Done screen ──────────────────────────────────────────────────────────

  if (done) {
    const avgScore = speakScores.length > 0
      ? Math.round(speakScores.reduce((a, b) => a + b, 0) / speakScores.length)
      : null;

    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: t.background }]} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={{ fontSize: 64 }}>{mode === "speak" && avgScore !== null ? (avgScore >= 80 ? "🎯" : avgScore >= 55 ? "👍" : "💪") : "🎙️"}</Text>
          <Text style={[styles.doneTitle, { color: t.text }]}>Practice Complete!</Text>
          <Text style={[styles.doneSub, { color: t.textMuted }]}>You practiced {words.length} words</Text>
          {mode === "speak" && avgScore !== null && (
            <View style={[styles.scoreChip, { backgroundColor: scoreColor(avgScore) + "22", borderColor: scoreColor(avgScore) }]}>
              <Text style={[styles.scoreChipText, { color: scoreColor(avgScore) }]}>
                Avg pronunciation score: {avgScore}%
              </Text>
            </View>
          )}
          <TouchableOpacity style={[styles.btn, { backgroundColor: t.primary }]} onPress={handleRestart}>
            <Text style={styles.btnText}>Practice Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnOutline, { borderColor: t.border }]} onPress={() => router.back()}>
            <Text style={[styles.btnOutlineText, { color: t.textMuted }]}>Back to Modes</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const progress = index / words.length;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.background }]} edges={["top"]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={t.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: t.text }]}>Pronunciation</Text>
        <Text style={[styles.progressLabel2, { color: t.textMuted }]}>{index + 1}/{words.length}</Text>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressBg, { backgroundColor: t.border }]}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: t.primary }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Mode toggle */}
        <View style={[styles.modeRow, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
          <TouchableOpacity
            style={[styles.modeBtn, { backgroundColor: mode === "listen" ? t.primary : "transparent" }]}
            onPress={() => setMode("listen")}
          >
            <Volume2 size={14} color={mode === "listen" ? "#fff" : t.textMuted} strokeWidth={2} />
            <Text style={[styles.modeBtnText, { color: mode === "listen" ? "#fff" : t.textMuted }]}>Listen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, { backgroundColor: mode === "speak" ? "#FF4B4B" : "transparent" }]}
            onPress={() => setMode("speak")}
          >
            <Mic size={14} color={mode === "speak" ? "#fff" : t.textMuted} strokeWidth={2} />
            <Text style={[styles.modeBtnText, { color: mode === "speak" ? "#fff" : t.textMuted }]}>Speak</Text>
          </TouchableOpacity>
        </View>

        {/* Speed selector — listen mode only */}
        {mode === "listen" && (
          <View style={[styles.speedRow, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
            {SPEEDS.map((s, i) => (
              <TouchableOpacity
                key={s.label}
                style={[styles.speedBtn, { backgroundColor: speedIdx === i ? t.primary : "transparent" }]}
                onPress={() => setSpeedIdx(i)}
              >
                <Text style={[styles.speedBtnText, { color: speedIdx === i ? "#fff" : t.textMuted }]}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Main card */}
        <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
          {/* Chips */}
          <View style={styles.chipRow}>
            <View style={[styles.chip, { backgroundColor: "#1CB0F622", borderColor: "#1CB0F6" }]}>
              <Text style={[styles.chipText, { color: "#1CB0F6" }]}>{word?.partOfSpeech}</Text>
            </View>
            {word?.cefrLevel && (
              <View style={[styles.chip, { backgroundColor: "#CE82FF22", borderColor: "#CE82FF" }]}>
                <Text style={[styles.chipText, { color: "#CE82FF" }]}>{word.cefrLevel}</Text>
              </View>
            )}
          </View>

          {/* Word */}
          <Text style={[styles.wordText, { color: t.text }]}>
            {word?.displayGerman ?? word?.german}
          </Text>

          {/* IPA */}
          {word?.ipa && showIPA && (
            <View style={styles.ipaBox}>
              <Text style={[styles.ipaText, { color: t.textMuted }]}>{word.ipa}</Text>
            </View>
          )}

          {/* ── LISTEN MODE ─────────────────────────── */}
          {mode === "listen" && (
            <>
              <Animated.View style={[styles.playBtnWrapper, { transform: [{ scale: pulseAnim }] }]}>
                <TouchableOpacity
                  style={[styles.playBtn, { backgroundColor: isPlaying ? t.primary : "#1CB0F6" }]}
                  onPress={speak}
                  activeOpacity={0.85}
                >
                  {isPlaying
                    ? <Volume2 size={32} color="#fff" strokeWidth={2} />
                    : <Play size={32} color="#fff" strokeWidth={2} fill="#fff" />
                  }
                </TouchableOpacity>
              </Animated.View>
              <Text style={[styles.playHint, { color: t.textMuted }]}>
                {isPlaying ? `Playing at ${speed.label} speed…` : `Tap to hear at ${speed.label} speed`}
              </Text>
            </>
          )}

          {/* ── SPEAK MODE ──────────────────────────── */}
          {mode === "speak" && (
            <>
              {isAssessing ? (
                <View style={styles.assessingBox}>
                  <ActivityIndicator size="large" color={t.primary} />
                  <Text style={[styles.assessingText, { color: t.textMuted }]}>Assessing…</Text>
                </View>
              ) : result ? (
                <View style={[styles.resultBox, { borderColor: scoreColor(result.score) + "66", backgroundColor: scoreColor(result.score) + "11" }]}>
                  <View style={styles.resultRow}>
                    <View style={[styles.scoreCircle, { borderColor: scoreColor(result.score) }]}>
                      <Text style={[styles.scoreNum, { color: scoreColor(result.score) }]}>{result.score}</Text>
                      <Text style={[styles.scoreLabel, { color: scoreColor(result.score) }]}>%</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.feedbackText, { color: t.text }]}>{result.feedback}</Text>
                      {result.transcribed ? (
                        <Text style={[styles.heardText, { color: t.textMuted }]}>We heard: "{result.transcribed}"</Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.micHintBox}>
                  <Text style={[styles.micHint, { color: t.textMuted }]}>
                    Tap the mic and say the word out loud
                  </Text>
                </View>
              )}

              {/* Mic button */}
              <Animated.View style={[styles.micBtnWrapper, { transform: [{ scale: micPulse }] }]}>
                <TouchableOpacity
                  style={[styles.micBtn, {
                    backgroundColor: isRecording ? "#FF4B4B" : isAssessing ? t.surfaceAlt : "#FF4B4B22",
                    borderColor: isRecording ? "#FF4B4B" : t.border,
                    borderWidth: 2,
                  }]}
                  onPress={isRecording ? stopRecording : startRecording}
                  disabled={isAssessing}
                  activeOpacity={0.8}
                >
                  {isRecording
                    ? <MicOff size={32} color="#fff" strokeWidth={2} />
                    : <Mic size={32} color={isAssessing ? t.textMuted : "#FF4B4B"} strokeWidth={2} />
                  }
                </TouchableOpacity>
              </Animated.View>
              <Text style={[styles.micBtnLabel, { color: t.textMuted }]}>
                {isRecording ? "Tap to stop (auto-stops in 4s)" : isAssessing ? "Checking…" : result ? "Try again" : "Tap to record"}
              </Text>
            </>
          )}

          {/* Toggles */}
          <View style={styles.toggleRow}>
            {word?.ipa && (
              <TouchableOpacity
                style={[styles.toggleBtn, { borderColor: t.border, backgroundColor: showIPA ? t.primary + "22" : t.surfaceAlt }]}
                onPress={() => setShowIPA((v) => !v)}
              >
                {showIPA ? <Eye size={14} color={t.primary} strokeWidth={2} /> : <EyeOff size={14} color={t.textMuted} strokeWidth={2} />}
                <Text style={[styles.toggleBtnText, { color: showIPA ? t.primary : t.textMuted }]}>IPA</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.toggleBtn, { borderColor: t.border, backgroundColor: showMeaning ? "#58CC0222" : t.surfaceAlt }]}
              onPress={() => setShowMeaning((v) => !v)}
            >
              {showMeaning ? <Eye size={14} color="#58CC02" strokeWidth={2} /> : <EyeOff size={14} color={t.textMuted} strokeWidth={2} />}
              <Text style={[styles.toggleBtnText, { color: showMeaning ? "#58CC02" : t.textMuted }]}>Meaning</Text>
            </TouchableOpacity>
          </View>

          {showMeaning && (
            <View style={[styles.meaningReveal, { backgroundColor: "#58CC0215", borderColor: "#58CC0244" }]}>
              <CheckCircle2 size={16} color="#58CC02" strokeWidth={2} />
              <Text style={[styles.meaningText, { color: t.text }]}>{word?.english}</Text>
            </View>
          )}
        </View>

        {/* Example sentence */}
        {word?.exampleSentence && (
          <View style={[styles.exampleCard, { backgroundColor: t.surface, borderColor: t.border }]}>
            <View style={styles.exampleHeader}>
              <Text style={styles.exampleLabel}>EXAMPLE SENTENCE</Text>
              <TouchableOpacity onPress={speakExample} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Volume2 size={16} color="#1CB0F6" strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.exampleText, { color: t.text }]}>"{word.exampleSentence}"</Text>
            {word.exampleTranslation && (
              <Text style={[styles.exampleTranslation, { color: t.textMuted }]}>"{word.exampleTranslation}"</Text>
            )}
          </View>
        )}

        {/* Tip */}
        {word?.aiNotes && (
          <View style={styles.tipBox}>
            <Text style={styles.tipLabel}>💡 TIP</Text>
            <Text style={[styles.tipText, { color: t.text }]}>{word.aiNotes}</Text>
          </View>
        )}

        {/* Navigation */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, { borderColor: t.border, backgroundColor: t.surface }]}
            onPress={() => { if (index > 0) { setIndex((i) => i - 1); setShowMeaning(false); setResult(null); } }}
            disabled={index === 0}
          >
            <ChevronLeft size={20} color={index === 0 ? t.textMuted : t.text} strokeWidth={2.5} />
            <Text style={[styles.navBtnText, { color: index === 0 ? t.textMuted : t.text }]}>Prev</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navBtnPrimary, { backgroundColor: t.primary }]}
            onPress={handleNext}
          >
            <Text style={styles.navBtnPrimaryText}>
              {index + 1 >= words.length ? "Finish" : "Next"}
            </Text>
            <ChevronRight size={20} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function scoreColor(score: number): string {
  if (score >= 75) return "#58CC02";
  if (score >= 45) return "#FFC800";
  return "#FF4B4B";
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 32 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  topBarTitle: { fontSize: 16, fontWeight: "800" },
  progressLabel2: { fontSize: 13, fontWeight: "700" },
  progressBg: { height: 6, marginHorizontal: 16, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 12 },
  modeRow: { flexDirection: "row", borderRadius: 12, borderWidth: 1, overflow: "hidden", padding: 3, gap: 3 },
  modeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8, borderRadius: 9 },
  modeBtnText: { fontSize: 13, fontWeight: "700" },
  speedRow: { flexDirection: "row", borderRadius: 12, borderWidth: 1, overflow: "hidden", padding: 3, gap: 3 },
  speedBtn: { flex: 1, paddingVertical: 7, borderRadius: 9, alignItems: "center" },
  speedBtnText: { fontSize: 13, fontWeight: "700" },
  card: {
    borderRadius: 22, borderWidth: 1.5, padding: 22,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
    alignItems: "center",
  },
  chipRow: { flexDirection: "row", gap: 6, marginBottom: 12, alignSelf: "flex-start" },
  chip: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  chipText: { fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  wordText: { fontSize: 36, fontWeight: "900", textAlign: "center", lineHeight: 44 },
  ipaBox: { marginTop: 6 },
  ipaText: { fontSize: 18, fontStyle: "italic", textAlign: "center" },
  playBtnWrapper: { marginTop: 20, marginBottom: 10 },
  playBtn: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 8,
  },
  playHint: { fontSize: 12, fontWeight: "600", marginBottom: 16 },
  micHintBox: { marginTop: 14, marginBottom: 4 },
  micHint: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  micBtnWrapper: { marginTop: 16, marginBottom: 4 },
  micBtn: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#FF4B4B", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 6,
  },
  micBtnLabel: { fontSize: 12, fontWeight: "600", marginBottom: 12, textAlign: "center" },
  assessingBox: { alignItems: "center", gap: 8, marginTop: 16, marginBottom: 8 },
  assessingText: { fontSize: 13, fontWeight: "600" },
  resultBox: { width: "100%", borderRadius: 14, borderWidth: 1.5, padding: 14, marginTop: 14, marginBottom: 4 },
  resultRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  scoreCircle: {
    width: 56, height: 56, borderRadius: 28, borderWidth: 3,
    alignItems: "center", justifyContent: "center",
  },
  scoreNum: { fontSize: 20, fontWeight: "900" },
  scoreLabel: { fontSize: 11, fontWeight: "700", marginTop: -4 },
  feedbackText: { fontSize: 14, fontWeight: "700", marginBottom: 3 },
  heardText: { fontSize: 12, fontStyle: "italic" },
  toggleRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  toggleBtn: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 7 },
  toggleBtnText: { fontSize: 12, fontWeight: "700" },
  meaningReveal: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 10, width: "100%" },
  meaningText: { fontSize: 18, fontWeight: "800" },
  exampleCard: { borderRadius: 16, borderWidth: 1.5, padding: 16 },
  exampleHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  exampleLabel: { fontSize: 10, fontWeight: "800", color: "#1CB0F6", letterSpacing: 1 },
  exampleText: { fontSize: 15, fontStyle: "italic", lineHeight: 22 },
  exampleTranslation: { fontSize: 13, marginTop: 4, lineHeight: 19 },
  tipBox: { backgroundColor: "#FFFBEC", borderRadius: 14, padding: 14, borderLeftWidth: 3, borderLeftColor: "#FFC800" },
  tipLabel: { fontSize: 10, fontWeight: "800", color: "#AA8800", marginBottom: 4, letterSpacing: 1 },
  tipText: { fontSize: 13, lineHeight: 19 },
  navRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  navBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1.5, borderRadius: 16, paddingVertical: 14 },
  navBtnText: { fontSize: 15, fontWeight: "700" },
  navBtnPrimary: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 16, paddingVertical: 14 },
  navBtnPrimaryText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  doneTitle: { fontSize: 28, fontWeight: "900" },
  doneSub: { fontSize: 16 },
  scoreChip: { borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 8 },
  scoreChipText: { fontSize: 14, fontWeight: "700" },
  btn: { borderRadius: 24, paddingVertical: 15, paddingHorizontal: 36 },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  btnOutline: { borderRadius: 24, paddingVertical: 14, paddingHorizontal: 36, borderWidth: 2, marginTop: 4 },
  btnOutlineText: { fontWeight: "700", fontSize: 15 },
});
