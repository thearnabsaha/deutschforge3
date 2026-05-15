/**
 * ExamNavigator — standalone navigator for the Exam mode tab.
 * Uses internal state-based navigation (no expo-router) so it works
 * when rendered directly inside the tab layout.
 */
import React, { useState, useCallback } from "react";
import {
  GraduationCap, BarChart2, ChevronRight, ChevronLeft,
  Headphones, BookOpen, PenLine, Mic,
  Clock, Trophy, CheckCircle2, XCircle, RotateCcw,
  Volume2, VolumeX, Image as ImageIcon, Play, Square,
  List, Info, Star, Layers, AlignLeft, Hash,
  MessageSquare, Presentation, Users, Calendar,
  ArrowLeft, Check, X, Lightbulb, ClipboardList,
  FileText, Speaker, Gauge,
} from "lucide-react-native";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TextInput,
  Image,
} from "react-native";
import { getExamImage } from "../../lib/examImageMap";
import {
  useTTS,
  useAmbientAudio,
  AMBIENT_LABELS,
} from "../../lib/examAudioPlayer";
import type { AmbientTrack } from "../../lib/examAudioPlayer";
import { useTheme } from "../../lib/theme";
import {
  LEVEL_META,
  SECTION_META,
  getExams,
  getExamById,
} from "../../lib/goetheExamData";
import type {
  Level,
  Section,
  AnyExam,
  HoerenExam,
  LesenExam,
  SchreibenExam,
  SprechenExam,
  MCQQuestion,
  TrueFalseQuestion,
} from "../../lib/goetheExamData";
import {
  loadResults,
  saveAttempt,
  getBestScore,
  getAttemptCount,
  hasEverPassed,
  scoreColor,
} from "../../lib/examAnalytics";
import type {
  ExamResultsV2,
  ExamAttempt,
} from "../../lib/examAnalytics";
import AnalyticsScreen from "./AnalyticsScreen";
import ExamDetailScreen from "./ExamDetailScreen";

type NavState =
  | { screen: "levels" }
  | { screen: "sections"; level: Level }
  | { screen: "list"; level: Level; section: Section }
  | { screen: "exam"; level: Level; section: Section; examId: string }
  | { screen: "analytics" }
  | { screen: "exam-detail"; examId: string; level: Level; section: Section };

const LEVELS: Level[] = ["A1", "A2", "B1"];
const SECTIONS: Section[] = ["hoeren", "lesen", "schreiben", "sprechen"];

// ─── Section icon helper ─────────────────────────────────────────
function SectionIcon({ section, size = 22, color }: { section: Section; size?: number; color: string }) {
  if (section === "hoeren") return <Headphones size={size} color={color} strokeWidth={1.8} />;
  if (section === "lesen")  return <BookOpen   size={size} color={color} strokeWidth={1.8} />;
  if (section === "schreiben") return <PenLine size={size} color={color} strokeWidth={1.8} />;
  return <Mic size={size} color={color} strokeWidth={1.8} />;
}

// ─── TTS Button ──────────────────────────────────────────────────
function TTSButton({ text, color }: { text: string; color: string }) {
  const { speaking, speak, stop } = useTTS(text);
  return (
    <TouchableOpacity
      style={[s.ttsBtn, { borderColor: color, backgroundColor: color + "12" }]}
      onPress={speaking ? stop : speak}
      activeOpacity={0.7}
    >
      {speaking
        ? <Square size={12} color={color} fill={color} />
        : <Volume2 size={12} color={color} />}
      <Text style={[s.ttsBtnTxt, { color }]}>{speaking ? "Stop" : "Hören"}</Text>
    </TouchableOpacity>
  );
}

// ─── Reusable MCQ ────────────────────────────────────────────────
function MCQItem({
  question,
  selectedIndex,
  onSelect,
  showAnswer,
  color,
}: {
  question: MCQQuestion;
  selectedIndex: number | null;
  onSelect: (idx: number) => void;
  showAnswer: boolean;
  color: string;
}) {
  const { theme: t } = useTheme();
  const img = getExamImage(question.imageHint);
  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
        <Text style={[s.questionText, { color: t.text, flex: 1 }]}>{question.text}</Text>
        <TTSButton text={question.text} color={color} />
      </View>
      {question.imageHint && (
        img ? (
          <View style={[s.imageContainer, { borderColor: t.border }]}>
            <Image source={img} style={s.examImage} resizeMode="cover" />
            <Text style={[s.imageCaption, { color: t.textMuted, backgroundColor: t.surfaceAlt }]}>
              {question.imageHint}
            </Text>
          </View>
        ) : (
          <View style={[s.hintBox, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <ImageIcon size={11} color={t.textMuted} />
              <Text style={[s.hintLabel, { color: t.textMuted }]}>Bild:</Text>
            </View>
            <Text style={[s.hintText, { color: t.textSecondary }]}>{question.imageHint}</Text>
          </View>
        )
      )}
      {question.options.map((opt, idx) => {
        let bg = t.surfaceAlt, border = t.border, tc = t.text;
        if (showAnswer) {
          if (idx === question.correct) { bg = "#4CAF5020"; border = "#4CAF50"; tc = "#4CAF50"; }
          else if (idx === selectedIndex) { bg = "#F4433620"; border = "#F44336"; tc = "#F44336"; }
        } else if (idx === selectedIndex) {
          bg = color + "20"; border = color; tc = color;
        }
        return (
          <TouchableOpacity
            key={idx}
            style={[s.option, { backgroundColor: bg, borderColor: border }]}
            onPress={() => !showAnswer && onSelect(idx)}
            activeOpacity={showAnswer ? 1 : 0.7}
          >
            <View style={[s.optLetter, { borderColor: border }]}>
              <Text style={[s.optLetterTxt, { color: tc }]}>{String.fromCharCode(65 + idx)}</Text>
            </View>
            <Text style={[s.optText, { color: tc, flex: 1 }]}>{opt}</Text>
            {showAnswer && idx === question.correct && <Check size={16} color="#4CAF50" strokeWidth={3} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Reusable TF ─────────────────────────────────────────────────
function TFItem({
  question,
  selected,
  onSelect,
  showAnswer,
  color,
}: {
  question: TrueFalseQuestion;
  selected: boolean | null;
  onSelect: (v: boolean) => void;
  showAnswer: boolean;
  color: string;
}) {
  const { theme: t } = useTheme();
  return (
    <View style={{ marginBottom: 20 }}>
      <View style={[s.hintBox, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Headphones size={11} color={t.textMuted} />
            <Text style={[s.hintLabel, { color: t.textMuted }]}>Audio:</Text>
          </View>
          <TTSButton text={question.audioContext} color={color} />
        </View>
        <Text style={[s.hintText, { color: t.textSecondary, fontStyle: "italic" }]}>{question.audioContext}</Text>
      </View>
      <Text style={[s.questionText, { color: t.text }]}>„{question.statement}"</Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        {([{ label: "Richtig", value: true }, { label: "Falsch", value: false }] as const).map(({ label, value }) => {
          let bg = t.surfaceAlt, border = t.border, tc = t.text;
          if (showAnswer) {
            if (value === question.correct) { bg = "#4CAF5020"; border = "#4CAF50"; tc = "#4CAF50"; }
            else if (selected === value) { bg = "#F4433620"; border = "#F44336"; tc = "#F44336"; }
          } else if (selected === value) {
            bg = color + "20"; border = color; tc = color;
          }
          return (
            <TouchableOpacity
              key={label}
              style={[s.tfBtn, { backgroundColor: bg, borderColor: border, flex: 1 }]}
              onPress={() => !showAnswer && onSelect(value)}
              activeOpacity={showAnswer ? 1 : 0.7}
            >
              <Text style={[s.tfBtnTxt, { color: tc }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Main Navigator ───────────────────────────────────────────────
export default function ExamNavigator() {
  const { theme: t } = useTheme();
  const [nav, setNav] = useState<NavState>({ screen: "levels" });
  const [examResults, setExamResults] = useState<ExamResultsV2>({});

  // Load saved results (v2) on mount — includes migration from v1
  React.useEffect(() => {
    loadResults().then((r) => setExamResults(r));
  }, []);

  const handleSaveAttempt = async (examId: string, attempt: ExamAttempt) => {
    const updated = await saveAttempt(examId, attempt);
    setExamResults(updated);
  };

  const push = (state: NavState) => setNav(state);
  const back = () => {
    if (nav.screen === "sections") push({ screen: "levels" });
    else if (nav.screen === "list") push({ screen: "sections", level: nav.level });
    else if (nav.screen === "exam") push({ screen: "list", level: nav.level, section: nav.section });
    else if (nav.screen === "analytics") push({ screen: "levels" });
    else if (nav.screen === "exam-detail") push({ screen: "list", level: nav.level, section: nav.section });
  };

  // ── Levels Screen ──────────────────────────────────────────────
  if (nav.screen === "levels") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.background }}>
        <StatusBar barStyle={t.dark ? "light-content" : "dark-content"} backgroundColor={t.background} />
        <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 4 }}>
            <TouchableOpacity
              style={[s.analyticsBtn, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}
              onPress={() => push({ screen: "analytics" })}
              activeOpacity={0.7}
            >
              <BarChart2 size={15} color={t.textSecondary} strokeWidth={2} />
              <Text style={[s.analyticsBtnTxt, { color: t.textSecondary }]}>Analytics</Text>
            </TouchableOpacity>
          </View>
          <View style={s.centerHeader}>
            <View style={s.heroIcon}>
              <GraduationCap size={40} color="#fff" strokeWidth={1.5} />
            </View>
            <Text style={[s.heroTitle, { color: t.text }]}>Goethe Mock Exams</Text>
            <Text style={[s.heroSub, { color: t.textSecondary }]}>
              30 exams per section · A1, A2, B1 · Official format
            </Text>
          </View>
          <View style={[s.infoBanner, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
            <Text style={[s.infoTitle, { color: t.text }]}>4 Sections per Level</Text>
            <Text style={[s.infoText, { color: t.textSecondary }]}>
              Hören · Lesen · Schreiben · Sprechen{"\n"}
              Each section: 30 mock exams · Pass: 60/100
            </Text>
          </View>
          <Text style={[s.listLabel, { color: t.textMuted }]}>CHOOSE LEVEL</Text>
          {LEVELS.map((level) => {
            const m = LEVEL_META[level];
            const attempted = Object.values(examResults).filter((r: any) =>
              r.examId?.startsWith(level.toLowerCase() + "_")
            ).length;
            return (
              <TouchableOpacity
                key={level}
                style={[s.levelCard, { backgroundColor: t.surface, borderColor: t.border }]}
                onPress={() => push({ screen: "sections", level })}
                activeOpacity={0.7}
              >
                <View style={[s.circle, { backgroundColor: m.color }]}>
                  <Text style={s.circleTxt}>{level}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.cardTitle, { color: t.text }]}>{m.label}</Text>
                  <Text style={[s.cardSub, { color: t.textSecondary }]}>{m.description}</Text>
                  <View style={s.chipRow}>
                    {["4 sections", "30 each", `${attempted} done`].map((c) => (
                      <Text key={c} style={[s.chip, { backgroundColor: t.surfaceAlt, color: t.textMuted }]}>{c}</Text>
                    ))}
                  </View>
                </View>
                <ChevronRight size={20} color={t.textMuted} />
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Sections Screen ────────────────────────────────────────────
  if (nav.screen === "sections") {
    const levelMeta = LEVEL_META[nav.level];
    const SECTION_DURATIONS: Record<Section, Record<Level, string>> = {
      hoeren: { A1: "20 min", A2: "30 min", B1: "40 min" },
      lesen: { A1: "25 min", A2: "25 min", B1: "65 min" },
      schreiben: { A1: "20 min", A2: "30 min", B1: "60 min" },
      sprechen: { A1: "15 min", A2: "15 min", B1: "15 min" },
    };
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.background }}>
        <StatusBar barStyle={t.dark ? "light-content" : "dark-content"} backgroundColor={t.background} />
        <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={s.backRow} onPress={back}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <ChevronLeft size={18} color={t.primary} strokeWidth={2.5} />
              <Text style={[s.backTxt, { color: t.primary }]}>Levels</Text>
            </View>
          </TouchableOpacity>
          <View style={s.centerHeader}>
            <View style={[s.circle, { backgroundColor: levelMeta.color, width: 70, height: 70, borderRadius: 35 }]}>
              <Text style={[s.circleTxt, { fontSize: 24 }]}>{nav.level}</Text>
            </View>
            <Text style={[s.heroTitle, { color: t.text }]}>{levelMeta.label}</Text>
            <Text style={[s.heroSub, { color: t.textSecondary }]}>
              {levelMeta.description} · Pass: {levelMeta.passScore}/100
            </Text>
          </View>
          <Text style={[s.listLabel, { color: t.textMuted }]}>CHOOSE SECTION</Text>
          {SECTIONS.map((sec) => {
            const m = SECTION_META[sec];
            const attempted = Object.values(examResults).filter((r: any) =>
              r.examId?.startsWith(`${nav.level.toLowerCase()}_${sec.charAt(0)}_`) ||
              r.examId?.startsWith(`${nav.level.toLowerCase()}_${sec.substring(0, 2)}_`)
            ).length;
            return (
              <TouchableOpacity
                key={sec}
                style={[s.sectionCard, { backgroundColor: t.surface, borderColor: t.border }]}
                onPress={() => push({ screen: "list", level: nav.level, section: sec })}
                activeOpacity={0.7}
              >
                <View style={[s.iconBox, { backgroundColor: m.color + "20" }]}>
                  <SectionIcon section={sec} size={26} color={m.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.cardTitle, { color: t.text }]}>{m.label}</Text>
                  <Text style={[s.cardSub, { color: t.textSecondary }]}>{m.description}</Text>
                  <View style={s.chipRow}>
                    <View style={[s.chip, { backgroundColor: m.color + "20", flexDirection: "row", alignItems: "center", gap: 3 }]}>
                      <Clock size={10} color={m.color} />
                      <Text style={{ color: m.color, fontSize: 11, fontWeight: "600" }}>{SECTION_DURATIONS[sec][nav.level]}</Text>
                    </View>
                    <Text style={[s.chip, { backgroundColor: m.color + "20", color: m.color }]}>
                      30 exams
                    </Text>
                    {attempted > 0 && (
                      <Text style={[s.chip, { backgroundColor: m.color + "20", color: m.color }]}>
                        {attempted} done
                      </Text>
                    )}
                  </View>
                </View>
                <ChevronRight size={20} color={t.textMuted} />
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Exam List Screen ───────────────────────────────────────────
  if (nav.screen === "list") {
    const exams = getExams(nav.level, nav.section);
    const secMeta = SECTION_META[nav.section];
    const levelMeta = LEVEL_META[nav.level];
    const attempted = exams.filter((e) => getAttemptCount(examResults, e.id) > 0).length;
    const passed = exams.filter((e) => hasEverPassed(examResults, e.id)).length;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.background }}>
        <StatusBar barStyle={t.dark ? "light-content" : "dark-content"} backgroundColor={t.background} />
        <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={s.backRow} onPress={back}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <ChevronLeft size={18} color={t.primary} strokeWidth={2.5} />
              <Text style={[s.backTxt, { color: t.primary }]}>Sections</Text>
            </View>
          </TouchableOpacity>
          <View style={[s.listHeader, {}]}>
            <View style={[s.iconBox, { backgroundColor: secMeta.color + "20" }]}>
              <SectionIcon section={nav.section} size={28} color={secMeta.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.listSectionName, { color: secMeta.color }]}>
                {nav.level} · {secMeta.label}
              </Text>
              <Text style={[s.cardSub, { color: t.textSecondary }]}>{secMeta.description}</Text>
            </View>
          </View>
          {/* Stats */}
          <View style={[s.statsBar, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
            {[
              { num: exams.length, label: "Exams" },
              { num: attempted, label: "Attempted" },
              { num: passed, label: "Passed" },
              { num: levelMeta.passScore, label: "Pass Score", color: levelMeta.color },
            ].map((stat, idx) => (
              <React.Fragment key={stat.label}>
                {idx > 0 && <View style={[s.statDiv, { backgroundColor: t.border }]} />}
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text style={[s.statNum, { color: stat.color || t.text }]}>{stat.num}</Text>
                  <Text style={[s.statLabel, { color: t.textMuted }]}>{stat.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
          {/* Grid */}
          <Text style={[s.listLabel, { color: t.textMuted }]}>30 MOCK EXAMS</Text>
          <View style={s.grid}>
            {exams.map((exam, idx) => {
              const passed = hasEverPassed(examResults, exam.id);
              const count = getAttemptCount(examResults, exam.id);
              const best = getBestScore(examResults, exam.id);
              const tried = count > 0;
              const failedOnly = tried && !passed;
              const numColor = passed ? "#4CAF50" : failedOnly ? "#F44336" : secMeta.color;
              return (
                <TouchableOpacity
                  key={exam.id}
                  style={[
                    s.gridCell,
                    {
                      backgroundColor: t.surface,
                      borderColor: passed ? "#4CAF50" : failedOnly ? "#F44336" : t.border,
                      borderWidth: tried ? 2 : 1,
                    },
                  ]}
                  onPress={() =>
                    push({ screen: "exam", level: nav.level, section: nav.section, examId: exam.id })
                  }
                  activeOpacity={0.7}
                >
                  <Text style={[s.gridNum, { color: numColor }]}>
                    {String(idx + 1).padStart(2, "0")}
                  </Text>
                  {tried ? (
                    <>
                      {best !== null ? (
                        <Text style={[s.gridStatus, { color: numColor }]}>{best}%</Text>
                      ) : (
                        passed
                          ? <Check size={16} color={numColor} strokeWidth={3} />
                          : <X size={16} color={numColor} strokeWidth={3} />
                      )}
                      <Text style={[s.gridNew, { color: t.textMuted }]}>×{count}</Text>
                    </>
                  ) : (
                    <Text style={[s.gridNew, { color: t.textMuted }]}>new</Text>
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

  // ── Exam Runner Screen ─────────────────────────────────────────
  if (nav.screen === "exam") {
    const attempts = examResults[nav.examId] ?? [];
    return (
      <ExamRunner
        level={nav.level}
        section={nav.section}
        examId={nav.examId}
        onBack={back}
        onSaveAttempt={handleSaveAttempt}
        attempts={attempts}
      />
    );
  }

  // ── Analytics Screen ───────────────────────────────────────────
  if (nav.screen === "analytics") {
    return (
      <AnalyticsScreen
        results={examResults}
        onBack={back}
        onViewExamDetail={(examId, level, section) =>
          push({ screen: "exam-detail", examId, level, section })
        }
      />
    );
  }

  // ── Exam Detail Screen ─────────────────────────────────────────
  if (nav.screen === "exam-detail") {
    return (
      <ExamDetailScreen
        examId={nav.examId}
        level={nav.level}
        section={nav.section}
        results={examResults}
        onBack={back}
        onRetake={() =>
          push({ screen: "exam", level: nav.level, section: nav.section, examId: nav.examId })
        }
      />
    );
  }

  return null;
}

// ─── Exam Runner ──────────────────────────────────────────────────
function ExamRunner({
  level,
  section,
  examId,
  onBack,
  onSaveAttempt,
  attempts,
}: {
  level: Level;
  section: Section;
  examId: string;
  onBack: () => void;
  onSaveAttempt: (examId: string, attempt: ExamAttempt) => Promise<void>;
  attempts: ExamAttempt[];
}) {
  const { theme: t } = useTheme();
  const exam = getExamById(level, section, examId);
  const secMeta = SECTION_META[section];
  const lastAttempt = attempts.length > 0 ? attempts[0] : null;

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showAnswers, setShowAnswers] = useState(!!lastAttempt);
  const [submitted, setSubmitted] = useState(!!lastAttempt);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(
    lastAttempt ? { correct: lastAttempt.rawCorrect, total: lastAttempt.rawTotal } : null
  );
  const [currentPart, setCurrentPart] = useState(0);
  const [writingTexts, setWritingTexts] = useState<Record<string, string>>({});
  const [showModel, setShowModel] = useState<Record<string, boolean>>({});

  const handleRetake = () => {
    setAnswers({});
    setShowAnswers(false);
    setSubmitted(false);
    setScore(null);
    setCurrentPart(0);
    setWritingTexts({});
    setShowModel({});
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };
  const scrollRef = React.useRef<ScrollView>(null);
  const ambient = useAmbientAudio();

  if (!exam) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: t.text }}>Exam not found</Text>
        <TouchableOpacity onPress={onBack} style={{ marginTop: 16 }}>
          <Text style={{ color: t.primary }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const calcScore = () => {
    if (section === "schreiben" || section === "sprechen") return { correct: 0, total: 0 };
    let correct = 0, total = 0;
    if (section === "hoeren") {
      const h = exam as HoerenExam;
      for (const p of h.parts) {
        if (p.type === "picture_mcq" || p.type === "mcq") {
          for (const q of p.questions) { total++; if (answers[q.id] === q.correct) correct++; }
        } else if (p.type === "true_false") {
          for (const q of p.questions) { total++; if (answers[q.id] === q.correct) correct++; }
        }
      }
    } else if (section === "lesen") {
      const l = exam as LesenExam;
      for (const p of l.parts) {
        if (p.type === "mcq") {
          for (const q of p.questions) { total++; if (answers[q.id] === q.correct) correct++; }
        } else if (p.type === "fill_gap") {
          for (const [gn, ans] of Object.entries(p.task.answers)) {
            total++;
            if (answers[`gap_${gn}`] === ans) correct++;
          }
        }
      }
    }
    return { correct, total };
  };

  const handleSubmit = async () => {
    const sc = calcScore();
    const pct = sc.total > 0 ? Math.round((sc.correct / sc.total) * 100) : 0;
    setScore(sc);
    setShowAnswers(true);
    setSubmitted(true);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    const attempt: ExamAttempt = {
      date: new Date().toISOString(),
      score: pct,
      rawCorrect: sc.correct,
      rawTotal: sc.total,
      passed: pct >= 60,
    };
    await onSaveAttempt(exam.id, attempt);
  };

  // ── Hören Parts ──────────────────────────────────────────────
  const renderHoeren = () => {
    const h = exam as HoerenExam;
    const parts = h.parts;
    const part = parts[currentPart];
    if (!part) return null;
    const TRACKS: AmbientTrack[] = ["cafe", "street", "neutral"];
    return (
      <View>
        <View style={s.partNav}>
          {parts.map((_, idx) => (
            <TouchableOpacity
              key={idx}
              style={[s.partTab, { backgroundColor: currentPart === idx ? secMeta.color : t.surfaceAlt, borderColor: t.border }]}
              onPress={() => { setCurrentPart(idx); scrollRef.current?.scrollTo({ y: 0, animated: true }); }}
            >
              <Text style={[s.partTabTxt, { color: currentPart === idx ? "#fff" : t.text }]}>Teil {idx + 1}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={[s.partBanner, { backgroundColor: secMeta.color + "15", borderColor: secMeta.color + "40" }]}>
          <Text style={[s.partBannerTitle, { color: secMeta.color }]}>{part.title}</Text>
          <Text style={[s.partBannerPts, { color: t.textMuted }]}>{part.points} Punkte</Text>
        </View>

        {/* ── Ambient Audio Widget ── */}
        <View style={[s.ambientWidget, { backgroundColor: "#5C6BC010", borderColor: "#5C6BC040" }]}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Headphones size={13} color="#5C6BC0" />
              <Text style={[s.ambientTitle, { color: "#5C6BC0" }]}>Hintergrundgeräusche</Text>
            </View>
            <TouchableOpacity
              style={[s.ambientToggle, { backgroundColor: ambient.playing ? "#5C6BC0" : t.surfaceAlt, borderColor: "#5C6BC0", flexDirection: "row", alignItems: "center", gap: 5 }]}
              onPress={ambient.toggle}
              activeOpacity={0.7}
            >
              {ambient.playing
                ? <Square size={10} color="#fff" fill="#fff" />
                : <Play size={10} color="#5C6BC0" fill="#5C6BC0" />}
              <Text style={[s.ambientToggleTxt, { color: ambient.playing ? "#fff" : "#5C6BC0" }]}>
                {ambient.playing ? "Stop" : "Play"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            {TRACKS.map((tr) => (
              <TouchableOpacity
                key={tr}
                style={[s.trackBtn, {
                  backgroundColor: ambient.track === tr ? "#5C6BC020" : "transparent",
                  borderColor: ambient.track === tr ? "#5C6BC0" : t.border,
                }]}
                onPress={() => ambient.setTrack(tr)}
                activeOpacity={0.7}
              >
                <Text style={[s.trackBtnTxt, { color: ambient.track === tr ? "#5C6BC0" : t.textMuted }]}>
                  {AMBIENT_LABELS[tr]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {(part.type === "picture_mcq" || part.type === "mcq") && (() => {
          const mcqPart = part as { type: "picture_mcq" | "mcq"; title: string; points: number; questions: MCQQuestion[] };
          return mcqPart.questions.map((q) => (
            <MCQItem key={q.id} question={q} selectedIndex={answers[q.id] ?? null}
              onSelect={(idx) => setAnswers((p) => ({ ...p, [q.id]: idx }))}
              showAnswer={showAnswers} color={secMeta.color} />
          ));
        })()}
        {part.type === "true_false" && (() => {
          const tfPart = part as { type: "true_false"; title: string; points: number; questions: TrueFalseQuestion[] };
          return tfPart.questions.map((q) => (
            <TFItem key={q.id} question={q} selected={answers[q.id] ?? null}
              onSelect={(v) => setAnswers((p) => ({ ...p, [q.id]: v }))}
              showAnswer={showAnswers} color={secMeta.color} />
          ));
        })()}
        {renderPartNav(parts.length, !submitted, handleSubmit)}
      </View>
    );
  };

  // ── Lesen Parts ──────────────────────────────────────────────
  const renderLesen = () => {
    const l = exam as LesenExam;
    const parts = l.parts;
    const part = parts[currentPart];
    if (!part) return null;
    return (
      <View>
        <View style={s.partNav}>
          {parts.map((_, idx) => (
            <TouchableOpacity key={idx}
              style={[s.partTab, { backgroundColor: currentPart === idx ? secMeta.color : t.surfaceAlt, borderColor: t.border }]}
              onPress={() => { setCurrentPart(idx); scrollRef.current?.scrollTo({ y: 0, animated: true }); }}>
              <Text style={[s.partTabTxt, { color: currentPart === idx ? "#fff" : t.text }]}>Teil {idx + 1}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={[s.partBanner, { backgroundColor: secMeta.color + "15", borderColor: secMeta.color + "40" }]}>
          <Text style={[s.partBannerTitle, { color: secMeta.color }]}>{part.title}</Text>
          <Text style={[s.partBannerPts, { color: t.textMuted }]}>{part.points} Punkte</Text>
        </View>
        {part.type === "matching" && (() => {
          const mp = part as { type: "matching"; title: string; points: number; task: { items: { label: string; content: string }[]; targets: string[]; correctMap: Record<string, string> } };
          return (
            <View>
              <Text style={[s.taskNote, { color: t.textSecondary }]}>Ordnen Sie die Anzeigen den passenden Personen zu.</Text>
              {mp.task.items.map((item) => (
                <View key={item.label} style={[s.matchCard, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
                  <Text style={[s.matchLbl, { color: secMeta.color }]}>{item.label}</Text>
                  <Text style={[s.matchContent, { color: t.text }]}>{item.content}</Text>
                  {showAnswers && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 }}>
                      <Check size={12} color="#4CAF50" strokeWidth={3} />
                      <Text style={s.matchAnswer}>{mp.task.correctMap[item.label]}</Text>
                    </View>
                  )}
                </View>
              ))}
              <Text style={[s.subHdr, { color: t.text }]}>Personen:</Text>
              {mp.task.targets.map((tgt, idx) => (
                <View key={idx} style={[s.targetRow, { borderColor: t.border }]}>
                  <Text style={[s.targetTxt, { color: t.textSecondary }]}>{tgt}</Text>
                </View>
              ))}
            </View>
          );
        })()}
        {part.type === "fill_gap" && (() => {
          const fp = part as { type: "fill_gap"; title: string; points: number; task: { textWithGaps: string; options: Record<string, string[]>; answers: Record<string, string> } };
          return (
            <View>
              <Text style={[s.taskNote, { color: t.textSecondary }]}>Wählen Sie das passende Wort für jede Lücke.</Text>
              <View style={[s.passageBox, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
                <Text style={[s.passageTxt, { color: t.text }]}>{fp.task.textWithGaps}</Text>
              </View>
              {Object.entries(fp.task.options).map(([gn, opts]) => (
                <View key={gn} style={{ marginBottom: 16 }}>
                  <Text style={[s.gapLbl, { color: t.text }]}>Lücke {gn}:</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {opts.map((opt) => {
                      const sel = answers[`gap_${gn}`] === opt;
                      const correct = fp.task.answers[gn] === opt;
                      let bg = t.surfaceAlt, border = t.border, tc = t.text;
                      if (showAnswers) {
                        if (correct) { bg = "#4CAF5020"; border = "#4CAF50"; tc = "#4CAF50"; }
                        else if (sel) { bg = "#F4433620"; border = "#F44336"; tc = "#F44336"; }
                      } else if (sel) { bg = secMeta.color + "20"; border = secMeta.color; tc = secMeta.color; }
                      return (
                        <TouchableOpacity key={opt}
                          style={[s.gapOptBtn, { backgroundColor: bg, borderColor: border }]}
                          onPress={() => !showAnswers && setAnswers((p) => ({ ...p, [`gap_${gn}`]: opt }))}>
                          <Text style={[s.gapOptTxt, { color: tc }]}>{opt}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          );
        })()}
        {part.type === "mcq" && (() => {
          const mp = part as { type: "mcq"; title: string; points: number; passage: string; questions: MCQQuestion[] };
          return (
            <View>
              <View style={[s.passageBox, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
                <Text style={[s.passageTxt, { color: t.text }]}>{mp.passage}</Text>
              </View>
              {mp.questions.map((q) => (
                <MCQItem key={q.id} question={q} selectedIndex={answers[q.id] ?? null}
                  onSelect={(idx) => setAnswers((p) => ({ ...p, [q.id]: idx }))}
                  showAnswer={showAnswers} color={secMeta.color} />
              ))}
            </View>
          );
        })()}
        {renderPartNav(parts.length, !submitted, handleSubmit)}
      </View>
    );
  };

  // ── Schreiben ────────────────────────────────────────────────
  const renderSchreiben = () => {
    const se = exam as SchreibenExam;
    return (
      <View>
        <View style={[s.noticeBanner, { backgroundColor: "#EF6C0015", borderColor: "#EF6C0040" }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <PenLine size={14} color="#EF6C00" />
            <Text style={[s.noticeTitle, { color: "#EF6C00", marginBottom: 0 }]}>Writing Task</Text>
          </View>
          <Text style={[s.noticeText, { color: t.textSecondary }]}>Write your answer, then check the model answer and assessment criteria.</Text>
        </View>
        {se.tasks.map((task, idx) => (
          <View key={task.id} style={[s.writeCard, { borderColor: t.border }]}>
            <View style={[s.writeCardHdr, { backgroundColor: "#EF6C0015" }]}>
              <Text style={[s.writeTaskNum, { color: "#EF6C00" }]}>Aufgabe {idx + 1}</Text>
              <Text style={[s.writeTaskTitle, { color: t.text }]}>{task.title}</Text>
              <Text style={[s.writeTaskPts, { color: t.textMuted }]}>{task.points} Punkte</Text>
            </View>
            <View style={{ padding: 14 }}>
              <View style={[s.promptBox, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
                <Text style={[s.promptLbl, { color: t.textMuted }]}>AUFGABE</Text>
                <Text style={[s.promptTxt, { color: t.text }]}>{task.prompt}</Text>
                {task.wordLimit && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 }}>
                    <AlignLeft size={12} color="#EF6C00" />
                    <Text style={[s.wordLimitTxt, { color: "#EF6C00", marginTop: 0 }]}>{task.wordLimit}</Text>
                  </View>
                )}
              </View>
              {task.type === "form" && task.fields ? (
                task.fields.map((f) => (
                  <View key={f.label} style={{ marginBottom: 8 }}>
                    <Text style={[s.fieldLbl, { color: t.textSecondary }]}>{f.label}</Text>
                    <TextInput
                      style={[s.fieldInput, { backgroundColor: t.surfaceAlt, borderColor: t.border, color: t.text }]}
                      placeholder={f.placeholder} placeholderTextColor={t.textMuted}
                      value={writingTexts[`${task.id}_${f.label}`] || ""}
                      onChangeText={(v) => setWritingTexts((p) => ({ ...p, [`${task.id}_${f.label}`]: v }))}
                      editable={!submitted}
                    />
                  </View>
                ))
              ) : (
                <TextInput
                  style={[s.writingInput, { backgroundColor: t.surfaceAlt, borderColor: t.border, color: t.text }]}
                  placeholder="Schreiben Sie hier..." placeholderTextColor={t.textMuted}
                  multiline textAlignVertical="top"
                  value={writingTexts[task.id] || ""}
                  onChangeText={(v) => setWritingTexts((p) => ({ ...p, [task.id]: v }))}
                  editable={!submitted}
                />
              )}
              {writingTexts[task.id] && (
                <Text style={[s.wordCount, { color: t.textMuted }]}>
                  {writingTexts[task.id].split(/\s+/).filter(Boolean).length} Wörter
                </Text>
              )}
              {submitted && (
                <>
                  <TouchableOpacity
                    style={[s.modelBtn, { borderColor: "#EF6C00" }]}
                    onPress={() => setShowModel((p) => ({ ...p, [task.id]: !p[task.id] }))}>
                    <Text style={[s.modelBtnTxt, { color: "#EF6C00" }]}>
                      {showModel[task.id] ? "▲ Hide" : "▼ Show"} Model Answer
                    </Text>
                  </TouchableOpacity>
                  {showModel[task.id] && (
                    <View>
                      <View style={[s.modelAnswerBox, { backgroundColor: "#4CAF5010", borderColor: "#4CAF5040" }]}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 6 }}>
                          <Check size={12} color="#4CAF50" strokeWidth={3} />
                          <Text style={[s.modelAnswerLbl, { color: "#4CAF50", marginBottom: 0 }]}>Musterlösung</Text>
                        </View>
                        <Text style={[s.modelAnswerTxt, { color: t.text }]}>{task.modelAnswer}</Text>
                      </View>
                      <View style={[s.criteriaBox, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
                        <Text style={[s.criteriaLbl, { color: t.textMuted }]}>BEWERTUNGSKRITERIEN</Text>
                        {task.assessmentCriteria.map((c, ci) => (
                          <Text key={ci} style={[s.criteriaItem, { color: t.textSecondary }]}>• {c}</Text>
                        ))}
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        ))}
        {!submitted && (
          <TouchableOpacity
            style={[s.submitBtn, { backgroundColor: "#4CAF50" }]}
            onPress={async () => {
              setSubmitted(true);
              await onSaveAttempt(exam.id, { date: new Date().toISOString(), score: 0, rawCorrect: 0, rawTotal: 0, passed: false });
            }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={s.submitBtnTxt}>Submit & See Model Answers</Text>
              <Check size={15} color="#fff" strokeWidth={3} />
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // ── Sprechen ─────────────────────────────────────────────────
  const renderSprechen = () => {
    const sp = exam as SprechenExam;
    const parts = sp.parts;
    const part = parts[currentPart];
    if (!part) return null;
    return (
      <View>
        <View style={s.partNav}>
          {parts.map((_, idx) => (
            <TouchableOpacity key={idx}
              style={[s.partTab, { backgroundColor: currentPart === idx ? secMeta.color : t.surfaceAlt, borderColor: t.border }]}
              onPress={() => { setCurrentPart(idx); scrollRef.current?.scrollTo({ y: 0, animated: true }); }}>
              <Text style={[s.partTabTxt, { color: currentPart === idx ? "#fff" : t.text }]}>Teil {idx + 1}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={[s.partBanner, { backgroundColor: secMeta.color + "15", borderColor: secMeta.color + "40" }]}>
          <Text style={[s.partBannerTitle, { color: secMeta.color }]}>{part.title}</Text>
          <Text style={[s.partBannerPts, { color: t.textMuted }]}>{part.points} Punkte</Text>
        </View>
        <View style={[s.noticeBanner, { backgroundColor: "#AD145715", borderColor: "#AD145740" }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <Mic size={14} color="#AD1457" />
            <Text style={[s.noticeTitle, { color: "#AD1457", marginBottom: 0 }]}>Speaking Practice</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
            <Text style={[s.noticeText, { color: t.textSecondary }]}>Tap </Text>
            <Volume2 size={12} color={t.textSecondary} />
            <Text style={[s.noticeText, { color: t.textSecondary }]}> on any prompt to hear it in German. Then practice speaking aloud.</Text>
          </View>
        </View>

        {part.type === "self_intro" && (
          <View>
            <Text style={[s.taskNote, { color: t.textSecondary }]}>Stellen Sie sich vor:</Text>
            {part.prompts.map((p, idx) => (
              <View key={idx} style={[s.promptCard, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
                <Text style={[s.promptCardNum, { color: secMeta.color }]}>{idx + 1}</Text>
                <Text style={[s.promptCardTxt, { color: t.text }]}>{p}</Text>
                <TTSButton text={p} color={secMeta.color} />
              </View>
            ))}
          </View>
        )}

        {part.type === "question_cards" && (
          <View>
            {part.cards.map((card, idx) => (
              <View key={idx} style={[s.sprechCard, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
                  <Text style={[s.sprechQ, { color: t.text, flex: 1 }]}>{card.question}</Text>
                  <TTSButton text={card.question} color={secMeta.color} />
                </View>
                <TouchableOpacity style={[s.sampleBtn, { borderColor: secMeta.color }]}
                  onPress={() => setShowModel((p) => ({ ...p, [`qc_${idx}`]: !p[`qc_${idx}`] }))}>
                  <Text style={[s.sampleBtnTxt, { color: secMeta.color }]}>
                    {showModel[`qc_${idx}`] ? "▲ Hide" : "▼ Sample Answer"}
                  </Text>
                </TouchableOpacity>
                {showModel[`qc_${idx}`] && (
                  <View style={[s.sampleBox, { backgroundColor: secMeta.color + "10", borderColor: secMeta.color + "30" }]}>
                    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                      <Text style={[s.sampleTxt, { color: t.text, flex: 1 }]}>{card.sampleAnswer}</Text>
                      <TTSButton text={card.sampleAnswer} color={secMeta.color} />
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {part.type === "picture_description" && (
          <View>
            <View style={[s.hintBox, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 }}>
                <ImageIcon size={11} color={t.textMuted} />
                <Text style={[s.hintLabel, { color: t.textMuted }]}>Bild zeigt:</Text>
              </View>
              <Text style={[s.hintText, { color: t.text }]}>{part.imageDescription}</Text>
            </View>
            {part.prompts.map((p, idx) => (
              <View key={idx} style={[s.promptCard, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
                <Text style={[s.promptCardNum, { color: secMeta.color }]}>Q{idx + 1}</Text>
                <Text style={[s.promptCardTxt, { color: t.text }]}>{p}</Text>
                <TTSButton text={p} color={secMeta.color} />
              </View>
            ))}
            <TouchableOpacity style={[s.sampleBtn, { borderColor: secMeta.color, marginTop: 8 }]}
              onPress={() => setShowModel((p) => ({ ...p, pic: !p["pic"] }))}>
              <Text style={[s.sampleBtnTxt, { color: secMeta.color }]}>
                {showModel["pic"] ? "▲ Hide" : "▼ Sample Answer"}
              </Text>
            </TouchableOpacity>
            {showModel["pic"] && (
              <View style={[s.sampleBox, { backgroundColor: secMeta.color + "10", borderColor: secMeta.color + "30" }]}>
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                  <Text style={[s.sampleTxt, { color: t.text, flex: 1 }]}>{part.sampleAnswer}</Text>
                  <TTSButton text={part.sampleAnswer} color={secMeta.color} />
                </View>
              </View>
            )}
          </View>
        )}

        {part.type === "role_play" && (
          <View>
            <View style={[s.scenarioBox, { backgroundColor: secMeta.color + "15", borderColor: secMeta.color + "40" }]}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.scenarioLbl, { color: secMeta.color }]}>SZENARIO</Text>
                  <Text style={[s.scenarioTxt, { color: t.text }]}>{part.scenario}</Text>
                </View>
                <TTSButton text={part.scenario} color={secMeta.color} />
              </View>
            </View>
            {part.sampleLines.map((line, idx) => (
              <View key={idx} style={[s.sampleLineRow, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
                <MessageSquare size={16} color={secMeta.color} />
                <Text style={[s.sampleLineTxt, { color: t.text, flex: 1 }]}>{line}</Text>
                <TTSButton text={line} color={secMeta.color} />
              </View>
            ))}
          </View>
        )}

        {part.type === "topic_presentation" && (
          <View>
            <View style={[s.scenarioBox, { backgroundColor: secMeta.color + "15", borderColor: secMeta.color + "40" }]}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.scenarioLbl, { color: secMeta.color }]}>THEMA</Text>
                  <Text style={[s.scenarioTxt, { color: t.text }]}>{part.topic}</Text>
                </View>
                <TTSButton text={part.topic} color={secMeta.color} />
              </View>
            </View>
            {part.outline.map((item, idx) => (
              <View key={idx} style={[s.outlineRow, { borderColor: t.border }]}>
                <Text style={[s.outlineNum, { color: secMeta.color }]}>{idx + 1}.</Text>
                <Text style={[s.outlineTxt, { color: t.text, flex: 1 }]}>{item}</Text>
                <TTSButton text={item} color={secMeta.color} />
              </View>
            ))}
            <TouchableOpacity style={[s.sampleBtn, { borderColor: secMeta.color, marginTop: 12 }]}
              onPress={() => setShowModel((p) => ({ ...p, pres: !p["pres"] }))}>
              <Text style={[s.sampleBtnTxt, { color: secMeta.color }]}>
                {showModel["pres"] ? "▲ Hide" : "▼ Sample Presentation"}
              </Text>
            </TouchableOpacity>
            {showModel["pres"] && (
              <View style={[s.sampleBox, { backgroundColor: secMeta.color + "10", borderColor: secMeta.color + "30" }]}>
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                  <Text style={[s.sampleTxt, { color: t.text, flex: 1 }]}>{part.sampleAnswer}</Text>
                  <TTSButton text={part.sampleAnswer} color={secMeta.color} />
                </View>
              </View>
            )}
          </View>
        )}

        {part.type === "discussion" && (
          <View>
            <View style={[s.scenarioBox, { backgroundColor: secMeta.color + "15", borderColor: secMeta.color + "40" }]}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.scenarioLbl, { color: secMeta.color }]}>DISKUSSION</Text>
                  <Text style={[s.scenarioTxt, { color: t.text }]}>{part.topic}</Text>
                </View>
                <TTSButton text={part.topic} color={secMeta.color} />
              </View>
            </View>
            {part.prompts.map((p, idx) => (
              <View key={idx} style={[s.promptCard, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
                <Text style={[s.promptCardNum, { color: secMeta.color }]}>•</Text>
                <Text style={[s.promptCardTxt, { color: t.text }]}>{p}</Text>
                <TTSButton text={p} color={secMeta.color} />
              </View>
            ))}
            <TouchableOpacity style={[s.sampleBtn, { borderColor: secMeta.color, marginTop: 8 }]}
              onPress={() => setShowModel((p) => ({ ...p, disc: !p["disc"] }))}>
              <Text style={[s.sampleBtnTxt, { color: secMeta.color }]}>
                {showModel["disc"] ? "▲ Hide" : "▼ Sample Response"}
              </Text>
            </TouchableOpacity>
            {showModel["disc"] && (
              <View style={[s.sampleBox, { backgroundColor: secMeta.color + "10", borderColor: secMeta.color + "30" }]}>
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                  <Text style={[s.sampleTxt, { color: t.text, flex: 1 }]}>{part.sampleAnswer}</Text>
                  <TTSButton text={part.sampleAnswer} color={secMeta.color} />
                </View>
              </View>
            )}
          </View>
        )}

        {part.type === "planning" && (
          <View>
            <View style={[s.scenarioBox, { backgroundColor: secMeta.color + "15", borderColor: secMeta.color + "40" }]}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.scenarioLbl, { color: secMeta.color }]}>PLANUNG</Text>
                  <Text style={[s.scenarioTxt, { color: t.text }]}>{part.scenario}</Text>
                </View>
                <TTSButton text={part.scenario} color={secMeta.color} />
              </View>
            </View>
            {part.suggestions.map((sg, idx) => (
              <View key={idx} style={[s.promptCard, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
                <Text style={[s.promptCardNum, { color: secMeta.color }]}>{idx + 1}</Text>
                <Text style={[s.promptCardTxt, { color: t.text }]}>{sg}</Text>
                <TTSButton text={sg} color={secMeta.color} />
              </View>
            ))}
            <TouchableOpacity style={[s.sampleBtn, { borderColor: secMeta.color, marginTop: 8 }]}
              onPress={() => setShowModel((p) => ({ ...p, plan: !p["plan"] }))}>
              <Text style={[s.sampleBtnTxt, { color: secMeta.color }]}>
                {showModel["plan"] ? "▲ Hide" : "▼ Sample Language"}
              </Text>
            </TouchableOpacity>
            {showModel["plan"] && (
              <View style={[s.sampleBox, { backgroundColor: secMeta.color + "10", borderColor: secMeta.color + "30" }]}>
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                  <Text style={[s.sampleTxt, { color: t.text, flex: 1 }]}>{part.sampleAnswer}</Text>
                  <TTSButton text={part.sampleAnswer} color={secMeta.color} />
                </View>
              </View>
            )}
          </View>
        )}

        {renderPartNav(
          parts.length,
          !submitted,
          async () => {
            setSubmitted(true);
            await onSaveAttempt(exam.id, { date: new Date().toISOString(), score: 0, rawCorrect: 0, rawTotal: 0, passed: true });
          },
          "Complete Practice"
        )}
      </View>
    );
  };

  const renderPartNav = (
    total: number,
    canSubmit: boolean,
    onSubmit: () => void,
    submitLabel = "Submit Exam"
  ) => (
    <View style={s.partNavBtns}>
      {currentPart > 0 && (
        <TouchableOpacity
          style={[s.navBtn, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}
          onPress={() => { setCurrentPart(currentPart - 1); scrollRef.current?.scrollTo({ y: 0, animated: true }); }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <ChevronLeft size={16} color={t.text} strokeWidth={2.5} />
            <Text style={[s.navBtnTxt, { color: t.text }]}>Previous</Text>
          </View>
        </TouchableOpacity>
      )}
      {currentPart < total - 1 ? (
        <TouchableOpacity
          style={[s.navBtn, { backgroundColor: secMeta.color, flex: 1 }]}
          onPress={() => { setCurrentPart(currentPart + 1); scrollRef.current?.scrollTo({ y: 0, animated: true }); }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={[s.navBtnTxt, { color: "#fff" }]}>Next Part</Text>
            <ChevronRight size={16} color="#fff" strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
      ) : canSubmit ? (
        <TouchableOpacity
          style={[s.navBtn, { backgroundColor: "#4CAF50", flex: 1 }]}
          onPress={onSubmit}>
          <Text style={[s.navBtnTxt, { color: "#fff" }]}>{submitLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  // ── Result Banner ────────────────────────────────────────────
  const renderResult = () => {
    if (!submitted) return null;
    if (section === "sprechen") {
      return (
        <View style={[s.resultBanner, { backgroundColor: "#4CAF5015", borderColor: "#4CAF5040" }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <CheckCircle2 size={20} color="#4CAF50" />
            <Text style={[s.resultTitle, { color: "#4CAF50", marginBottom: 0 }]}>Practice Complete!</Text>
          </View>
          <Text style={[s.resultBody, { color: t.textSecondary }]}>
            Great work! In the real exam an examiner evaluates fluency, grammar, pronunciation and communication.
          </Text>
          <View style={s.resultBtnRow}>
            <TouchableOpacity style={[s.retakeBtn, { borderColor: "#4CAF50", flexDirection: "row", alignItems: "center", gap: 5 }]} onPress={handleRetake}>
              <RotateCcw size={14} color="#4CAF50" />
              <Text style={[s.retakeBtnTxt, { color: "#4CAF50" }]}>Practice Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.backListBtn, { backgroundColor: "#4CAF50", flex: 1 }]} onPress={onBack}>
              <Text style={s.backListBtnTxt}>Back to List</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    if (section === "schreiben") {
      return (
        <View style={[s.resultBanner, { backgroundColor: "#EF6C0015", borderColor: "#EF6C0040" }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <CheckCircle2 size={20} color="#EF6C00" />
            <Text style={[s.resultTitle, { color: "#EF6C00", marginBottom: 0 }]}>Submitted!</Text>
          </View>
          <Text style={[s.resultBody, { color: t.textSecondary }]}>
            Compare with the model answer using the assessment criteria below.
          </Text>
          <View style={s.resultBtnRow}>
            <TouchableOpacity style={[s.retakeBtn, { borderColor: "#EF6C00", flexDirection: "row", alignItems: "center", gap: 5 }]} onPress={handleRetake}>
              <RotateCcw size={14} color="#EF6C00" />
              <Text style={[s.retakeBtnTxt, { color: "#EF6C00" }]}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.backListBtn, { backgroundColor: "#EF6C00", flex: 1 }]} onPress={onBack}>
              <Text style={s.backListBtnTxt}>Back to List</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    if (!score) return null;
    const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    const passed = pct >= 60;
    const accentColor = passed ? "#4CAF50" : "#F44336";
    return (
      <View style={[s.resultBanner, { backgroundColor: passed ? "#4CAF5015" : "#F4433615", borderColor: passed ? "#4CAF5040" : "#F4433640" }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
          {passed
            ? <CheckCircle2 size={20} color={accentColor} />
            : <XCircle size={20} color={accentColor} />}
          <Text style={[s.resultTitle, { color: accentColor, marginBottom: 0 }]}>
            {passed ? "Bestanden!" : "Nicht bestanden"}
          </Text>
        </View>
        <Text style={[s.resultScoreTxt, { color: accentColor }]}>
          {score.correct}/{score.total} · {pct}%
        </Text>
        <Text style={[s.resultBody, { color: t.textSecondary }]}>
          {passed ? "Correct answers are highlighted in green." : "Review the correct answers in green and try again."}
        </Text>
        <View style={s.resultBtnRow}>
          <TouchableOpacity style={[s.retakeBtn, { borderColor: accentColor, flexDirection: "row", alignItems: "center", gap: 5 }]} onPress={handleRetake}>
            <RotateCcw size={14} color={accentColor} />
            <Text style={[s.retakeBtnTxt, { color: accentColor }]}>Retake Exam</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.backListBtn, { backgroundColor: accentColor, flex: 1 }]} onPress={onBack}>
            <Text style={s.backListBtnTxt}>Back to List</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }}>
      <StatusBar barStyle={t.dark ? "light-content" : "dark-content"} backgroundColor={t.background} />
      {/* Top Bar */}
      <View style={[s.topBar, { backgroundColor: t.surface, borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={onBack} style={{ padding: 4 }}>
          <ChevronLeft size={24} color={t.primary} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={[s.topTitle, { color: t.text }]}>{exam.title}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <SectionIcon section={section} size={12} color={t.textMuted} />
            <Text style={[s.topSub, { color: t.textMuted }]}>{level} · {secMeta.label} · {exam.durationMinutes} min</Text>
          </View>
        </View>
        <View style={[s.topBadge, { backgroundColor: secMeta.color + "20" }]}>
          <Text style={[s.topBadgeTxt, { color: secMeta.color }]}>{exam.totalPoints}pt</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderResult()}
        {!submitted && (
          <View style={[s.instrBox, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
            <Text style={[s.instrTxt, { color: t.textSecondary }]}>{exam.instructions}</Text>
          </View>
        )}
        {section === "hoeren" && renderHoeren()}
        {section === "lesen" && renderLesen()}
        {section === "schreiben" && renderSchreiben()}
        {section === "sprechen" && renderSprechen()}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────
const s = StyleSheet.create({
  analyticsBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  analyticsBtnTxt: { fontSize: 13, fontWeight: "600" },
  page: { padding: 20 },
  centerHeader: { alignItems: "center", marginBottom: 24, paddingTop: 8 },
  bigEmoji: { fontSize: 56, marginBottom: 12 },
  heroTitle: { fontSize: 24, fontWeight: "800", textAlign: "center" },
  heroSub: { fontSize: 14, textAlign: "center", marginTop: 6, lineHeight: 20, paddingHorizontal: 12 },
  infoBanner: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 24 },
  infoTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  infoText: { fontSize: 13, lineHeight: 20 },
  listLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 12 },
  backRow: { marginBottom: 16 },
  backTxt: { fontSize: 16, fontWeight: "600" },
  levelCard: { flexDirection: "row", alignItems: "center", borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12, gap: 14 },
  circle: { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center" },
  circleTxt: { color: "#fff", fontSize: 18, fontWeight: "800" },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  cardSub: { fontSize: 13, marginBottom: 6 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { fontSize: 11, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, fontWeight: "600" },
  sectionCard: { flexDirection: "row", alignItems: "center", borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12, gap: 14 },
  iconBox: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  listHeader: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 20 },
  listSectionName: { fontSize: 18, fontWeight: "800" },
  statsBar: { flexDirection: "row", borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 24 },
  statNum: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, marginTop: 2, fontWeight: "600" },
  statDiv: { width: 1, marginHorizontal: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  gridCell: { width: "30%", aspectRatio: 1, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  gridNum: { fontSize: 18, fontWeight: "800" },
  gridStatus: { fontSize: 16, fontWeight: "700", marginTop: 2 },
  gridNew: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, gap: 8 },
  topTitle: { fontSize: 15, fontWeight: "700" },
  topSub: { fontSize: 12, marginTop: 1 },
  topBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  topBadgeTxt: { fontSize: 13, fontWeight: "700" },
  instrBox: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 20 },
  instrTxt: { fontSize: 13, lineHeight: 20 },
  partNav: { flexDirection: "row", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  partTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  partTabTxt: { fontSize: 13, fontWeight: "600" },
  partBanner: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  partBannerTitle: { fontSize: 15, fontWeight: "700", flex: 1 },
  partBannerPts: { fontSize: 13, fontWeight: "600" },
  noticeBanner: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 20 },
  noticeTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  noticeText: { fontSize: 13, lineHeight: 19 },
  partNavBtns: { flexDirection: "row", gap: 10, marginTop: 24 },
  navBtn: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 14, alignItems: "center" },
  navBtnTxt: { fontSize: 15, fontWeight: "700" },
  questionText: { fontSize: 15, fontWeight: "600", marginBottom: 10, lineHeight: 22 },
  hintBox: { borderRadius: 10, borderWidth: 1, padding: 10, marginBottom: 10 },
  hintLabel: { fontSize: 11, fontWeight: "700", marginBottom: 2 },
  hintText: { fontSize: 13, lineHeight: 18 },
  option: { flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1.5, padding: 12, marginBottom: 8, gap: 10 },
  optLetter: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  optLetterTxt: { fontSize: 13, fontWeight: "700" },
  optText: { fontSize: 14, lineHeight: 20 },
  tfBtn: { borderWidth: 1.5, borderRadius: 10, padding: 14, alignItems: "center" },
  tfBtnTxt: { fontSize: 15, fontWeight: "700" },
  taskNote: { fontSize: 13, lineHeight: 20, marginBottom: 12 },
  matchCard: { borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 8 },
  matchLbl: { fontSize: 12, fontWeight: "700", marginBottom: 4 },
  matchContent: { fontSize: 14, lineHeight: 20 },
  matchAnswer: { fontSize: 13, fontWeight: "600", color: "#4CAF50" },
  targetRow: { borderBottomWidth: 1, paddingVertical: 10 },
  targetTxt: { fontSize: 13, lineHeight: 18 },
  subHdr: { fontSize: 14, fontWeight: "700", marginTop: 16, marginBottom: 8 },
  passageBox: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 16 },
  passageTxt: { fontSize: 14, lineHeight: 22 },
  gapLbl: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
  gapOptBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  gapOptTxt: { fontSize: 14, fontWeight: "600" },
  writeCard: { borderRadius: 16, borderWidth: 1, marginBottom: 20, overflow: "hidden" },
  writeCardHdr: { padding: 14 },
  writeTaskNum: { fontSize: 12, fontWeight: "700", marginBottom: 2 },
  writeTaskTitle: { fontSize: 16, fontWeight: "700" },
  writeTaskPts: { fontSize: 12, marginTop: 2 },
  promptBox: { borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 12 },
  promptLbl: { fontSize: 11, fontWeight: "700", marginBottom: 6, letterSpacing: 0.5 },
  promptTxt: { fontSize: 14, lineHeight: 21 },
  wordLimitTxt: { fontSize: 12, marginTop: 8, fontWeight: "600" },
  fieldLbl: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  fieldInput: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14 },
  writingInput: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, minHeight: 140, lineHeight: 22 },
  wordCount: { fontSize: 12, textAlign: "right", marginTop: 6 },
  modelBtn: { borderWidth: 1.5, borderRadius: 10, padding: 12, alignItems: "center", marginTop: 12 },
  modelBtnTxt: { fontSize: 14, fontWeight: "700" },
  modelAnswerBox: { borderRadius: 10, borderWidth: 1, padding: 14, marginTop: 10 },
  modelAnswerLbl: { fontSize: 12, fontWeight: "700", marginBottom: 6 },
  modelAnswerTxt: { fontSize: 14, lineHeight: 22 },
  criteriaBox: { borderRadius: 10, borderWidth: 1, padding: 12, marginTop: 8 },
  criteriaLbl: { fontSize: 11, fontWeight: "700", marginBottom: 8, letterSpacing: 0.5 },
  criteriaItem: { fontSize: 13, lineHeight: 22 },
  submitBtn: { borderRadius: 12, padding: 14, alignItems: "center", marginTop: 8 },
  submitBtnTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
  promptCard: { flexDirection: "row", borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 8, gap: 10, alignItems: "flex-start" },
  promptCardNum: { fontSize: 15, fontWeight: "800", width: 22 },
  promptCardTxt: { flex: 1, fontSize: 14, lineHeight: 21 },
  sprechCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 12 },
  sprechQ: { fontSize: 15, fontWeight: "600", lineHeight: 22, marginBottom: 10 },
  sampleBtn: { borderWidth: 1.5, borderRadius: 10, padding: 10, alignItems: "center" },
  sampleBtnTxt: { fontSize: 13, fontWeight: "700" },
  sampleBox: { borderRadius: 10, borderWidth: 1, padding: 12, marginTop: 10 },
  sampleTxt: { fontSize: 14, lineHeight: 22 },
  scenarioBox: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 16 },
  scenarioLbl: { fontSize: 11, fontWeight: "700", marginBottom: 4, letterSpacing: 0.5 },
  scenarioTxt: { fontSize: 15, lineHeight: 23, fontWeight: "500" },
  sampleLineRow: { flexDirection: "row", borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 8, gap: 10, alignItems: "flex-start" },
  sampleLineTxt: { flex: 1, fontSize: 14, lineHeight: 21 },
  outlineRow: { flexDirection: "row", borderBottomWidth: 1, paddingVertical: 10, gap: 10 },
  outlineNum: { fontSize: 15, fontWeight: "800", width: 22 },
  outlineTxt: { flex: 1, fontSize: 14, lineHeight: 21 },
  resultBanner: { borderRadius: 16, borderWidth: 1, padding: 20, marginBottom: 20 },
  resultTitle: { fontSize: 20, fontWeight: "800", marginBottom: 6 },
  resultScoreTxt: { fontSize: 28, fontWeight: "800", marginBottom: 8 },
  resultBody: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  resultBtnRow: { flexDirection: "row", gap: 10, marginTop: 12, alignItems: "center" },
  retakeBtn: { borderRadius: 12, paddingVertical: 14, paddingHorizontal: 18, alignItems: "center", borderWidth: 1.5 },
  retakeBtnTxt: { fontWeight: "700", fontSize: 14 },
  backListBtn: { borderRadius: 12, padding: 14, alignItems: "center" },
  backListBtnTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
  // Hero icon
  heroIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#4F46E5", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  // TTS button
  ttsBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, alignSelf: "flex-start" },
  ttsBtnTxt: { fontSize: 12, fontWeight: "700" },
  // Image
  imageContainer: { borderRadius: 12, borderWidth: 1, overflow: "hidden", marginBottom: 12 },
  examImage: { width: "100%", height: 160 },
  imageCaption: { fontSize: 11, paddingHorizontal: 10, paddingVertical: 5 },
  // Ambient audio widget
  ambientWidget: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 16 },
  ambientTitle: { fontSize: 13, fontWeight: "700" },
  ambientToggle: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  ambientToggleTxt: { fontSize: 12, fontWeight: "700" },
  trackBtn: { borderRadius: 8, borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 5 },
  trackBtnTxt: { fontSize: 12, fontWeight: "600" },
});
