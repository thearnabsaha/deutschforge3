/**
 * Exams Page — Goethe mock exam browser (web port)
 */
import React, { useState, useEffect } from "react";
import {
  GraduationCap, BarChart2, ChevronRight, ChevronLeft,
  Headphones, BookOpen, PenLine, Mic,
  Clock, Check, X, AlignLeft, Volume2, Square, Play,
  MessageSquare, CheckCircle2,
} from "lucide-react";
import {
  LEVEL_META, SECTION_META, getExams, getExamById,
  type Level, type Section, type AnyExam,
  type HoerenExam, type LesenExam, type SchreibenExam, type SprechenExam,
  type MCQQuestion, type TrueFalseQuestion,
} from "../lib/goetheExamData";
import {
  loadResults, saveAttempt, getBestScore, getAttemptCount,
  hasEverPassed, scoreColor,
  type ExamResultsV2, type ExamAttempt,
} from "../lib/examAnalytics";

type NavState =
  | { screen: "levels" }
  | { screen: "sections"; level: Level }
  | { screen: "list"; level: Level; section: Section }
  | { screen: "exam"; level: Level; section: Section; examId: string }
  | { screen: "analytics" };

const LEVELS: Level[] = ["A1", "A2", "B1"];
const SECTIONS: Section[] = ["hoeren", "lesen", "schreiben", "sprechen"];

function SectionIcon({ section, size = 20, color }: { section: Section; size?: number; color: string }) {
  if (section === "hoeren") return <Headphones size={size} color={color} strokeWidth={1.8} />;
  if (section === "lesen") return <BookOpen size={size} color={color} strokeWidth={1.8} />;
  if (section === "schreiben") return <PenLine size={size} color={color} strokeWidth={1.8} />;
  return <Mic size={size} color={color} strokeWidth={1.8} />;
}

// ─── TTS Button ──────────────────────────────────────────────────────────────
function TTSButton({ text, color }: { text: string; color: string }) {
  const [speaking, setSpeaking] = useState(false);

  const speak = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "de-DE";
      utt.onend = () => setSpeaking(false);
      utt.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(utt);
    }
  };
  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  return (
    <button
      onClick={speaking ? stop : speak}
      className="flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-semibold flex-shrink-0"
      style={{ borderColor: color, backgroundColor: color + "12", color }}
    >
      {speaking ? <Square size={10} fill={color} /> : <Volume2 size={10} />}
      {speaking ? "Stop" : "Hören"}
    </button>
  );
}

// ─── MCQ Item ─────────────────────────────────────────────────────────────────
function MCQItem({ question, selectedIndex, onSelect, showAnswer, color }: {
  question: MCQQuestion; selectedIndex: number | null;
  onSelect: (idx: number) => void; showAnswer: boolean; color: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-start gap-2 mb-2">
        <p className="flex-1 text-sm font-medium text-gray-900 dark:text-white">{question.text}</p>
        <TTSButton text={question.text} color={color} />
      </div>
      {question.imageHint && (
        <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-500">
          📷 {question.imageHint}
        </div>
      )}
      {question.options.map((opt, idx) => {
        let cls = "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white";
        if (showAnswer) {
          if (idx === question.correct) cls = "bg-green-50 border-green-500 text-green-700 dark:bg-green-900/20 dark:text-green-400";
          else if (idx === selectedIndex) cls = "bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:text-red-400";
        } else if (idx === selectedIndex) {
          cls = "border-2 text-white";
        }
        return (
          <button
            key={idx}
            onClick={() => !showAnswer && onSelect(idx)}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-xl border mb-2 text-left text-sm transition-all ${cls}`}
            style={!showAnswer && idx === selectedIndex ? { backgroundColor: color + "20", borderColor: color, color } : undefined}
          >
            <span
              className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ borderColor: "currentColor" }}
            >
              {String.fromCharCode(65 + idx)}
            </span>
            <span className="flex-1">{opt}</span>
            {showAnswer && idx === question.correct && <Check size={14} color="#4CAF50" strokeWidth={3} />}
          </button>
        );
      })}
    </div>
  );
}

// ─── TF Item ─────────────────────────────────────────────────────────────────
function TFItem({ question, selected, onSelect, showAnswer, color }: {
  question: TrueFalseQuestion; selected: boolean | null;
  onSelect: (v: boolean) => void; showAnswer: boolean; color: string;
}) {
  return (
    <div className="mb-5">
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 mb-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1 text-xs text-gray-400"><Headphones size={11} /> Audio context:</div>
          <TTSButton text={question.audioContext} color={color} />
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300 italic">{question.audioContext}</p>
      </div>
      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">„{question.statement}"</p>
      <div className="flex gap-2">
        {([{ label: "Richtig", value: true }, { label: "Falsch", value: false }] as const).map(({ label, value }) => {
          let cls = "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white";
          if (showAnswer) {
            if (value === question.correct) cls = "bg-green-50 border-green-500 text-green-700";
            else if (selected === value) cls = "bg-red-50 border-red-500 text-red-700";
          } else if (selected === value) cls = "border-2";
          return (
            <button
              key={label}
              onClick={() => !showAnswer && onSelect(value)}
              className={`flex-1 py-2 rounded-xl border font-semibold text-sm transition-all ${cls}`}
              style={!showAnswer && selected === value ? { backgroundColor: color + "20", borderColor: color, color } : undefined}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Analytics screen ─────────────────────────────────────────────────────────
function AnalyticsView({ results, onBack }: { results: ExamResultsV2; onBack: () => void }) {
  const totalAttempts = Object.values(results).reduce((s, arr) => s + arr.length, 0);
  const passedExams = Object.entries(results).filter(([id, arr]) => arr.some(a => a.passed)).length;
  const avgScore = (() => {
    const all = Object.values(results).flatMap(arr => arr.map(a => a.score));
    return all.length ? Math.round(all.reduce((s, n) => s + n, 0) / all.length) : 0;
  })();
  const recentActivity = Object.entries(results)
    .flatMap(([id, arr]) => arr.map(a => ({ ...a, examId: id })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <button onClick={onBack} className="flex items-center gap-1 text-amber-500 font-semibold text-sm">
          <ChevronLeft size={18} strokeWidth={2.5} /> Exams
        </button>
        <span className="text-lg font-black text-gray-900 dark:text-white ml-1">Analytics</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { num: totalAttempts, label: "Attempts", color: "#6366f1" },
            { num: passedExams, label: "Passed", color: "#22c55e" },
            { num: `${avgScore}%`, label: "Avg Score", color: "#f59e0b" },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
              <span className="text-2xl font-black" style={{ color: s.color }}>{s.num}</span>
              <span className="text-xs text-gray-400 font-semibold mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="text-xs font-bold tracking-wider text-gray-400 mb-3">RECENT ACTIVITY</div>
        {recentActivity.length === 0 ? (
          <div className="text-sm text-gray-400 text-center py-8">No attempts yet</div>
        ) : recentActivity.map((a, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl mb-2 border border-gray-200 dark:border-gray-800">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
              style={{ backgroundColor: scoreColor(a.score) + "20", color: scoreColor(a.score) }}>
              {a.score}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{a.examId.replace(/_/g, " ").toUpperCase()}</div>
              <div className="text-xs text-gray-400">{new Date(a.date).toLocaleDateString()}</div>
            </div>
            {a.passed ? <Check size={16} color="#22c55e" strokeWidth={3} /> : <X size={16} color="#ef4444" strokeWidth={3} />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Exam Runner ─────────────────────────────────────────────────────────────
function ExamRunner({ level, section, examId, onBack, onSaveAttempt, attempts }: {
  level: Level; section: Section; examId: string; onBack: () => void;
  onSaveAttempt: (id: string, a: ExamAttempt) => Promise<void>; attempts: ExamAttempt[];
}) {
  const exam = getExamById(level, section, examId);
  const secMeta = SECTION_META[section];
  const levelMeta = LEVEL_META[level];

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showAnswers, setShowAnswers] = useState(!!attempts.length);
  const [submitted, setSubmitted] = useState(!!attempts.length);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(
    attempts[0] ? { correct: attempts[0].rawCorrect, total: attempts[0].rawTotal } : null
  );
  const [currentPart, setCurrentPart] = useState(0);
  const [writingTexts, setWritingTexts] = useState<Record<string, string>>({});
  const [showModel, setShowModel] = useState<Record<string, boolean>>({});

  if (!exam) return (
    <div className="flex flex-col h-full items-center justify-center">
      <p className="text-gray-500 mb-4">Exam not found</p>
      <button onClick={onBack} className="text-blue-500 font-semibold">Go Back</button>
    </div>
  );

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
            total++; if (answers[`gap_${gn}`] === ans) correct++;
          }
        }
      }
    }
    return { correct, total };
  };

  const handleSubmit = async () => {
    const sc = calcScore();
    const pct = sc.total > 0 ? Math.round((sc.correct / sc.total) * 100) : 0;
    setScore(sc); setShowAnswers(true); setSubmitted(true);
    await onSaveAttempt(exam.id, { date: new Date().toISOString(), score: pct, rawCorrect: sc.correct, rawTotal: sc.total, passed: pct >= levelMeta.passScore });
  };

  const handleRetake = () => {
    setAnswers({}); setShowAnswers(false); setSubmitted(false); setScore(null);
    setCurrentPart(0); setWritingTexts({}); setShowModel({});
  };

  const pct = score && score.total > 0 ? Math.round((score.correct / score.total) * 100) : null;
  const passed = pct !== null && pct >= levelMeta.passScore;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <button onClick={onBack} className="flex items-center gap-1 font-semibold text-sm" style={{ color: secMeta.color }}>
          <ChevronLeft size={18} strokeWidth={2.5} />
          Back
        </button>
        <div className="flex-1">
          <div className="text-sm font-black text-gray-900 dark:text-white">{exam.title}</div>
          <div className="text-xs" style={{ color: secMeta.color }}>{level} · {secMeta.label}</div>
        </div>
        {submitted && pct !== null && (
          <div className="text-sm font-black px-2 py-1 rounded-lg" style={{ backgroundColor: scoreColor(pct) + "20", color: scoreColor(pct) }}>
            {pct}%
          </div>
        )}
      </div>

      {/* Score banner */}
      {submitted && pct !== null && (
        <div className={`px-4 py-3 flex items-center gap-3 ${passed ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
          {passed
            ? <CheckCircle2 size={20} color="#22c55e" />
            : <X size={20} color="#ef4444" />}
          <div className="flex-1">
            <div className="text-sm font-bold" style={{ color: passed ? "#22c55e" : "#ef4444" }}>
              {passed ? "Passed!" : "Not Passed"} · {score?.correct}/{score?.total} correct · {pct}%
            </div>
            <div className="text-xs text-gray-400">Pass: {levelMeta.passScore}/100</div>
          </div>
          <button onClick={handleRetake} className="text-xs font-bold px-2 py-1 border rounded-lg border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300">
            Retake
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 max-w-2xl mx-auto">
          {/* ── Hören ── */}
          {section === "hoeren" && (() => {
            const h = exam as HoerenExam;
            const parts = h.parts;
            const part = parts[currentPart];
            if (!part) return null;
            return (
              <div>
                <div className="flex gap-2 mb-4">
                  {parts.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentPart(idx)}
                      className="px-3 py-1.5 rounded-lg text-sm font-bold border transition-all"
                      style={{ backgroundColor: currentPart === idx ? secMeta.color : undefined, color: currentPart === idx ? "#fff" : secMeta.color, borderColor: secMeta.color }}>
                      Teil {idx + 1}
                    </button>
                  ))}
                </div>
                <div className="p-3 rounded-xl mb-4" style={{ backgroundColor: secMeta.color + "15", borderLeft: `3px solid ${secMeta.color}` }}>
                  <div className="font-bold text-sm" style={{ color: secMeta.color }}>{part.title}</div>
                  <div className="text-xs text-gray-400">{part.points} Punkte</div>
                </div>
                {(part.type === "picture_mcq" || part.type === "mcq") &&
                  (part as any).questions.map((q: MCQQuestion) => (
                    <MCQItem key={q.id} question={q} selectedIndex={answers[q.id] ?? null}
                      onSelect={idx => setAnswers(p => ({ ...p, [q.id]: idx }))}
                      showAnswer={showAnswers} color={secMeta.color} />
                  ))}
                {part.type === "true_false" &&
                  (part as any).questions.map((q: TrueFalseQuestion) => (
                    <TFItem key={q.id} question={q} selected={answers[q.id] ?? null}
                      onSelect={v => setAnswers(p => ({ ...p, [q.id]: v }))}
                      showAnswer={showAnswers} color={secMeta.color} />
                  ))}
                {/* Part nav */}
                <div className="flex gap-2 mt-4">
                  {currentPart > 0 && (
                    <button onClick={() => setCurrentPart(p => p - 1)}
                      className="flex-1 py-2.5 border rounded-xl font-bold text-sm border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                      ← Previous
                    </button>
                  )}
                  {currentPart < parts.length - 1 ? (
                    <button onClick={() => setCurrentPart(p => p + 1)}
                      className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white"
                      style={{ backgroundColor: secMeta.color }}>
                      Next →
                    </button>
                  ) : !submitted && (
                    <button onClick={handleSubmit}
                      className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-green-500">
                      Submit & Check
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── Lesen ── */}
          {section === "lesen" && (() => {
            const l = exam as LesenExam;
            const parts = l.parts;
            const part = parts[currentPart];
            if (!part) return null;
            return (
              <div>
                <div className="flex gap-2 mb-4">
                  {parts.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentPart(idx)}
                      className="px-3 py-1.5 rounded-lg text-sm font-bold border transition-all"
                      style={{ backgroundColor: currentPart === idx ? secMeta.color : undefined, color: currentPart === idx ? "#fff" : secMeta.color, borderColor: secMeta.color }}>
                      Teil {idx + 1}
                    </button>
                  ))}
                </div>
                <div className="p-3 rounded-xl mb-4" style={{ backgroundColor: secMeta.color + "15", borderLeft: `3px solid ${secMeta.color}` }}>
                  <div className="font-bold text-sm" style={{ color: secMeta.color }}>{part.title}</div>
                </div>
                {part.type === "matching" && (() => {
                  const mp = part as any;
                  return (
                    <div>
                      <p className="text-sm text-gray-500 mb-3">Ordnen Sie die Anzeigen den passenden Personen zu.</p>
                      {mp.task.items.map((item: any) => (
                        <div key={item.label} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-2">
                          <span className="font-black text-sm mr-2" style={{ color: secMeta.color }}>{item.label}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item.content}</span>
                          {showAnswers && <div className="flex items-center gap-1 mt-1 text-xs text-green-600"><Check size={12} strokeWidth={3} /> {mp.task.correctMap[item.label]}</div>}
                        </div>
                      ))}
                    </div>
                  );
                })()}
                {part.type === "fill_gap" && (() => {
                  const fp = part as any;
                  return (
                    <div>
                      <p className="text-sm text-gray-500 mb-3">Wählen Sie das passende Wort für jede Lücke.</p>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{fp.task.textWithGaps}</p>
                      </div>
                      {Object.entries(fp.task.options).map(([gn, opts]: any) => (
                        <div key={gn} className="mb-4">
                          <div className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Lücke {gn}:</div>
                          <div className="flex flex-wrap gap-2">
                            {opts.map((opt: string) => {
                              const sel = answers[`gap_${gn}`] === opt;
                              const correct = fp.task.answers[gn] === opt;
                              let cls = "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300";
                              if (showAnswers && correct) cls = "bg-green-50 border-green-500 text-green-700";
                              else if (showAnswers && sel) cls = "bg-red-50 border-red-500 text-red-700";
                              return (
                                <button key={opt} onClick={() => !showAnswers && setAnswers(p => ({ ...p, [`gap_${gn}`]: opt }))}
                                  className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all ${cls}`}
                                  style={!showAnswers && sel ? { backgroundColor: secMeta.color + "20", borderColor: secMeta.color, color: secMeta.color } : undefined}>
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
                {part.type === "mcq" && (() => {
                  const mp = part as any;
                  return (
                    <div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-4">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{mp.passage}</p>
                      </div>
                      {mp.questions.map((q: MCQQuestion) => (
                        <MCQItem key={q.id} question={q} selectedIndex={answers[q.id] ?? null}
                          onSelect={idx => setAnswers(p => ({ ...p, [q.id]: idx }))}
                          showAnswer={showAnswers} color={secMeta.color} />
                      ))}
                    </div>
                  );
                })()}
                <div className="flex gap-2 mt-4">
                  {currentPart > 0 && (
                    <button onClick={() => setCurrentPart(p => p - 1)}
                      className="flex-1 py-2.5 border rounded-xl font-bold text-sm border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                      ← Previous
                    </button>
                  )}
                  {currentPart < parts.length - 1 ? (
                    <button onClick={() => setCurrentPart(p => p + 1)}
                      className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white"
                      style={{ backgroundColor: secMeta.color }}>
                      Next →
                    </button>
                  ) : !submitted && (
                    <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-green-500">
                      Submit & Check
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── Schreiben ── */}
          {section === "schreiben" && (() => {
            const se = exam as SchreibenExam;
            return (
              <div>
                <div className="p-3 rounded-xl mb-4 flex items-start gap-2 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800">
                  <PenLine size={16} color="#EF6C00" className="mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-sm text-orange-700">Writing Task</div>
                    <div className="text-xs text-gray-500">Write your answer, then check the model answer.</div>
                  </div>
                </div>
                {se.tasks.map((task, idx) => (
                  <div key={task.id} className="border border-gray-200 dark:border-gray-800 rounded-2xl mb-4 overflow-hidden">
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/10">
                      <div className="font-black text-sm text-orange-700">Aufgabe {idx + 1}</div>
                      <div className="font-bold text-gray-900 dark:text-white">{task.title}</div>
                    </div>
                    <div className="p-4">
                      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-3">
                        <div className="text-xs font-black text-gray-400 mb-1">AUFGABE</div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{task.prompt}</p>
                        {task.wordLimit && <p className="text-xs text-orange-600 mt-1 flex items-center gap-1"><AlignLeft size={11} /> {task.wordLimit}</p>}
                      </div>
                      {task.type === "form" && task.fields ? (
                        task.fields.map(f => (
                          <div key={f.label} className="mb-2">
                            <label className="text-xs font-semibold text-gray-500 block mb-1">{f.label}</label>
                            <input value={writingTexts[`${task.id}_${f.label}`] || ""} onChange={e => setWritingTexts(p => ({ ...p, [`${task.id}_${f.label}`]: e.target.value }))}
                              placeholder={f.placeholder} disabled={submitted}
                              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
                          </div>
                        ))
                      ) : (
                        <textarea value={writingTexts[task.id] || ""} onChange={e => setWritingTexts(p => ({ ...p, [task.id]: e.target.value }))}
                          placeholder="Schreiben Sie hier..." disabled={submitted} rows={5}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white resize-none" />
                      )}
                      {writingTexts[task.id] && (
                        <p className="text-xs text-gray-400 mt-1">{writingTexts[task.id].split(/\s+/).filter(Boolean).length} Wörter</p>
                      )}
                      {submitted && (
                        <div className="mt-3">
                          <button onClick={() => setShowModel(p => ({ ...p, [task.id]: !p[task.id] }))}
                            className="w-full py-2 border border-orange-400 rounded-xl text-sm font-bold text-orange-600 mb-2">
                            {showModel[task.id] ? "▲ Hide" : "▼ Show"} Model Answer
                          </button>
                          {showModel[task.id] && (
                            <div>
                              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl mb-2">
                                <div className="flex items-center gap-1 text-xs font-bold text-green-600 mb-1"><Check size={11} strokeWidth={3} /> Musterlösung</div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{task.modelAnswer}</p>
                              </div>
                              <div className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
                                <div className="text-xs font-black text-gray-400 mb-2">BEWERTUNGSKRITERIEN</div>
                                {task.assessmentCriteria.map((c, ci) => (
                                  <p key={ci} className="text-xs text-gray-500 mb-1">• {c}</p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {!submitted && (
                  <button onClick={async () => { setSubmitted(true); await onSaveAttempt(exam.id, { date: new Date().toISOString(), score: 0, rawCorrect: 0, rawTotal: 0, passed: false }); }}
                    className="w-full py-3 rounded-xl font-bold text-white bg-green-500 mt-2">
                    Submit & See Model Answers
                  </button>
                )}
              </div>
            );
          })()}

          {/* ── Sprechen ── */}
          {section === "sprechen" && (() => {
            const sp = exam as SprechenExam;
            const parts = sp.parts;
            const part = parts[currentPart];
            if (!part) return null;
            return (
              <div>
                <div className="flex gap-2 mb-4">
                  {parts.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentPart(idx)}
                      className="px-3 py-1.5 rounded-lg text-sm font-bold border transition-all"
                      style={{ backgroundColor: currentPart === idx ? secMeta.color : undefined, color: currentPart === idx ? "#fff" : secMeta.color, borderColor: secMeta.color }}>
                      Teil {idx + 1}
                    </button>
                  ))}
                </div>
                <div className="p-3 rounded-xl mb-4 bg-pink-50 dark:bg-pink-900/10 border border-pink-200 dark:border-pink-800">
                  <div className="flex items-center gap-2 mb-1"><Mic size={14} color="#AD1457" /><span className="font-bold text-sm text-pink-700">Speaking Practice</span></div>
                  <p className="text-xs text-gray-500">Tap <Volume2 size={10} className="inline" /> on any prompt to hear it in German, then practice speaking aloud.</p>
                </div>
                <div className="p-3 rounded-xl mb-4" style={{ backgroundColor: secMeta.color + "15", borderLeft: `3px solid ${secMeta.color}` }}>
                  <div className="font-bold text-sm" style={{ color: secMeta.color }}>{part.title}</div>
                </div>

                {part.type === "self_intro" && (
                  <div>
                    <p className="text-sm text-gray-500 mb-3">Stellen Sie sich vor:</p>
                    {part.prompts.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl mb-2">
                        <span className="font-black text-sm w-5 flex-shrink-0" style={{ color: secMeta.color }}>{idx + 1}</span>
                        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{p}</span>
                        <TTSButton text={p} color={secMeta.color} />
                      </div>
                    ))}
                  </div>
                )}

                {part.type === "question_cards" && (
                  <div>
                    {part.cards.map((card, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl mb-3">
                        <div className="flex items-start gap-2 mb-2">
                          <p className="flex-1 text-sm font-medium text-gray-900 dark:text-white">{card.question}</p>
                          <TTSButton text={card.question} color={secMeta.color} />
                        </div>
                        <button onClick={() => setShowModel(p => ({ ...p, [`qc_${idx}`]: !p[`qc_${idx}`] }))}
                          className="w-full py-1.5 border rounded-lg text-xs font-bold mb-2"
                          style={{ borderColor: secMeta.color, color: secMeta.color }}>
                          {showModel[`qc_${idx}`] ? "▲ Hide" : "▼ Sample Answer"}
                        </button>
                        {showModel[`qc_${idx}`] && (
                          <div className="flex items-start gap-2 p-2 rounded-lg" style={{ backgroundColor: secMeta.color + "10" }}>
                            <p className="flex-1 text-xs text-gray-700 dark:text-gray-300">{card.sampleAnswer}</p>
                            <TTSButton text={card.sampleAnswer} color={secMeta.color} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {part.type === "picture_description" && (
                  <div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl mb-3">
                      <div className="text-xs text-gray-400 mb-1">📷 Bild zeigt:</div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{part.imageDescription}</p>
                    </div>
                    {part.prompts.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl mb-2">
                        <span className="font-black text-xs" style={{ color: secMeta.color }}>Q{idx + 1}</span>
                        <span className="flex-1 text-sm">{p}</span>
                        <TTSButton text={p} color={secMeta.color} />
                      </div>
                    ))}
                    <button onClick={() => setShowModel(p => ({ ...p, pic: !p["pic"] }))}
                      className="w-full py-2 border rounded-xl text-sm font-bold mt-2"
                      style={{ borderColor: secMeta.color, color: secMeta.color }}>
                      {showModel["pic"] ? "▲ Hide" : "▼ Sample Answer"}
                    </button>
                    {showModel["pic"] && (
                      <div className="flex items-start gap-2 p-3 rounded-xl mt-2" style={{ backgroundColor: secMeta.color + "10" }}>
                        <p className="flex-1 text-sm">{part.sampleAnswer}</p>
                        <TTSButton text={part.sampleAnswer} color={secMeta.color} />
                      </div>
                    )}
                  </div>
                )}

                {part.type === "role_play" && (
                  <div>
                    <div className="p-3 rounded-xl mb-3 flex items-start gap-2" style={{ backgroundColor: secMeta.color + "15" }}>
                      <div className="flex-1">
                        <div className="text-xs font-black mb-1" style={{ color: secMeta.color }}>SZENARIO</div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{part.scenario}</p>
                      </div>
                      <TTSButton text={part.scenario} color={secMeta.color} />
                    </div>
                    {part.sampleLines.map((line, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl mb-2">
                        <MessageSquare size={14} style={{ color: secMeta.color, flexShrink: 0 }} />
                        <span className="flex-1 text-sm">{line}</span>
                        <TTSButton text={line} color={secMeta.color} />
                      </div>
                    ))}
                  </div>
                )}

                {part.type === "topic_presentation" && (
                  <div>
                    <div className="p-3 rounded-xl mb-3 flex items-start gap-2" style={{ backgroundColor: secMeta.color + "15" }}>
                      <div className="flex-1">
                        <div className="text-xs font-black mb-1" style={{ color: secMeta.color }}>THEMA</div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{part.topic}</p>
                      </div>
                      <TTSButton text={part.topic} color={secMeta.color} />
                    </div>
                    {part.outline.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2.5 border border-gray-200 dark:border-gray-800 rounded-xl mb-2">
                        <span className="font-black text-sm" style={{ color: secMeta.color }}>{idx + 1}.</span>
                        <span className="flex-1 text-sm">{item}</span>
                        <TTSButton text={item} color={secMeta.color} />
                      </div>
                    ))}
                    <button onClick={() => setShowModel(p => ({ ...p, pres: !p["pres"] }))}
                      className="w-full py-2 border rounded-xl text-sm font-bold mt-3"
                      style={{ borderColor: secMeta.color, color: secMeta.color }}>
                      {showModel["pres"] ? "▲ Hide" : "▼ Sample Presentation"}
                    </button>
                    {showModel["pres"] && (
                      <div className="flex items-start gap-2 p-3 rounded-xl mt-2" style={{ backgroundColor: secMeta.color + "10" }}>
                        <p className="flex-1 text-sm">{part.sampleAnswer}</p>
                        <TTSButton text={part.sampleAnswer} color={secMeta.color} />
                      </div>
                    )}
                  </div>
                )}

                {part.type === "discussion" && (
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{(part as any).topic}</p>
                    {(part as any).prompts.map((p: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl mb-2">
                        <span className="flex-1 text-sm">{p}</span>
                        <TTSButton text={p} color={secMeta.color} />
                      </div>
                    ))}
                  </div>
                )}

                {part.type === "planning" && (
                  <div>
                    <div className="p-3 rounded-xl mb-3" style={{ backgroundColor: secMeta.color + "15" }}>
                      <div className="text-xs font-black mb-1" style={{ color: secMeta.color }}>SZENARIO</div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{(part as any).scenario}</p>
                    </div>
                    {(part as any).suggestions.map((s: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-800 rounded-xl mb-2">
                        <span className="flex-1 text-sm">{s}</span>
                        <TTSButton text={s} color={secMeta.color} />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  {currentPart > 0 && (
                    <button onClick={() => setCurrentPart(p => p - 1)}
                      className="flex-1 py-2.5 border rounded-xl font-bold text-sm border-gray-300 dark:border-gray-700">
                      ← Previous
                    </button>
                  )}
                  {currentPart < parts.length - 1 ? (
                    <button onClick={() => setCurrentPart(p => p + 1)}
                      className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white"
                      style={{ backgroundColor: secMeta.color }}>
                      Next →
                    </button>
                  ) : !submitted && (
                    <button onClick={async () => { setSubmitted(true); await onSaveAttempt(exam.id, { date: new Date().toISOString(), score: 0, rawCorrect: 0, rawTotal: 0, passed: false }); }}
                      className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-green-500">
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function ExamsPage() {
  const [nav, setNav] = useState<NavState>({ screen: "levels" });
  const [examResults, setExamResults] = useState<ExamResultsV2>({});

  useEffect(() => { loadResults().then(r => setExamResults(r)); }, []);

  const handleSaveAttempt = async (examId: string, attempt: ExamAttempt) => {
    const updated = await saveAttempt(examId, attempt);
    setExamResults(updated);
  };

  const push = (state: NavState) => setNav(state);
  const back = () => {
    if (nav.screen === "sections") push({ screen: "levels" });
    else if (nav.screen === "list") push({ screen: "sections", level: (nav as any).level });
    else if (nav.screen === "exam") push({ screen: "list", level: (nav as any).level, section: (nav as any).section });
    else if (nav.screen === "analytics") push({ screen: "levels" });
  };

  // ── Analytics ──
  if (nav.screen === "analytics") return <AnalyticsView results={examResults} onBack={back} />;

  // ── Exam Runner ──
  if (nav.screen === "exam") {
    const n = nav as { screen: "exam"; level: Level; section: Section; examId: string };
    return <ExamRunner level={n.level} section={n.section} examId={n.examId} onBack={back}
      onSaveAttempt={handleSaveAttempt} attempts={examResults[n.examId] ?? []} />;
  }

  // ── Exam List ──
  if (nav.screen === "list") {
    const n = nav as { screen: "list"; level: Level; section: Section };
    const exams = getExams(n.level, n.section);
    const secMeta = SECTION_META[n.section];
    const levelMeta = LEVEL_META[n.level];
    const attempted = exams.filter(e => getAttemptCount(examResults, e.id) > 0).length;
    const passed = exams.filter(e => hasEverPassed(examResults, e.id)).length;
    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-950">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <button onClick={back} className="flex items-center gap-1 text-sm font-semibold" style={{ color: secMeta.color }}>
            <ChevronLeft size={18} strokeWidth={2.5} /> Sections
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: secMeta.color + "20" }}>
              <SectionIcon section={n.section} size={15} color={secMeta.color} />
            </div>
            <span className="font-black text-gray-900 dark:text-white">{n.level} · {secMeta.label}</span>
          </div>
        </div>
        {/* Stats */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          {[{ num: exams.length, lbl: "Total" }, { num: attempted, lbl: "Tried" }, { num: passed, lbl: "Passed" }, { num: levelMeta.passScore, lbl: "Pass" }].map((s, i) => (
            <div key={s.lbl} className="flex-1 py-3 flex flex-col items-center border-r border-gray-200 dark:border-gray-800 last:border-0">
              <span className="text-lg font-black text-gray-900 dark:text-white">{s.num}</span>
              <span className="text-xs text-gray-400">{s.lbl}</span>
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-5 gap-2">
            {exams.map((exam, idx) => {
              const p = hasEverPassed(examResults, exam.id);
              const cnt = getAttemptCount(examResults, exam.id);
              const best = getBestScore(examResults, exam.id);
              const tried = cnt > 0;
              const failOnly = tried && !p;
              const numColor = p ? "#22c55e" : failOnly ? "#ef4444" : secMeta.color;
              return (
                <button key={exam.id}
                  onClick={() => push({ screen: "exam", level: n.level, section: n.section, examId: exam.id })}
                  className="flex flex-col items-center py-3 rounded-xl border transition-all"
                  style={{ borderColor: tried ? numColor : undefined, borderWidth: tried ? 2 : 1, backgroundColor: tried ? numColor + "08" : undefined }}>
                  <span className="text-sm font-black" style={{ color: numColor }}>{String(idx + 1).padStart(2, "0")}</span>
                  {tried ? (
                    best !== null
                      ? <span className="text-[10px] font-bold mt-0.5" style={{ color: numColor }}>{best}%</span>
                      : p ? <Check size={12} color={numColor} strokeWidth={3} /> : <X size={12} color={numColor} strokeWidth={3} />
                  ) : (
                    <span className="text-[10px] text-gray-400 mt-0.5">new</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Sections ──
  if (nav.screen === "sections") {
    const n = nav as { screen: "sections"; level: Level };
    const levelMeta = LEVEL_META[n.level];
    const SECTION_DURATIONS: Record<Section, Record<Level, string>> = {
      hoeren: { A1: "20 min", A2: "30 min", B1: "40 min" },
      lesen: { A1: "25 min", A2: "25 min", B1: "65 min" },
      schreiben: { A1: "20 min", A2: "30 min", B1: "60 min" },
      sprechen: { A1: "15 min", A2: "15 min", B1: "15 min" },
    };
    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-950">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <button onClick={back} className="flex items-center gap-1 text-sm font-semibold text-amber-500">
            <ChevronLeft size={18} strokeWidth={2.5} /> Levels
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black" style={{ backgroundColor: levelMeta.color }}>
              {n.level}
            </div>
            <span className="font-black text-gray-900 dark:text-white">{levelMeta.label}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-xs font-bold tracking-wider text-gray-400 mb-3">CHOOSE SECTION</div>
          {SECTIONS.map(sec => {
            const m = SECTION_META[sec];
            const attempted = Object.values(examResults).filter((r: any) =>
              Array.isArray(r) ? false : r.examId?.startsWith(`${n.level.toLowerCase()}_`)
            ).length;
            return (
              <button key={sec} onClick={() => push({ screen: "list", level: n.level, section: sec })}
                className="w-full flex items-center gap-3 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl mb-3 text-left hover:shadow-md transition-all">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: m.color + "20" }}>
                  <SectionIcon section={sec} size={22} color={m.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 dark:text-white">{m.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{m.description}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: m.color + "20", color: m.color }}>
                      <Clock size={9} /> {SECTION_DURATIONS[sec][n.level]}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: m.color + "20", color: m.color }}>30 exams</span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Levels ──
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <GraduationCap size={22} className="text-amber-500" strokeWidth={2.5} />
          <span className="text-xl font-black text-gray-900 dark:text-white">Exams</span>
        </div>
        <button onClick={() => push({ screen: "analytics" })}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300">
          <BarChart2 size={14} /> Analytics
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {/* Hero */}
        <div className="flex flex-col items-center text-center mb-5 pt-2">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mb-3">
            <GraduationCap size={36} color="#fff" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">Goethe Mock Exams</h1>
          <p className="text-sm text-gray-500 mt-1">30 exams per section · A1, A2, B1 · Official format</p>
        </div>
        {/* Info */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl mb-5">
          <div className="font-bold text-sm text-gray-900 dark:text-white mb-1">4 Sections per Level</div>
          <div className="text-xs text-gray-500 leading-relaxed">Hören · Lesen · Schreiben · Sprechen<br />Each section: 30 mock exams · Pass: 60/100</div>
        </div>
        <div className="text-xs font-bold tracking-wider text-gray-400 mb-3">CHOOSE LEVEL</div>
        {LEVELS.map(level => {
          const m = LEVEL_META[level];
          return (
            <button key={level} onClick={() => push({ screen: "sections", level })}
              className="w-full flex items-center gap-3 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl mb-3 text-left hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-base flex-shrink-0" style={{ backgroundColor: m.color }}>
                {level}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 dark:text-white">{m.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{m.description}</div>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {["4 sections", "30 each", `Pass: ${m.passScore}pts`].map(c => (
                    <span key={c} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full">{c}</span>
                  ))}
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
