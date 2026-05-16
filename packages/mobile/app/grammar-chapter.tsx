import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  AlertTriangle,
  Dumbbell,
  MessageSquare,
  BookOpen,
  FileText,
  CheckCircle2,
  Circle,
  Check,
  Bot,
  Copy,
  CheckCheck,
  Lock,
  Trophy,
  Star,
  X,
} from "lucide-react-native";
import { useTheme } from "../lib/theme";
import { GRAMMAR_CHAPTERS, A2_GRAMMAR_CHAPTERS, B1_GRAMMAR_CHAPTERS, type GrammarTable } from "../lib/grammarData";

const ALL_CHAPTERS = [...GRAMMAR_CHAPTERS, ...A2_GRAMMAR_CHAPTERS, ...B1_GRAMMAR_CHAPTERS];
import {
  recordChapterVisit,
  toggleChapterComplete,
  loadGrammarProgress,
  loadPracticeProgress,
  recordLevelAttempt,
  getLevelState,
  type PracticeProgress,
  type LevelResult,
} from "../lib/grammarProgress";
import { PRACTICE_DATA, type MCQQuestion } from "../lib/grammarPracticeData";

const GRAMMAR_COLOR = "#A855F7";

// ─── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <View style={sh.row}>
      <Icon size={15} color={color} strokeWidth={2.5} />
      <Text style={[sh.label, { color }]}>{label}</Text>
    </View>
  );
}
const sh = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  label: { fontSize: 12, fontWeight: "800", letterSpacing: 1 },
});

// ─── Card wrapper ──────────────────────────────────────────────────────────────
function Card({ children, t }: { children: React.ReactNode; t: any }) {
  return (
    <View style={[card.wrap, { backgroundColor: t.surface, borderColor: t.border }]}>
      {children}
    </View>
  );
}
const card = StyleSheet.create({
  wrap: { borderRadius: 16, borderWidth: 1.5, padding: 16, marginBottom: 14 },
});

// ─── Grammar Table ─────────────────────────────────────────────────────────────
function GrammarTableView({ table, t }: { table: GrammarTable; t: any }) {
  return (
    <View style={[tbl.wrap, { borderColor: t.border }]}>
      <View style={[tbl.row, tbl.headerRow, { backgroundColor: GRAMMAR_COLOR + "18" }]}>
        {table.headers.map((h, i) => (
          <Text key={i} style={[tbl.headerCell, { color: GRAMMAR_COLOR, flex: i === 0 ? 0.9 : 1 }]}>
            {h}
          </Text>
        ))}
      </View>
      {table.rows.map((row, ri) => (
        <View
          key={ri}
          style={[
            tbl.row,
            ri % 2 === 0 ? { backgroundColor: t.surface } : { backgroundColor: t.background },
            ri === table.rows.length - 1 && tbl.lastRow,
          ]}
        >
          {row.map((cell, ci) => (
            <Text
              key={ci}
              style={[
                tbl.cell,
                ci === 0 && tbl.firstCell,
                { color: ci === 0 ? t.text : t.textMuted, flex: ci === 0 ? 0.9 : 1 },
              ]}
            >
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}
const tbl = StyleSheet.create({
  wrap: { borderRadius: 12, borderWidth: 1.5, overflow: "hidden", marginTop: 12 },
  row: { flexDirection: "row", alignItems: "center", minHeight: 38 },
  headerRow: { minHeight: 34 },
  lastRow: { borderBottomWidth: 0 },
  headerCell: { fontSize: 11, fontWeight: "900", letterSpacing: 0.6, paddingHorizontal: 10, paddingVertical: 8 },
  cell: { fontSize: 12, fontWeight: "600", paddingHorizontal: 10, paddingVertical: 9, lineHeight: 17 },
  firstCell: { fontWeight: "800" },
});

// ─── Exercise item ─────────────────────────────────────────────────────────────
function ExerciseItem({ index, prompt, answer, t }: { index: number; prompt: string; answer: string; t: any }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <View style={[ex.wrap, { borderColor: t.border }]}>
      <View style={ex.top}>
        <View style={[ex.num, { backgroundColor: GRAMMAR_COLOR + "20" }]}>
          <Text style={[ex.numTxt, { color: GRAMMAR_COLOR }]}>{index + 1}</Text>
        </View>
        <Text style={[ex.prompt, { color: t.text }]}>{prompt}</Text>
      </View>
      <TouchableOpacity
        onPress={() => setRevealed(!revealed)}
        style={[ex.ansBtn, { backgroundColor: revealed ? GRAMMAR_COLOR + "18" : t.surfaceAlt }]}
        activeOpacity={0.8}
      >
        {revealed
          ? <CheckCircle2 size={14} color={GRAMMAR_COLOR} strokeWidth={2.5} />
          : <Circle size={14} color={t.textMuted} strokeWidth={2} />}
        <Text style={[ex.ansBtnTxt, { color: revealed ? GRAMMAR_COLOR : t.textMuted }]}>
          {revealed ? answer : "Reveal answer"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
const ex = StyleSheet.create({
  wrap: { borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 12 },
  top: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginBottom: 8 },
  num: { width: 24, height: 24, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  numTxt: { fontSize: 11, fontWeight: "900" },
  prompt: { flex: 1, fontSize: 14, fontWeight: "600", lineHeight: 20 },
  ansBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  ansBtnTxt: { fontSize: 13, fontWeight: "700" },
});

// ─── AI Prompt Card ───────────────────────────────────────────────────────────
function AIPromptCard({ prompt, t }: { prompt: string; t: any }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={[aip.wrap, { backgroundColor: "#1a1040", borderColor: GRAMMAR_COLOR + "50" }]}>
      {/* Header */}
      <View style={aip.header}>
        <View style={[aip.iconWrap, { backgroundColor: GRAMMAR_COLOR + "20" }]}>
          <Bot size={18} color={GRAMMAR_COLOR} strokeWidth={2.5} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[aip.title, { color: "#fff" }]}>AI Practice Prompt</Text>
          <Text style={[aip.sub, { color: GRAMMAR_COLOR + "cc" }]}>Copy into ChatGPT for a live drill session</Text>
        </View>
      </View>

      {/* Prompt preview */}
      <TouchableOpacity
        onPress={() => setExpanded(v => !v)}
        activeOpacity={0.8}
        style={[aip.previewBox, { backgroundColor: GRAMMAR_COLOR + "10", borderColor: GRAMMAR_COLOR + "25" }]}
      >
        <Text style={[aip.previewText, { color: "#d1c4e9" }]} numberOfLines={expanded ? undefined : 3}>
          {prompt}
        </Text>
        <Text style={[aip.expandTxt, { color: GRAMMAR_COLOR }]}>
          {expanded ? "Show less ↑" : "Show more ↓"}
        </Text>
      </TouchableOpacity>

      {/* Copy button */}
      <TouchableOpacity
        style={[aip.copyBtn, { backgroundColor: copied ? "#22C55E" : GRAMMAR_COLOR }]}
        onPress={handleCopy}
        activeOpacity={0.85}
      >
        {copied
          ? <CheckCheck size={16} color="#fff" strokeWidth={2.5} />
          : <Copy size={16} color="#fff" strokeWidth={2.5} />
        }
        <Text style={aip.copyTxt}>{copied ? "Copied to clipboard!" : "Copy prompt"}</Text>
      </TouchableOpacity>
    </View>
  );
}
const aip = StyleSheet.create({
  wrap: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 14,
    gap: 12,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 15, fontWeight: "800" },
  sub: { fontSize: 12, fontWeight: "600", marginTop: 1 },
  previewBox: { borderRadius: 12, borderWidth: 1.5, padding: 12, gap: 8 },
  previewText: { fontSize: 12, lineHeight: 18, fontWeight: "500" },
  expandTxt: { fontSize: 11, fontWeight: "800", alignSelf: "flex-end" },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 13,
  },
  copyTxt: { fontSize: 14, fontWeight: "800", color: "#fff" },
});

// ─── Quiz Screen (full-screen overlay) ────────────────────────────────────────
interface QuizScreenProps {
  questions: MCQQuestion[];
  levelIndex: number;
  chapterId: string;
  onClose: () => void;
  onComplete: (score: number) => void;
}

function QuizScreen({ questions, levelIndex, chapterId, onClose, onComplete }: QuizScreenProps) {
  const { theme: t } = useTheme();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));

  const q = questions[current];
  const total = questions.length;

  const handleSelect = (i: number) => {
    if (confirmed) return;
    setSelected(i);
  };

  const handleConfirm = () => {
    if (selected === null) return;
    setConfirmed(true);
    const correct = selected === q.answer;
    if (correct) setScore(s => s + 1);
    const newAnswers = [...answers];
    newAnswers[current] = selected;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (current === total - 1) {
      // Show results screen — onComplete called from the results button
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setConfirmed(false);
    }
  };

  // For results screen — recalculate final score
  const finalScore = answers.filter((a, i) => a === questions[i].answer).length;

  if (finished) {
    const passed = finalScore >= 7;
    return (
      <View style={[qs.overlay, { backgroundColor: t.background }]}>
        <ScrollView contentContainerStyle={qs.resultScroll}>
          {/* Result Hero */}
          <View style={[qs.resultHero, {
            backgroundColor: passed ? "#22C55E15" : "#FF4B4B15",
            borderColor: passed ? "#22C55E40" : "#FF4B4B40",
          }]}>
            <Trophy size={48} color={passed ? "#22C55E" : "#FF4B4B"} strokeWidth={2} />
            <Text style={[qs.resultTitle, { color: passed ? "#22C55E" : "#FF4B4B" }]}>
              {passed ? "Level Passed!" : "Keep Trying!"}
            </Text>
            <Text style={[qs.resultScore, { color: t.text }]}>
              {finalScore} / {total}
            </Text>
            <Text style={[qs.resultSub, { color: t.textMuted }]}>
              {passed
                ? finalScore === 10 ? "Perfect score! 🎉" : `Need 7 to pass — you got ${finalScore}. ✓`
                : `Need 7 to pass — you got ${finalScore}. Try again!`}
            </Text>
          </View>

          {/* Answer review */}
          <Text style={[qs.reviewTitle, { color: t.textMuted }]}>ANSWER REVIEW</Text>
          {questions.map((q2, i) => {
            const userAns = answers[i];
            const correct = userAns === q2.answer;
            return (
              <View key={i} style={[qs.reviewItem, { backgroundColor: t.surface, borderColor: t.border }]}>
                <View style={qs.reviewTop}>
                  <View style={[qs.reviewNum, {
                    backgroundColor: correct ? "#22C55E20" : "#FF4B4B20"
                  }]}>
                    {correct
                      ? <Check size={12} color="#22C55E" strokeWidth={3} />
                      : <X size={12} color="#FF4B4B" strokeWidth={3} />
                    }
                  </View>
                  <Text style={[qs.reviewQ, { color: t.text }]}>{q2.q}</Text>
                </View>
                {!correct && userAns !== null && (
                  <Text style={[qs.reviewWrong, { color: "#FF4B4B" }]}>
                    ✗ You chose: {q2.options[userAns]}
                  </Text>
                )}
                <Text style={[qs.reviewCorrect, { color: "#22C55E" }]}>
                  ✓ {q2.options[q2.answer]}
                </Text>
                <Text style={[qs.reviewExp, { color: t.textMuted }]}>{q2.explanation}</Text>
              </View>
            );
          })}

          {/* Buttons */}
          <TouchableOpacity
            style={[qs.btn, { backgroundColor: passed ? "#22C55E" : GRAMMAR_COLOR }]}
            onPress={() => onComplete(finalScore)}
            activeOpacity={0.85}
          >
            <Text style={qs.btnTxt}>{passed ? "Continue" : "Try Again"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[qs.btnGhost, { borderColor: t.border }]} onPress={onClose} activeOpacity={0.8}>
            <Text style={[qs.btnGhostTxt, { color: t.textMuted }]}>Back to Practice</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[qs.overlay, { backgroundColor: t.background }]}>
      {/* Header */}
      <View style={qs.header}>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <X size={22} color={t.textMuted} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={qs.progress}>
          <View style={[qs.progressBar, { backgroundColor: t.border }]}>
            <View style={[qs.progressFill, { width: `${((current) / total) * 100}%`, backgroundColor: GRAMMAR_COLOR }]} />
          </View>
          <Text style={[qs.progressTxt, { color: t.textMuted }]}>{current + 1} / {total}</Text>
        </View>
        <Text style={[qs.scoreTxt, { color: GRAMMAR_COLOR }]}>{score} ✓</Text>
      </View>

      <ScrollView contentContainerStyle={qs.body} showsVerticalScrollIndicator={false}>
        {/* Level badge */}
        <Text style={[qs.levelBadge, { color: GRAMMAR_COLOR }]}>LEVEL {levelIndex + 1}</Text>

        {/* Question */}
        <Text style={[qs.question, { color: t.text }]}>{q.q}</Text>

        {/* Options */}
        {q.options.map((opt, i) => {
          let bg = t.surface;
          let borderC = t.border;
          let textC = t.text;
          if (confirmed) {
            if (i === q.answer) { bg = "#22C55E18"; borderC = "#22C55E60"; textC = "#22C55E"; }
            else if (i === selected && i !== q.answer) { bg = "#FF4B4B18"; borderC = "#FF4B4B60"; textC = "#FF4B4B"; }
          } else if (selected === i) {
            bg = GRAMMAR_COLOR + "18"; borderC = GRAMMAR_COLOR; textC = GRAMMAR_COLOR;
          }
          return (
            <TouchableOpacity
              key={i}
              style={[qs.option, { backgroundColor: bg, borderColor: borderC }]}
              onPress={() => handleSelect(i)}
              activeOpacity={confirmed ? 1 : 0.8}
            >
              <View style={[qs.optLetter, { backgroundColor: borderC + "30" }]}>
                <Text style={[qs.optLetterTxt, { color: textC }]}>
                  {["A", "B", "C", "D"][i]}
                </Text>
              </View>
              <Text style={[qs.optText, { color: textC }]}>{opt}</Text>
              {confirmed && i === q.answer && <Check size={16} color="#22C55E" strokeWidth={3} />}
            </TouchableOpacity>
          );
        })}

        {/* Explanation (shown after confirming) */}
        {confirmed && (
          <View style={[qs.explanation, { backgroundColor: GRAMMAR_COLOR + "10", borderColor: GRAMMAR_COLOR + "30" }]}>
            <Text style={[qs.explanationTxt, { color: t.text }]}>{q.explanation}</Text>
          </View>
        )}

        {/* Confirm / Next button */}
        {!confirmed ? (
          <TouchableOpacity
            style={[qs.btn, { backgroundColor: selected !== null ? GRAMMAR_COLOR : t.border, opacity: selected !== null ? 1 : 0.5 }]}
            onPress={handleConfirm}
            disabled={selected === null}
            activeOpacity={0.85}
          >
            <Text style={qs.btnTxt}>Check Answer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[qs.btn, { backgroundColor: selected === q.answer ? "#22C55E" : GRAMMAR_COLOR }]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={qs.btnTxt}>{current === total - 1 ? "See Results" : "Next Question"}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const qs = StyleSheet.create({
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, gap: 12 },
  progress: { flex: 1, gap: 4 },
  progressBar: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },
  progressTxt: { fontSize: 11, fontWeight: "700", textAlign: "right" },
  scoreTxt: { fontSize: 15, fontWeight: "900", minWidth: 32, textAlign: "right" },
  body: { paddingHorizontal: 16, paddingBottom: 48 },
  levelBadge: { fontSize: 11, fontWeight: "900", letterSpacing: 1.5, marginBottom: 16, marginTop: 8 },
  question: { fontSize: 18, fontWeight: "800", lineHeight: 26, marginBottom: 24 },
  option: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, borderWidth: 1.5, padding: 14, marginBottom: 10,
  },
  optLetter: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  optLetterTxt: { fontSize: 13, fontWeight: "900" },
  optText: { flex: 1, fontSize: 14, fontWeight: "600", lineHeight: 20 },
  explanation: {
    borderRadius: 14, borderWidth: 1.5, padding: 14, marginBottom: 16, marginTop: 4,
  },
  explanationTxt: { fontSize: 13, lineHeight: 20, fontWeight: "500" },
  btn: {
    borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8, marginBottom: 8,
  },
  btnTxt: { color: "#fff", fontSize: 15, fontWeight: "800" },
  btnGhost: { borderRadius: 14, borderWidth: 1.5, paddingVertical: 14, alignItems: "center", marginBottom: 8 },
  btnGhostTxt: { fontSize: 14, fontWeight: "700" },
  resultScroll: { paddingHorizontal: 16, paddingBottom: 56, paddingTop: 60 },
  resultHero: { borderRadius: 20, borderWidth: 2, padding: 24, alignItems: "center", gap: 8, marginBottom: 28 },
  resultTitle: { fontSize: 26, fontWeight: "900" },
  resultScore: { fontSize: 48, fontWeight: "900" },
  resultSub: { fontSize: 14, fontWeight: "600", textAlign: "center" },
  reviewTitle: { fontSize: 11, fontWeight: "900", letterSpacing: 1, marginBottom: 12 },
  reviewItem: { borderRadius: 14, borderWidth: 1.5, padding: 14, marginBottom: 10, gap: 6 },
  reviewTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  reviewNum: { width: 22, height: 22, borderRadius: 7, alignItems: "center", justifyContent: "center", marginTop: 1 },
  reviewQ: { flex: 1, fontSize: 13, fontWeight: "700", lineHeight: 18 },
  reviewWrong: { fontSize: 12, fontWeight: "600", paddingLeft: 32 },
  reviewCorrect: { fontSize: 12, fontWeight: "700", paddingLeft: 32 },
  reviewExp: { fontSize: 12, lineHeight: 18, fontWeight: "500", paddingLeft: 32, marginTop: 2 },
});

// ─── Practice Tab ──────────────────────────────────────────────────────────────
interface PracticeTabProps {
  chapterId: string;
  practiceProgress: PracticeProgress;
  onStartLevel: (levelIndex: number) => void;
}

function PracticeTab({ chapterId, practiceProgress, onStartLevel }: PracticeTabProps) {
  const { theme: t } = useTheme();
  const chapterData = PRACTICE_DATA.find(c => c.chapterId === chapterId);

  if (!chapterData) {
    return (
      <View style={pt.empty}>
        <Text style={[pt.emptyTxt, { color: t.textMuted }]}>
          Practice questions coming soon for this chapter!
        </Text>
      </View>
    );
  }

  const totalPassed = chapterData.levels.filter((_, i) =>
    getLevelState(chapterId, i, practiceProgress) === "passed"
  ).length;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={pt.scroll}>
      {/* Progress bar */}
      <View style={[pt.progressCard, { backgroundColor: t.surface, borderColor: t.border }]}>
        <View style={pt.progressRow}>
          <Text style={[pt.progressLabel, { color: t.text }]}>Progress</Text>
          <Text style={[pt.progressVal, { color: GRAMMAR_COLOR }]}>{totalPassed} / 10 levels</Text>
        </View>
        <View style={[pt.bar, { backgroundColor: t.border }]}>
          <View style={[pt.barFill, { width: `${(totalPassed / 10) * 100}%`, backgroundColor: GRAMMAR_COLOR }]} />
        </View>
        {totalPassed === 10 && (
          <View style={pt.allDoneRow}>
            <Trophy size={16} color="#F59E0B" />
            <Text style={[pt.allDoneTxt, { color: "#F59E0B" }]}>All levels completed! 🎉</Text>
          </View>
        )}
      </View>

      {/* Level cards */}
      {chapterData.levels.map((_, i) => {
        const state = getLevelState(chapterId, i, practiceProgress);
        const result = practiceProgress.chapters[chapterId]?.[i];
        const locked = state === "locked";
        const passed = state === "passed";

        return (
          <TouchableOpacity
            key={i}
            style={[
              pt.levelCard,
              {
                backgroundColor: locked ? t.surfaceAlt ?? t.surface : t.surface,
                borderColor: passed ? "#22C55E50" : locked ? t.border : GRAMMAR_COLOR + "50",
                opacity: locked ? 0.6 : 1,
              },
            ]}
            onPress={() => !locked && onStartLevel(i)}
            activeOpacity={locked ? 1 : 0.8}
            disabled={locked}
          >
            {/* Left: level number */}
            <View style={[pt.levelNum, {
              backgroundColor: passed ? "#22C55E20" : locked ? t.border + "40" : GRAMMAR_COLOR + "20",
            }]}>
              {locked
                ? <Lock size={16} color={t.textMuted} strokeWidth={2.5} />
                : passed
                  ? <Check size={16} color="#22C55E" strokeWidth={3} />
                  : <Text style={[pt.levelNumTxt, { color: GRAMMAR_COLOR }]}>{i + 1}</Text>
              }
            </View>

            {/* Center: label + score */}
            <View style={pt.levelBody}>
              <Text style={[pt.levelTitle, { color: locked ? t.textMuted : t.text }]}>
                Level {i + 1}
              </Text>
              <Text style={[pt.levelSub, { color: t.textMuted }]}>
                {locked
                  ? "Complete previous level to unlock"
                  : passed
                    ? `Best: ${result?.bestScore ?? 0}/10 · ${result?.attempts ?? 0} attempt${(result?.attempts ?? 0) !== 1 ? "s" : ""}`
                    : result?.attempts
                      ? `Best: ${result.bestScore}/10 · ${result.attempts} attempt${result.attempts !== 1 ? "s" : ""}`
                      : "10 questions · Need 7/10 to pass"}
              </Text>
            </View>

            {/* Right: stars or arrow */}
            {passed && (
              <View style={pt.stars}>
                {[0, 1, 2].map(s => (
                  <Star
                    key={s}
                    size={13}
                    color={result && result.bestScore >= [7, 9, 10][s] ? "#F59E0B" : t.border}
                    fill={result && result.bestScore >= [7, 9, 10][s] ? "#F59E0B" : "none"}
                    strokeWidth={2}
                  />
                ))}
              </View>
            )}
            {!locked && !passed && (
              <ChevronRight size={18} color={GRAMMAR_COLOR} strokeWidth={2.5} />
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const pt = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingBottom: 56, paddingTop: 8 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyTxt: { fontSize: 15, fontWeight: "600", textAlign: "center" },
  progressCard: {
    borderRadius: 14, borderWidth: 1.5, padding: 14, marginBottom: 14, gap: 8,
  },
  progressRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressLabel: { fontSize: 13, fontWeight: "700" },
  progressVal: { fontSize: 13, fontWeight: "800" },
  bar: { height: 8, borderRadius: 4, overflow: "hidden" },
  barFill: { height: 8, borderRadius: 4 },
  allDoneRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  allDoneTxt: { fontSize: 13, fontWeight: "800" },
  levelCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, borderWidth: 1.5, padding: 14, marginBottom: 10,
  },
  levelNum: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  levelNumTxt: { fontSize: 16, fontWeight: "900" },
  levelBody: { flex: 1, gap: 2 },
  levelTitle: { fontSize: 15, fontWeight: "800" },
  levelSub: { fontSize: 12, fontWeight: "500" },
  stars: { flexDirection: "row", gap: 2 },
});

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function GrammarChapterScreen() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const idx = ALL_CHAPTERS.findIndex((c) => c.id === id);
  const chapter = ALL_CHAPTERS[idx];
  const prev = idx > 0 ? ALL_CHAPTERS[idx - 1] : null;
  const next = idx < ALL_CHAPTERS.length - 1 ? ALL_CHAPTERS[idx + 1] : null;

  const [isDone, setIsDone] = useState(false);
  const [togglingDone, setTogglingDone] = useState(false);
  const [activeTab, setActiveTab] = useState<"learn" | "practice">("learn");
  const [practiceProgress, setPracticeProgress] = useState<PracticeProgress>({ chapters: {} });
  const [activeQuiz, setActiveQuiz] = useState<{ levelIndex: number } | null>(null);

  // Record visit
  useEffect(() => {
    if (id) recordChapterVisit(id).catch(() => {});
  }, [id]);

  // Load progress
  useEffect(() => {
    if (!id) return;
    loadGrammarProgress().then((p) => setIsDone(p.chapters[id]?.completedAt != null));
    loadPracticeProgress().then(setPracticeProgress);
  }, [id]);

  const handleStartLevel = useCallback((levelIndex: number) => {
    setActiveQuiz({ levelIndex });
  }, []);

  const handleQuizComplete = useCallback(async (score: number) => {
    if (!id || !activeQuiz) return;
    const result = await recordLevelAttempt(id, activeQuiz.levelIndex, score);
    const updated = await loadPracticeProgress();
    setPracticeProgress(updated);
    // Auto-complete chapter if all 10 levels passed and visited
    if (updated.chapters[id]?.every(l => l.passed)) {
      const gp = await loadGrammarProgress();
      if (gp.chapters[id]?.visitCount > 0 && !gp.chapters[id]?.completedAt) {
        const { toggleChapterComplete: tcc } = await import("../lib/grammarProgress");
        await tcc(id);
        setIsDone(true);
      }
    }
    if (!result.passed) {
      // didn't pass — close quiz, let them retry
      setActiveQuiz(null);
    } else {
      // passed — close quiz
      setActiveQuiz(null);
    }
  }, [id, activeQuiz]);

  const handleToggleDone = async () => {
    if (!id || togglingDone) return;
    setTogglingDone(true);
    const nowDone = await toggleChapterComplete(id);
    setIsDone(nowDone);
    setTogglingDone(false);
  };

  if (!chapter) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: t.background }]} edges={["top"]}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 16 }}>
          <ChevronLeft size={24} color={t.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={s.centered}>
          <Text style={{ color: t.textMuted, fontSize: 15 }}>Chapter not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: t.background }]} edges={["top"]}>
      {/* Quiz overlay */}
      {activeQuiz && id && (
        <QuizScreen
          questions={PRACTICE_DATA.find(c => c.chapterId === id)?.levels[activeQuiz.levelIndex] ?? []}
          levelIndex={activeQuiz.levelIndex}
          chapterId={id}
          onClose={() => setActiveQuiz(null)}
          onComplete={handleQuizComplete}
        />
      )}

      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <ChevronLeft size={24} color={t.text} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={s.topCenter}>
          <Text style={[s.topChapter, { color: GRAMMAR_COLOR }]}>Chapter {chapter.number}</Text>
          <Text style={[s.topTitle, { color: t.text }]} numberOfLines={1}>{chapter.title}</Text>
        </View>
        {isDone && (
          <View style={[s.doneBadge, { backgroundColor: "#22C55E18", borderColor: "#22C55E44" }]}>
            <Check size={13} color="#22C55E" strokeWidth={3} />
            <Text style={s.doneBadgeTxt}>Done</Text>
          </View>
        )}
        {!isDone && <View style={{ width: 52 }} />}
      </View>

      {/* Tab switcher */}
      <View style={[s.tabBar, { backgroundColor: t.surface, borderColor: t.border }]}>
        {(["learn", "practice"] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[s.tabBtn, activeTab === tab && { backgroundColor: GRAMMAR_COLOR }]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
          >
            <Text style={[s.tabTxt, { color: activeTab === tab ? "#fff" : t.textMuted }]}>
              {tab === "learn" ? "📖 Learn" : "🎯 Practice"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Practice tab */}
      {activeTab === "practice" && id && (
        <PracticeTab
          chapterId={id}
          practiceProgress={practiceProgress}
          onStartLevel={handleStartLevel}
        />
      )}

      {/* Learn tab */}
      {activeTab === "learn" && <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Hero */}
        <View style={[s.hero, { backgroundColor: GRAMMAR_COLOR + "12", borderColor: GRAMMAR_COLOR + "25" }]}>
          <Text style={[s.heroTitle, { color: t.text }]}>{chapter.title}</Text>
          <Text style={[s.heroSub, { color: GRAMMAR_COLOR }]}>{chapter.subtitle}</Text>
        </View>

        {/* Theory sections (B1+ style) */}
        {chapter.theory && chapter.theory.map((section, i) => (
          <Card key={i} t={t}>
            <SectionHeader icon={i === 0 ? BookOpen : FileText} label={section.heading.toUpperCase()} color={GRAMMAR_COLOR} />
            <Text style={[s.bodyText, { color: t.text }]}>{section.body}</Text>
          </Card>
        ))}

        {/* Explanation (A1/A2 style) */}
        {chapter.explanation !== undefined && (
          <Card t={t}>
            <SectionHeader icon={BookOpen} label="EXPLANATION" color={GRAMMAR_COLOR} />
            <Text style={[s.bodyText, { color: t.text }]}>{chapter.explanation}</Text>
          </Card>
        )}

        {/* Core Rule (A1/A2 style) */}
        {chapter.rule !== undefined && (
          <Card t={t}>
            <SectionHeader icon={FileText} label="CORE RULE" color={GRAMMAR_COLOR} />
            <View style={[s.ruleBox, { backgroundColor: GRAMMAR_COLOR + "12", borderColor: GRAMMAR_COLOR + "30" }]}>
              <Text style={[s.ruleText, { color: t.text }]}>{chapter.rule}</Text>
            </View>
            {chapter.table && <GrammarTableView table={chapter.table} t={t} />}
          </Card>
        )}

        {/* Important Notes */}
        {(chapter.notes?.length ?? 0) > 0 && (
          <Card t={t}>
            <SectionHeader icon={Lightbulb} label="IMPORTANT NOTES" color="#F59E0B" />
            {chapter.notes!.map((note, i) => (
              <View key={i} style={s.noteRow}>
                <View style={[s.noteDot, { backgroundColor: "#F59E0B" }]} />
                <Text style={[s.noteText, { color: t.text }]}>{note}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Examples */}
        <Card t={t}>
          <SectionHeader icon={MessageSquare} label="EXAMPLES" color="#1CB0F6" />
          {chapter.examples.map((ex, i) => (
            <View
              key={i}
              style={[
                s.exRow,
                i < chapter.examples.length - 1 && { borderBottomColor: t.border, borderBottomWidth: StyleSheet.hairlineWidth },
              ]}
            >
              <Text style={[s.exDe, { color: t.text }]}>{ex.de}</Text>
              <Text style={[s.exEn, { color: t.textMuted }]}>{ex.en}</Text>
            </View>
          ))}
        </Card>

        {/* Common Mistakes */}
        <Card t={t}>
          <SectionHeader icon={AlertTriangle} label="COMMON MISTAKES" color="#FF4B4B" />
          {chapter.mistakes.map((m, i) => (
            <View key={i} style={s.noteRow}>
              <View style={[s.noteDot, { backgroundColor: "#FF4B4B" }]} />
              <Text style={[s.noteText, { color: t.text }]}>{m}</Text>
            </View>
          ))}
        </Card>

        {/* Exercises */}
        <Card t={t}>
          <SectionHeader icon={Dumbbell} label="PRACTICE EXERCISES" color="#58CC02" />
          {chapter.exercises.map((e, i) => (
            <ExerciseItem key={i} index={i} prompt={e.prompt} answer={e.answer} t={t} />
          ))}
        </Card>

        {/* Speaking */}
        <Card t={t}>
          <SectionHeader icon={MessageSquare} label="SPEAKING PRACTICE" color="#FF6B35" />
          {chapter.speakingPrompts.map((p, i) => (
            <View key={i} style={s.noteRow}>
              <View style={[s.noteDot, { backgroundColor: "#FF6B35" }]} />
              <Text style={[s.noteText, { color: t.text }]}>{p}</Text>
            </View>
          ))}
        </Card>

        {/* Summary */}
        <View style={[s.summaryBox, { backgroundColor: GRAMMAR_COLOR + "15", borderColor: GRAMMAR_COLOR + "40" }]}>
          <Text style={[s.summaryLabel, { color: GRAMMAR_COLOR }]}>REVISION SUMMARY</Text>
          <Text style={[s.summaryText, { color: t.text }]}>{chapter.summary}</Text>
        </View>

        {/* ── AI Practice Prompt ── */}
        {chapter.aiPrompt && (
          <AIPromptCard prompt={chapter.aiPrompt} t={t} />
        )}

        {/* ── Mark as Done button ── */}
        <TouchableOpacity
          style={[
            s.doneBtn,
            isDone
              ? { backgroundColor: "#22C55E18", borderColor: "#22C55E60" }
              : { backgroundColor: GRAMMAR_COLOR + "18", borderColor: GRAMMAR_COLOR + "50" },
          ]}
          onPress={handleToggleDone}
          activeOpacity={0.8}
          disabled={togglingDone}
        >
          {isDone ? (
            <CheckCircle2 size={20} color="#22C55E" strokeWidth={2.5} />
          ) : (
            <Circle size={20} color={GRAMMAR_COLOR} strokeWidth={2} />
          )}
          <Text style={[s.doneBtnTxt, { color: isDone ? "#22C55E" : GRAMMAR_COLOR }]}>
            {isDone ? "Completed — tap to undo" : "Mark as done"}
          </Text>
        </TouchableOpacity>

        {/* Prev / Next navigation */}
        <View style={s.navRow}>
          {prev ? (
            <TouchableOpacity
              style={[s.navBtn, { backgroundColor: t.surface, borderColor: t.border }]}
              onPress={() => router.replace(`/grammar-chapter?id=${prev.id}`)}
              activeOpacity={0.8}
            >
              <ChevronLeft size={16} color={GRAMMAR_COLOR} strokeWidth={2.5} />
              <View style={s.navBtnBody}>
                <Text style={[s.navBtnSub, { color: t.textMuted }]}>Previous</Text>
                <Text style={[s.navBtnTitle, { color: t.text }]} numberOfLines={1}>{prev.title}</Text>
              </View>
            </TouchableOpacity>
          ) : <View style={{ flex: 1 }} />}

          {next ? (
            <TouchableOpacity
              style={[s.navBtn, s.navBtnRight, { backgroundColor: t.surface, borderColor: t.border }]}
              onPress={() => router.replace(`/grammar-chapter?id=${next.id}`)}
              activeOpacity={0.8}
            >
              <View style={s.navBtnBody}>
                <Text style={[s.navBtnSub, { color: t.textMuted }]}>Next</Text>
                <Text style={[s.navBtnTitle, { color: t.text }]} numberOfLines={1}>{next.title}</Text>
              </View>
              <ChevronRight size={16} color={GRAMMAR_COLOR} strokeWidth={2.5} />
            </TouchableOpacity>
          ) : <View style={{ flex: 1 }} />}
        </View>
      </ScrollView>}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: 16, paddingBottom: 56 },

  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  topCenter: { flex: 1, alignItems: "center" },
  topChapter: { fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },
  topTitle: { fontSize: 16, fontWeight: "800" },
  doneBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  doneBadgeTxt: { fontSize: 11, fontWeight: "800", color: "#22C55E" },

  hero: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 20,
    alignItems: "center",
    marginBottom: 14,
    marginTop: 4,
    gap: 4,
  },
  heroTitle: { fontSize: 22, fontWeight: "900" },
  heroSub: { fontSize: 14, fontWeight: "700" },

  bodyText: { fontSize: 14, lineHeight: 22, fontWeight: "500" },
  ruleBox: { borderRadius: 12, borderWidth: 1.5, padding: 14 },
  ruleText: { fontSize: 13, lineHeight: 21, fontWeight: "700", fontFamily: "monospace" },

  noteRow: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginBottom: 10 },
  noteDot: { width: 7, height: 7, borderRadius: 4, marginTop: 6 },
  noteText: { flex: 1, fontSize: 13, lineHeight: 20, fontWeight: "500" },

  exRow: { paddingVertical: 10 },
  exDe: { fontSize: 15, fontWeight: "800", marginBottom: 2 },
  exEn: { fontSize: 13, fontWeight: "500" },

  summaryBox: { borderRadius: 16, borderWidth: 2, padding: 16, marginBottom: 16, gap: 8 },
  summaryLabel: { fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  summaryText: { fontSize: 13, lineHeight: 20, fontWeight: "700" },

  // Mark as done button
  doneBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 16,
    marginBottom: 16,
  },
  doneBtnTxt: { fontSize: 15, fontWeight: "800" },

  navRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  navBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
  },
  navBtnRight: { justifyContent: "flex-end" },
  navBtnBody: { flex: 1 },
  navBtnSub: { fontSize: 11, fontWeight: "700" },
  navBtnTitle: { fontSize: 13, fontWeight: "800" },

  // Tab switcher
  tabBar: {
    flexDirection: "row",
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: "center",
  },
  tabTxt: { fontSize: 14, fontWeight: "800" },
});
