import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  Animated,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../../../../lib/theme";
import {
  Section,
  Level,
  getExamById,
  SECTION_META,
  HoerenExam,
  LesenExam,
  SchreibenExam,
  SprechenExam,
  MCQQuestion,
  TrueFalseQuestion,
  HoerenPart,
  LesenPart,
} from "../../../../lib/goetheExamData";
import { Storage } from "../../../../lib/storage";

const RESULTS_KEY = "goethe_exam_results_v1";

// ─── MCQ Component ────────────────────────────────────────────
function MCQItem({
  question,
  selectedIndex,
  onSelect,
  showAnswer,
}: {
  question: MCQQuestion;
  selectedIndex: number | null;
  onSelect: (idx: number) => void;
  showAnswer: boolean;
}) {
  const { theme: t } = useTheme();
  return (
    <View style={mcqStyles.container}>
      <Text style={[mcqStyles.questionText, { color: t.text }]}>{question.text}</Text>
      {question.imageHint && (
        <View style={[mcqStyles.imageHint, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
          <Text style={[mcqStyles.imageHintLabel, { color: t.textMuted }]}>📷 Image shows:</Text>
          <Text style={[mcqStyles.imageHintText, { color: t.textSecondary }]}>{question.imageHint}</Text>
        </View>
      )}
      {question.options.map((opt, idx) => {
        let bg = t.surfaceAlt;
        let borderColor = t.border;
        let textColor = t.text;
        if (showAnswer) {
          if (idx === question.correct) { bg = "#4CAF5020"; borderColor = "#4CAF50"; textColor = "#4CAF50"; }
          else if (idx === selectedIndex && idx !== question.correct) { bg = "#F4433620"; borderColor = "#F44336"; textColor = "#F44336"; }
        } else if (idx === selectedIndex) {
          bg = t.primary + "20"; borderColor = t.primary; textColor = t.primary;
        }
        return (
          <TouchableOpacity
            key={idx}
            style={[mcqStyles.option, { backgroundColor: bg, borderColor }]}
            onPress={() => !showAnswer && onSelect(idx)}
            activeOpacity={showAnswer ? 1 : 0.7}
          >
            <View style={[mcqStyles.optionLetter, { borderColor, backgroundColor: bg }]}>
              <Text style={[mcqStyles.optionLetterText, { color: textColor }]}>
                {String.fromCharCode(65 + idx)}
              </Text>
            </View>
            <Text style={[mcqStyles.optionText, { color: textColor }]}>{opt}</Text>
            {showAnswer && idx === question.correct && (
              <Text style={{ color: "#4CAF50", fontSize: 16 }}>✓</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const mcqStyles = StyleSheet.create({
  container: { marginBottom: 20 },
  questionText: { fontSize: 15, fontWeight: "600", marginBottom: 10, lineHeight: 22 },
  imageHint: { borderRadius: 10, borderWidth: 1, padding: 10, marginBottom: 10 },
  imageHintLabel: { fontSize: 11, fontWeight: "700", marginBottom: 2 },
  imageHintText: { fontSize: 13, lineHeight: 18 },
  option: { flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1.5, padding: 12, marginBottom: 8, gap: 10 },
  optionLetter: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  optionLetterText: { fontSize: 13, fontWeight: "700" },
  optionText: { flex: 1, fontSize: 14, lineHeight: 20 },
});

// ─── True/False Component ─────────────────────────────────────
function TFItem({
  question,
  selected,
  onSelect,
  showAnswer,
}: {
  question: TrueFalseQuestion;
  selected: boolean | null;
  onSelect: (v: boolean) => void;
  showAnswer: boolean;
}) {
  const { theme: t } = useTheme();
  const options: Array<{ label: string; value: boolean }> = [
    { label: "Richtig", value: true },
    { label: "Falsch", value: false },
  ];
  return (
    <View style={tfStyles.container}>
      <View style={[tfStyles.audioCtx, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
        <Text style={[tfStyles.audioLabel, { color: t.textMuted }]}>🔊 Audio transcript:</Text>
        <Text style={[tfStyles.audioText, { color: t.textSecondary }]}>{question.audioContext}</Text>
      </View>
      <Text style={[tfStyles.statement, { color: t.text }]}>„{question.statement}"</Text>
      <View style={tfStyles.row}>
        {options.map(({ label, value }) => {
          let bg = t.surfaceAlt;
          let border = t.border;
          let color = t.text;
          if (showAnswer) {
            if (value === question.correct) { bg = "#4CAF5020"; border = "#4CAF50"; color = "#4CAF50"; }
            else if (selected === value && value !== question.correct) { bg = "#F4433620"; border = "#F44336"; color = "#F44336"; }
          } else if (selected === value) {
            bg = t.primary + "20"; border = t.primary; color = t.primary;
          }
          return (
            <TouchableOpacity
              key={label}
              style={[tfStyles.btn, { backgroundColor: bg, borderColor: border, flex: 1 }]}
              onPress={() => !showAnswer && onSelect(value)}
              activeOpacity={showAnswer ? 1 : 0.7}
            >
              <Text style={[tfStyles.btnText, { color }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const tfStyles = StyleSheet.create({
  container: { marginBottom: 20 },
  audioCtx: { borderRadius: 10, borderWidth: 1, padding: 10, marginBottom: 10 },
  audioLabel: { fontSize: 11, fontWeight: "700", marginBottom: 4 },
  audioText: { fontSize: 13, lineHeight: 18, fontStyle: "italic" },
  statement: { fontSize: 15, fontWeight: "600", marginBottom: 12, lineHeight: 22 },
  row: { flexDirection: "row", gap: 10 },
  btn: { borderWidth: 1.5, borderRadius: 10, padding: 14, alignItems: "center" },
  btnText: { fontSize: 15, fontWeight: "700" },
});

// ─── Main Exam Screen ─────────────────────────────────────────
export default function GoetheExamRunner() {
  const { theme: t } = useTheme();
  const router = useRouter();
  const { level, section, examId } = useLocalSearchParams<{
    level: string; section: string; examId: string;
  }>();

  const lvl = level as Level;
  const sec = section as Section;
  const exam = getExamById(lvl, sec, examId as string);
  const sectionMeta = SECTION_META[sec];

  // Per-question answer state
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);
  const [currentPart, setCurrentPart] = useState(0);
  const [writingTexts, setWritingTexts] = useState<Record<string, string>>({});
  const [showModelAnswer, setShowModelAnswer] = useState<Record<string, boolean>>({});

  const scrollRef = useRef<ScrollView>(null);

  if (!exam) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: t.text, fontSize: 18 }}>Exam not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: t.primary, fontSize: 16 }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ─── Scoring ─────────────────────────────────────────────────
  const calculateScore = () => {
    if (sec === "schreiben" || sec === "sprechen") return { correct: 0, total: 0 };

    let correct = 0;
    let total = 0;

    if (sec === "hoeren") {
      const h = exam as HoerenExam;
      for (const part of h.parts) {
        if (part.type === "picture_mcq" || part.type === "mcq") {
          for (const q of part.questions) {
            total++;
            if (answers[q.id] === q.correct) correct++;
          }
        } else if (part.type === "true_false") {
          for (const q of part.questions) {
            total++;
            if (answers[q.id] === q.correct) correct++;
          }
        }
      }
    } else if (sec === "lesen") {
      const l = exam as LesenExam;
      for (const part of l.parts) {
        if (part.type === "mcq") {
          for (const q of part.questions) {
            total++;
            if (answers[q.id] === q.correct) correct++;
          }
        } else if (part.type === "matching") {
          // Count correct matches
          const task = part.task;
          for (const item of task.items) {
            total++;
            if (answers[`match_${item.label}`] === task.correctMap[item.label]) correct++;
          }
        }
      }
    }
    return { correct, total };
  };

  const handleSubmit = async () => {
    const s = calculateScore();
    setScore(s);
    setShowAnswers(true);
    setSubmitted(true);
    scrollRef.current?.scrollTo({ y: 0, animated: true });

    // Save result
    const passScore = 60;
    const percentage = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
    const result = {
      examId: exam.id,
      score: percentage,
      total: 100,
      passed: percentage >= passScore,
      date: new Date().toISOString(),
    };
    const existing = (JSON.parse(await Storage.getItem(RESULTS_KEY) ?? "{}")) || {};
    existing[exam.id] = result;
    await Storage.setItem(RESULTS_KEY, JSON.stringify(existing));
  };

  // ─── Render: HÖREN ───────────────────────────────────────────
  const renderHoeren = () => {
    const h = exam as HoerenExam;
    const parts = h.parts;
    const part = parts[currentPart];

    return (
      <View>
        {/* Part nav */}
        <View style={styles.partNav}>
          {parts.map((p, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.partBtn,
                { backgroundColor: currentPart === idx ? sectionMeta.color : t.surfaceAlt, borderColor: t.border },
              ]}
              onPress={() => { setCurrentPart(idx); scrollRef.current?.scrollTo({ y: 0, animated: true }); }}
            >
              <Text style={[styles.partBtnText, { color: currentPart === idx ? "#fff" : t.text }]}>
                Teil {idx + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.partHeader, { backgroundColor: sectionMeta.color + "15", borderColor: sectionMeta.color + "40" }]}>
          <Text style={[styles.partTitle, { color: sectionMeta.color }]}>{part.title}</Text>
          <Text style={[styles.partPoints, { color: t.textMuted }]}>{part.points} Punkte</Text>
        </View>

        {/* Audio simulation notice */}
        <View style={[styles.audioNotice, { backgroundColor: "#5C6BC020", borderColor: "#5C6BC040" }]}>
          <Text style={[styles.audioNoticeTitle, { color: "#5C6BC0" }]}>🎧 Listening Mode</Text>
          <Text style={[styles.audioNoticeText, { color: t.textSecondary }]}>
            In the real exam, you hear audio recordings. Here, transcripts and context clues are provided so you can practice the question format.
          </Text>
        </View>

        {part.type === "picture_mcq" || part.type === "mcq" ? (
          part.questions.map((q) => (
            <MCQItem
              key={q.id}
              question={q}
              selectedIndex={answers[q.id] ?? null}
              onSelect={(idx) => setAnswers((prev) => ({ ...prev, [q.id]: idx }))}
              showAnswer={showAnswers}
            />
          ))
        ) : part.type === "true_false" ? (
          part.questions.map((q) => (
            <TFItem
              key={q.id}
              question={q}
              selected={answers[q.id] ?? null}
              onSelect={(v) => setAnswers((prev) => ({ ...prev, [q.id]: v }))}
              showAnswer={showAnswers}
            />
          ))
        ) : null}

        {/* Part navigation buttons */}
        <View style={styles.partNavButtons}>
          {currentPart > 0 && (
            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}
              onPress={() => { setCurrentPart(currentPart - 1); scrollRef.current?.scrollTo({ y: 0, animated: true }); }}
            >
              <Text style={[styles.navBtnText, { color: t.text }]}>‹ Previous Part</Text>
            </TouchableOpacity>
          )}
          {currentPart < parts.length - 1 ? (
            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: sectionMeta.color, flex: 1 }]}
              onPress={() => { setCurrentPart(currentPart + 1); scrollRef.current?.scrollTo({ y: 0, animated: true }); }}
            >
              <Text style={[styles.navBtnText, { color: "#fff" }]}>Next Part ›</Text>
            </TouchableOpacity>
          ) : !submitted ? (
            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: "#4CAF50", flex: 1 }]}
              onPress={handleSubmit}
            >
              <Text style={[styles.navBtnText, { color: "#fff" }]}>Submit Exam ✓</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  // ─── Render: LESEN ───────────────────────────────────────────
  const renderLesen = () => {
    const l = exam as LesenExam;
    const parts = l.parts;
    const part = parts[currentPart];

    return (
      <View>
        {/* Part nav */}
        <View style={styles.partNav}>
          {parts.map((p, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.partBtn,
                { backgroundColor: currentPart === idx ? sectionMeta.color : t.surfaceAlt, borderColor: t.border },
              ]}
              onPress={() => { setCurrentPart(idx); scrollRef.current?.scrollTo({ y: 0, animated: true }); }}
            >
              <Text style={[styles.partBtnText, { color: currentPart === idx ? "#fff" : t.text }]}>
                Teil {idx + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.partHeader, { backgroundColor: sectionMeta.color + "15", borderColor: sectionMeta.color + "40" }]}>
          <Text style={[styles.partTitle, { color: sectionMeta.color }]}>{part.title}</Text>
          <Text style={[styles.partPoints, { color: t.textMuted }]}>{part.points} Punkte</Text>
        </View>

        {part.type === "matching" ? (
          <View>
            <Text style={[styles.taskInstructions, { color: t.textSecondary }]}>
              Ordnen Sie die Anzeigen (A–E) den passenden Personen zu.
            </Text>
            {part.task.items.map((item) => (
              <View key={item.label} style={[styles.matchItem, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
                <Text style={[styles.matchLabel, { color: sectionMeta.color }]}>{item.label}</Text>
                <Text style={[styles.matchContent, { color: t.text }]}>{item.content}</Text>
                {showAnswers && (
                  <Text style={[styles.matchAnswer, { color: "#4CAF50" }]}>
                    ✓ {part.task.correctMap[item.label]}
                  </Text>
                )}
              </View>
            ))}
            <Text style={[styles.subHeader, { color: t.text }]}>Personen:</Text>
            {part.task.targets.map((target, idx) => (
              <View key={idx} style={[styles.targetItem, { borderColor: t.border }]}>
                <Text style={[styles.targetText, { color: t.textSecondary }]}>{target}</Text>
              </View>
            ))}
          </View>
        ) : part.type === "fill_gap" ? (
          <View>
            <Text style={[styles.taskInstructions, { color: t.textSecondary }]}>
              Füllen Sie die Lücken aus. Wählen Sie das passende Wort.
            </Text>
            <View style={[styles.passageBox, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
              <Text style={[styles.passageText, { color: t.text }]}>{part.task.textWithGaps}</Text>
            </View>
            {Object.entries(part.task.options).map(([gapNum, opts]) => (
              <View key={gapNum} style={styles.gapQuestion}>
                <Text style={[styles.gapLabel, { color: t.text }]}>Lücke {gapNum}:</Text>
                <View style={styles.gapOptions}>
                  {opts.map((opt) => {
                    const isSelected = answers[`gap_${gapNum}`] === opt;
                    const isCorrect = part.task.answers[gapNum] === opt;
                    let bg = t.surfaceAlt;
                    let border = t.border;
                    let color = t.text;
                    if (showAnswers) {
                      if (isCorrect) { bg = "#4CAF5020"; border = "#4CAF50"; color = "#4CAF50"; }
                      else if (isSelected && !isCorrect) { bg = "#F4433620"; border = "#F44336"; color = "#F44336"; }
                    } else if (isSelected) {
                      bg = t.primary + "20"; border = t.primary; color = t.primary;
                    }
                    return (
                      <TouchableOpacity
                        key={opt}
                        style={[styles.gapOpt, { backgroundColor: bg, borderColor: border }]}
                        onPress={() => !showAnswers && setAnswers((prev) => ({ ...prev, [`gap_${gapNum}`]: opt }))}
                      >
                        <Text style={[styles.gapOptText, { color }]}>{opt}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        ) : part.type === "mcq" ? (
          <View>
            <View style={[styles.passageBox, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
              <Text style={[styles.passageText, { color: t.text }]}>{part.passage}</Text>
            </View>
            {part.questions.map((q) => (
              <MCQItem
                key={q.id}
                question={q}
                selectedIndex={answers[q.id] ?? null}
                onSelect={(idx) => setAnswers((prev) => ({ ...prev, [q.id]: idx }))}
                showAnswer={showAnswers}
              />
            ))}
          </View>
        ) : null}

        {/* Part navigation buttons */}
        <View style={styles.partNavButtons}>
          {currentPart > 0 && (
            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}
              onPress={() => { setCurrentPart(currentPart - 1); scrollRef.current?.scrollTo({ y: 0, animated: true }); }}
            >
              <Text style={[styles.navBtnText, { color: t.text }]}>‹ Previous</Text>
            </TouchableOpacity>
          )}
          {currentPart < parts.length - 1 ? (
            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: sectionMeta.color, flex: 1 }]}
              onPress={() => { setCurrentPart(currentPart + 1); scrollRef.current?.scrollTo({ y: 0, animated: true }); }}
            >
              <Text style={[styles.navBtnText, { color: "#fff" }]}>Next Part ›</Text>
            </TouchableOpacity>
          ) : !submitted ? (
            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: "#4CAF50", flex: 1 }]}
              onPress={handleSubmit}
            >
              <Text style={[styles.navBtnText, { color: "#fff" }]}>Submit Exam ✓</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  // ─── Render: SCHREIBEN ────────────────────────────────────────
  const renderSchreiben = () => {
    const s = exam as SchreibenExam;
    return (
      <View>
        <View style={[styles.audioNotice, { backgroundColor: "#EF6C0015", borderColor: "#EF6C0040" }]}>
          <Text style={[styles.audioNoticeTitle, { color: "#EF6C00" }]}>✏️ Writing Task</Text>
          <Text style={[styles.audioNoticeText, { color: t.textSecondary }]}>
            Write your response in the text box. After submitting, compare with the model answer and use the assessment criteria to self-evaluate.
          </Text>
        </View>

        {s.tasks.map((task, idx) => (
          <View key={task.id} style={[styles.writingTask, { borderColor: t.border }]}>
            <View style={[styles.writingTaskHeader, { backgroundColor: "#EF6C0015" }]}>
              <Text style={[styles.writingTaskNum, { color: "#EF6C00" }]}>Aufgabe {idx + 1}</Text>
              <Text style={[styles.writingTaskTitle, { color: t.text }]}>{task.title}</Text>
              <Text style={[styles.writingTaskPoints, { color: t.textMuted }]}>{task.points} Punkte</Text>
            </View>

            <View style={styles.writingTaskBody}>
              {/* Prompt */}
              <View style={[styles.promptBox, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
                <Text style={[styles.promptLabel, { color: t.textMuted }]}>AUFGABE</Text>
                <Text style={[styles.promptText, { color: t.text }]}>{task.prompt}</Text>
                {task.wordLimit && (
                  <Text style={[styles.wordLimit, { color: "#EF6C00" }]}>📏 {task.wordLimit}</Text>
                )}
              </View>

              {/* Form fields */}
              {task.type === "form" && task.fields ? (
                <View style={styles.formFields}>
                  {task.fields.map((field) => (
                    <View key={field.label} style={styles.formField}>
                      <Text style={[styles.fieldLabel, { color: t.textSecondary }]}>{field.label}</Text>
                      <TextInput
                        style={[styles.fieldInput, { backgroundColor: t.surfaceAlt, borderColor: t.border, color: t.text }]}
                        placeholder={field.placeholder}
                        placeholderTextColor={t.textMuted}
                        value={writingTexts[`form_${task.id}_${field.label}`] || ""}
                        onChangeText={(v) => setWritingTexts((prev) => ({ ...prev, [`form_${task.id}_${field.label}`]: v }))}
                        editable={!submitted}
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <TextInput
                  style={[
                    styles.writingInput,
                    { backgroundColor: t.surfaceAlt, borderColor: t.border, color: t.text },
                  ]}
                  placeholder="Schreiben Sie hier Ihren Text..."
                  placeholderTextColor={t.textMuted}
                  multiline
                  textAlignVertical="top"
                  value={writingTexts[task.id] || ""}
                  onChangeText={(v) => setWritingTexts((prev) => ({ ...prev, [task.id]: v }))}
                  editable={!submitted}
                />
              )}

              {/* Word count */}
              {writingTexts[task.id] && (
                <Text style={[styles.wordCount, { color: t.textMuted }]}>
                  {writingTexts[task.id].split(/\s+/).filter(Boolean).length} Wörter
                </Text>
              )}

              {/* Model answer toggle */}
              {submitted && (
                <View>
                  <TouchableOpacity
                    style={[styles.modelAnswerBtn, { borderColor: "#EF6C00" }]}
                    onPress={() =>
                      setShowModelAnswer((prev) => ({ ...prev, [task.id]: !prev[task.id] }))
                    }
                  >
                    <Text style={[styles.modelAnswerBtnText, { color: "#EF6C00" }]}>
                      {showModelAnswer[task.id] ? "▲ Hide" : "▼ Show"} Model Answer
                    </Text>
                  </TouchableOpacity>

                  {showModelAnswer[task.id] && (
                    <View>
                      <View style={[styles.modelAnswerBox, { backgroundColor: "#4CAF5010", borderColor: "#4CAF5040" }]}>
                        <Text style={[styles.modelAnswerLabel, { color: "#4CAF50" }]}>✓ Musterlösung</Text>
                        <Text style={[styles.modelAnswerText, { color: t.text }]}>{task.modelAnswer}</Text>
                      </View>
                      <View style={[styles.criteriaBox, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
                        <Text style={[styles.criteriaLabel, { color: t.textMuted }]}>ASSESSMENT CRITERIA</Text>
                        {task.assessmentCriteria.map((c, ci) => (
                          <Text key={ci} style={[styles.criteriaItem, { color: t.textSecondary }]}>
                            • {c}
                          </Text>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        ))}

        {!submitted && (
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: "#4CAF50" }]}
            onPress={async () => {
              setSubmitted(true);
              setShowAnswers(true);
              const result = { examId: exam.id, score: 0, total: 0, passed: false, date: new Date().toISOString(), type: "writing" };
              const existing = (JSON.parse(await Storage.getItem(RESULTS_KEY) ?? "{}")) || {};
              existing[exam.id] = result;
              await Storage.setItem(RESULTS_KEY, JSON.stringify(existing));
            }}
          >
            <Text style={[styles.navBtnText, { color: "#fff" }]}>Submit & See Model Answers ✓</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // ─── Render: SPRECHEN ─────────────────────────────────────────
  const renderSprechen = () => {
    const s = exam as SprechenExam;
    const parts = s.parts;
    const part = parts[currentPart];

    return (
      <View>
        {/* Part nav */}
        <View style={styles.partNav}>
          {parts.map((p, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.partBtn,
                { backgroundColor: currentPart === idx ? sectionMeta.color : t.surfaceAlt, borderColor: t.border },
              ]}
              onPress={() => { setCurrentPart(idx); scrollRef.current?.scrollTo({ y: 0, animated: true }); }}
            >
              <Text style={[styles.partBtnText, { color: currentPart === idx ? "#fff" : t.text }]}>
                Teil {idx + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.partHeader, { backgroundColor: sectionMeta.color + "15", borderColor: sectionMeta.color + "40" }]}>
          <Text style={[styles.partTitle, { color: sectionMeta.color }]}>{part.title}</Text>
          <Text style={[styles.partPoints, { color: t.textMuted }]}>{part.points} Punkte</Text>
        </View>

        <View style={[styles.audioNotice, { backgroundColor: "#AD145715", borderColor: "#AD145740" }]}>
          <Text style={[styles.audioNoticeTitle, { color: "#AD1457" }]}>🎤 Speaking Practice</Text>
          <Text style={[styles.audioNoticeText, { color: t.textSecondary }]}>
            Read the prompts aloud. In the real exam, you speak with a partner or examiner. Use the sample answers as a reference.
          </Text>
        </View>

        {/* Render based on type */}
        {part.type === "self_intro" && (
          <View>
            <Text style={[styles.sprechInstructions, { color: t.textSecondary }]}>
              Stellen Sie sich vor. Sprechen Sie über folgende Punkte:
            </Text>
            {part.prompts.map((prompt, idx) => (
              <View key={idx} style={[styles.promptCard, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
                <Text style={[styles.promptCardNum, { color: sectionMeta.color }]}>{idx + 1}</Text>
                <Text style={[styles.promptCardText, { color: t.text }]}>{prompt}</Text>
              </View>
            ))}
          </View>
        )}

        {part.type === "question_cards" && (
          <View>
            <Text style={[styles.sprechInstructions, { color: t.textSecondary }]}>
              Stellen Sie Ihrem Partner diese Fragen und antworten Sie auch:
            </Text>
            {part.cards.map((card, idx) => (
              <View key={idx} style={[styles.sprechCard, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
                <Text style={[styles.sprechQuestion, { color: t.text }]}>❓ {card.question}</Text>
                <TouchableOpacity
                  style={[styles.sampleBtn, { borderColor: sectionMeta.color }]}
                  onPress={() =>
                    setShowModelAnswer((prev) => ({
                      ...prev,
                      [`card_${idx}`]: !prev[`card_${idx}`],
                    }))
                  }
                >
                  <Text style={[styles.sampleBtnText, { color: sectionMeta.color }]}>
                    {showModelAnswer[`card_${idx}`] ? "▲ Hide" : "▼ Sample Answer"}
                  </Text>
                </TouchableOpacity>
                {showModelAnswer[`card_${idx}`] && (
                  <View style={[styles.sampleAnswerBox, { backgroundColor: sectionMeta.color + "10", borderColor: sectionMeta.color + "30" }]}>
                    <Text style={[styles.sampleAnswerText, { color: t.text }]}>{card.sampleAnswer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {part.type === "picture_description" && (
          <View>
            <Text style={[styles.sprechInstructions, { color: t.textSecondary }]}>
              Beschreiben Sie das Bild und beantworten Sie die Fragen:
            </Text>
            <View style={[styles.imageDescBox, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
              <Text style={[styles.imageDescLabel, { color: t.textMuted }]}>🖼️ Bild zeigt:</Text>
              <Text style={[styles.imageDescText, { color: t.text }]}>{part.imageDescription}</Text>
            </View>
            {part.prompts.map((p, idx) => (
              <View key={idx} style={[styles.promptCard, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
                <Text style={[styles.promptCardNum, { color: sectionMeta.color }]}>Q{idx + 1}</Text>
                <Text style={[styles.promptCardText, { color: t.text }]}>{p}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={[styles.sampleBtn, { borderColor: sectionMeta.color, marginTop: 8 }]}
              onPress={() => setShowModelAnswer((prev) => ({ ...prev, pic: !prev["pic"] }))}
            >
              <Text style={[styles.sampleBtnText, { color: sectionMeta.color }]}>
                {showModelAnswer["pic"] ? "▲ Hide" : "▼ Sample Answer"}
              </Text>
            </TouchableOpacity>
            {showModelAnswer["pic"] && (
              <View style={[styles.sampleAnswerBox, { backgroundColor: sectionMeta.color + "10", borderColor: sectionMeta.color + "30" }]}>
                <Text style={[styles.sampleAnswerText, { color: t.text }]}>{part.sampleAnswer}</Text>
              </View>
            )}
          </View>
        )}

        {part.type === "role_play" && (
          <View>
            <View style={[styles.scenarioBox, { backgroundColor: sectionMeta.color + "15", borderColor: sectionMeta.color + "40" }]}>
              <Text style={[styles.scenarioLabel, { color: sectionMeta.color }]}>SZENARIO</Text>
              <Text style={[styles.scenarioText, { color: t.text }]}>{part.scenario}</Text>
            </View>
            <Text style={[styles.sprechInstructions, { color: t.textSecondary }]}>
              Beispielaussagen für das Rollenspiel:
            </Text>
            {part.sampleLines.map((line, idx) => (
              <View key={idx} style={[styles.sampleLine, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
                <Text style={[styles.sampleLineNum, { color: sectionMeta.color }]}>💬</Text>
                <Text style={[styles.sampleLineText, { color: t.text }]}>{line}</Text>
              </View>
            ))}
          </View>
        )}

        {part.type === "topic_presentation" && (
          <View>
            <View style={[styles.scenarioBox, { backgroundColor: sectionMeta.color + "15", borderColor: sectionMeta.color + "40" }]}>
              <Text style={[styles.scenarioLabel, { color: sectionMeta.color }]}>THEMA</Text>
              <Text style={[styles.scenarioText, { color: t.text }]}>{part.topic}</Text>
            </View>
            <Text style={[styles.sprechInstructions, { color: t.textSecondary }]}>Gliederung für Ihre Präsentation:</Text>
            {part.outline.map((item, idx) => (
              <View key={idx} style={[styles.outlineItem, { borderColor: t.border }]}>
                <Text style={[styles.outlineNum, { color: sectionMeta.color }]}>{idx + 1}.</Text>
                <Text style={[styles.outlineText, { color: t.text }]}>{item}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={[styles.sampleBtn, { borderColor: sectionMeta.color, marginTop: 12 }]}
              onPress={() => setShowModelAnswer((prev) => ({ ...prev, pres: !prev["pres"] }))}
            >
              <Text style={[styles.sampleBtnText, { color: sectionMeta.color }]}>
                {showModelAnswer["pres"] ? "▲ Hide" : "▼ Sample Presentation"}
              </Text>
            </TouchableOpacity>
            {showModelAnswer["pres"] && (
              <View style={[styles.sampleAnswerBox, { backgroundColor: sectionMeta.color + "10", borderColor: sectionMeta.color + "30" }]}>
                <Text style={[styles.sampleAnswerText, { color: t.text }]}>{part.sampleAnswer}</Text>
              </View>
            )}
          </View>
        )}

        {part.type === "discussion" && (
          <View>
            <View style={[styles.scenarioBox, { backgroundColor: sectionMeta.color + "15", borderColor: sectionMeta.color + "40" }]}>
              <Text style={[styles.scenarioLabel, { color: sectionMeta.color }]}>DISKUSSIONSTHEMA</Text>
              <Text style={[styles.scenarioText, { color: t.text }]}>{part.topic}</Text>
            </View>
            {part.prompts.map((p, idx) => (
              <View key={idx} style={[styles.promptCard, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
                <Text style={[styles.promptCardNum, { color: sectionMeta.color }]}>•</Text>
                <Text style={[styles.promptCardText, { color: t.text }]}>{p}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={[styles.sampleBtn, { borderColor: sectionMeta.color, marginTop: 8 }]}
              onPress={() => setShowModelAnswer((prev) => ({ ...prev, disc: !prev["disc"] }))}
            >
              <Text style={[styles.sampleBtnText, { color: sectionMeta.color }]}>
                {showModelAnswer["disc"] ? "▲ Hide" : "▼ Sample Response"}
              </Text>
            </TouchableOpacity>
            {showModelAnswer["disc"] && (
              <View style={[styles.sampleAnswerBox, { backgroundColor: sectionMeta.color + "10", borderColor: sectionMeta.color + "30" }]}>
                <Text style={[styles.sampleAnswerText, { color: t.text }]}>{part.sampleAnswer}</Text>
              </View>
            )}
          </View>
        )}

        {part.type === "planning" && (
          <View>
            <View style={[styles.scenarioBox, { backgroundColor: sectionMeta.color + "15", borderColor: sectionMeta.color + "40" }]}>
              <Text style={[styles.scenarioLabel, { color: sectionMeta.color }]}>PLANUNGSAUFGABE</Text>
              <Text style={[styles.scenarioText, { color: t.text }]}>{part.scenario}</Text>
            </View>
            <Text style={[styles.sprechInstructions, { color: t.textSecondary }]}>
              Sprechen Sie mit Ihrem Partner über diese Punkte:
            </Text>
            {part.suggestions.map((s, idx) => (
              <View key={idx} style={[styles.promptCard, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
                <Text style={[styles.promptCardNum, { color: sectionMeta.color }]}>{idx + 1}</Text>
                <Text style={[styles.promptCardText, { color: t.text }]}>{s}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={[styles.sampleBtn, { borderColor: sectionMeta.color, marginTop: 8 }]}
              onPress={() => setShowModelAnswer((prev) => ({ ...prev, plan: !prev["plan"] }))}
            >
              <Text style={[styles.sampleBtnText, { color: sectionMeta.color }]}>
                {showModelAnswer["plan"] ? "▲ Hide" : "▼ Sample Language"}
              </Text>
            </TouchableOpacity>
            {showModelAnswer["plan"] && (
              <View style={[styles.sampleAnswerBox, { backgroundColor: sectionMeta.color + "10", borderColor: sectionMeta.color + "30" }]}>
                <Text style={[styles.sampleAnswerText, { color: t.text }]}>{part.sampleAnswer}</Text>
              </View>
            )}
          </View>
        )}

        {/* Part navigation */}
        <View style={styles.partNavButtons}>
          {currentPart > 0 && (
            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}
              onPress={() => { setCurrentPart(currentPart - 1); scrollRef.current?.scrollTo({ y: 0, animated: true }); }}
            >
              <Text style={[styles.navBtnText, { color: t.text }]}>‹ Previous</Text>
            </TouchableOpacity>
          )}
          {currentPart < parts.length - 1 ? (
            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: sectionMeta.color, flex: 1 }]}
              onPress={() => { setCurrentPart(currentPart + 1); scrollRef.current?.scrollTo({ y: 0, animated: true }); }}
            >
              <Text style={[styles.navBtnText, { color: "#fff" }]}>Next Part ›</Text>
            </TouchableOpacity>
          ) : !submitted ? (
            <TouchableOpacity
              style={[styles.navBtn, { backgroundColor: "#4CAF50", flex: 1 }]}
              onPress={async () => {
                setSubmitted(true);
                const result = { examId: exam.id, score: 0, total: 0, passed: true, date: new Date().toISOString(), type: "speaking" };
                const existing = (JSON.parse(await Storage.getItem(RESULTS_KEY) ?? "{}")) || {};
                existing[exam.id] = result;
                await Storage.setItem(RESULTS_KEY, JSON.stringify(existing));
              }}
            >
              <Text style={[styles.navBtnText, { color: "#fff" }]}>Complete Practice ✓</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  // ─── Results Banner ───────────────────────────────────────────
  const renderResults = () => {
    if (!submitted) return null;
    if (sec === "sprechen") {
      return (
        <View style={[styles.resultBanner, { backgroundColor: "#4CAF5015", borderColor: "#4CAF5040" }]}>
          <Text style={[styles.resultTitle, { color: "#4CAF50" }]}>✓ Practice Complete!</Text>
          <Text style={[styles.resultText, { color: "#4CAF50" }]}>
            Speaking practice completed. In the real exam, an examiner evaluates your fluency, grammar, pronunciation, and communication strategies.
          </Text>
          <TouchableOpacity
            style={[styles.backToListBtn, { backgroundColor: "#4CAF50" }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backToListBtnText}>Back to Exam List</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (sec === "schreiben") {
      return (
        <View style={[styles.resultBanner, { backgroundColor: "#EF6C0015", borderColor: "#EF6C0040" }]}>
          <Text style={[styles.resultTitle, { color: "#EF6C00" }]}>✓ Submitted!</Text>
          <Text style={[styles.resultText, { color: "#EF6C00" }]}>
            Compare your text with the model answer and use the assessment criteria to self-grade your writing.
          </Text>
          <TouchableOpacity
            style={[styles.backToListBtn, { backgroundColor: "#EF6C00" }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backToListBtnText}>Back to Exam List</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (!score) return null;
    const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    const passed = pct >= 60;
    return (
      <View
        style={[
          styles.resultBanner,
          { backgroundColor: passed ? "#4CAF5015" : "#F4433615", borderColor: passed ? "#4CAF5040" : "#F4433640" },
        ]}
      >
        <Text style={[styles.resultTitle, { color: passed ? "#4CAF50" : "#F44336" }]}>
          {passed ? "✓ Bestanden!" : "✗ Nicht bestanden"}
        </Text>
        <Text style={[styles.resultScore, { color: passed ? "#4CAF50" : "#F44336" }]}>
          {score.correct}/{score.total} correct · {pct}%
        </Text>
        <Text style={[styles.resultText, { color: t.textSecondary }]}>
          {passed ? "Excellent work! Your answers are highlighted in green." : "Review the correct answers highlighted in green and try again."}
        </Text>
        <TouchableOpacity
          style={[styles.backToListBtn, { backgroundColor: passed ? "#4CAF50" : "#F44336" }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backToListBtnText}>Back to Exam List</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ─── Main Render ──────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }}>
      <StatusBar barStyle={t.dark ? "light-content" : "dark-content"} backgroundColor={t.background} />

      {/* Top Bar */}
      <View style={[styles.topBar, { backgroundColor: t.surface, borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.topBackBtn}>
          <Text style={[styles.topBackText, { color: t.primary }]}>‹</Text>
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={[styles.topTitle, { color: t.text }]}>{exam.title}</Text>
          <Text style={[styles.topSub, { color: t.textMuted }]}>
            {sectionMeta.icon} {lvl} · {sectionMeta.label} · {exam.durationMinutes} min
          </Text>
        </View>
        <View style={[styles.topBadge, { backgroundColor: sectionMeta.color + "20" }]}>
          <Text style={[styles.topBadgeText, { color: sectionMeta.color }]}>{exam.totalPoints}pt</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Results Banner (shown after submit) */}
        {renderResults()}

        {/* Instructions */}
        {!submitted && (
          <View style={[styles.instructionsBox, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}>
            <Text style={[styles.instructionsText, { color: t.textSecondary }]}>{exam.instructions}</Text>
          </View>
        )}

        {/* Section-specific content */}
        {sec === "hoeren" && renderHoeren()}
        {sec === "lesen" && renderLesen()}
        {sec === "schreiben" && renderSchreiben()}
        {sec === "sprechen" && renderSprechen()}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  topBackBtn: { padding: 4 },
  topBackText: { fontSize: 26, fontWeight: "300" },
  topCenter: { flex: 1 },
  topTitle: { fontSize: 15, fontWeight: "700" },
  topSub: { fontSize: 12, marginTop: 1 },
  topBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  topBadgeText: { fontSize: 13, fontWeight: "700" },
  scrollContent: { padding: 16 },
  instructionsBox: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 20 },
  instructionsText: { fontSize: 13, lineHeight: 20 },
  partNav: { flexDirection: "row", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  partBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  partBtnText: { fontSize: 13, fontWeight: "600" },
  partHeader: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  partTitle: { fontSize: 15, fontWeight: "700", flex: 1 },
  partPoints: { fontSize: 13, fontWeight: "600" },
  audioNotice: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 20 },
  audioNoticeTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  audioNoticeText: { fontSize: 13, lineHeight: 19 },
  partNavButtons: { flexDirection: "row", gap: 10, marginTop: 24 },
  navBtn: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 14, alignItems: "center" },
  navBtnText: { fontSize: 15, fontWeight: "700" },
  passageBox: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 16 },
  passageText: { fontSize: 14, lineHeight: 22 },
  taskInstructions: { fontSize: 13, lineHeight: 20, marginBottom: 12 },
  matchItem: { borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 8 },
  matchLabel: { fontSize: 12, fontWeight: "700", marginBottom: 4 },
  matchContent: { fontSize: 14, lineHeight: 20 },
  matchAnswer: { fontSize: 13, marginTop: 6, fontWeight: "600" },
  targetItem: { borderBottomWidth: 1, paddingVertical: 10 },
  targetText: { fontSize: 13, lineHeight: 18 },
  subHeader: { fontSize: 14, fontWeight: "700", marginTop: 16, marginBottom: 8 },
  gapQuestion: { marginBottom: 16 },
  gapLabel: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
  gapOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  gapOpt: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  gapOptText: { fontSize: 14, fontWeight: "600" },
  writingTask: { borderRadius: 16, borderWidth: 1, marginBottom: 20, overflow: "hidden" },
  writingTaskHeader: { padding: 14 },
  writingTaskNum: { fontSize: 12, fontWeight: "700", marginBottom: 2 },
  writingTaskTitle: { fontSize: 16, fontWeight: "700" },
  writingTaskPoints: { fontSize: 12, marginTop: 2 },
  writingTaskBody: { padding: 14 },
  promptBox: { borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 12 },
  promptLabel: { fontSize: 11, fontWeight: "700", marginBottom: 6, letterSpacing: 0.5 },
  promptText: { fontSize: 14, lineHeight: 21 },
  wordLimit: { fontSize: 12, marginTop: 8, fontWeight: "600" },
  formFields: { gap: 10 },
  formField: {},
  fieldLabel: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  fieldInput: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14 },
  writingInput: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, minHeight: 140, lineHeight: 22 },
  wordCount: { fontSize: 12, textAlign: "right", marginTop: 6 },
  modelAnswerBtn: { borderWidth: 1.5, borderRadius: 10, padding: 12, alignItems: "center", marginTop: 12 },
  modelAnswerBtnText: { fontSize: 14, fontWeight: "700" },
  modelAnswerBox: { borderRadius: 10, borderWidth: 1, padding: 14, marginTop: 10 },
  modelAnswerLabel: { fontSize: 12, fontWeight: "700", marginBottom: 6 },
  modelAnswerText: { fontSize: 14, lineHeight: 22 },
  criteriaBox: { borderRadius: 10, borderWidth: 1, padding: 12, marginTop: 8 },
  criteriaLabel: { fontSize: 11, fontWeight: "700", marginBottom: 8, letterSpacing: 0.5 },
  criteriaItem: { fontSize: 13, lineHeight: 22 },
  resultBanner: { borderRadius: 16, borderWidth: 1, padding: 20, marginBottom: 20 },
  resultTitle: { fontSize: 20, fontWeight: "800", marginBottom: 6 },
  resultScore: { fontSize: 28, fontWeight: "800", marginBottom: 8 },
  resultText: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  backToListBtn: { borderRadius: 12, padding: 14, alignItems: "center" },
  backToListBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  sprechInstructions: { fontSize: 13, lineHeight: 20, marginBottom: 12 },
  promptCard: { flexDirection: "row", borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 8, gap: 10, alignItems: "flex-start" },
  promptCardNum: { fontSize: 15, fontWeight: "800", width: 20 },
  promptCardText: { flex: 1, fontSize: 14, lineHeight: 21 },
  sprechCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 12 },
  sprechQuestion: { fontSize: 15, fontWeight: "600", lineHeight: 22, marginBottom: 10 },
  sampleBtn: { borderWidth: 1.5, borderRadius: 10, padding: 10, alignItems: "center" },
  sampleBtnText: { fontSize: 13, fontWeight: "700" },
  sampleAnswerBox: { borderRadius: 10, borderWidth: 1, padding: 12, marginTop: 10 },
  sampleAnswerText: { fontSize: 14, lineHeight: 22 },
  imageDescBox: { borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 12 },
  imageDescLabel: { fontSize: 11, fontWeight: "700", marginBottom: 4 },
  imageDescText: { fontSize: 14, lineHeight: 20 },
  scenarioBox: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 16 },
  scenarioLabel: { fontSize: 11, fontWeight: "700", marginBottom: 4, letterSpacing: 0.5 },
  scenarioText: { fontSize: 15, lineHeight: 23, fontWeight: "500" },
  sampleLine: { flexDirection: "row", borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 8, gap: 10, alignItems: "flex-start" },
  sampleLineNum: { fontSize: 16 },
  sampleLineText: { flex: 1, fontSize: 14, lineHeight: 21 },
  outlineItem: { flexDirection: "row", borderBottomWidth: 1, paddingVertical: 10, gap: 10 },
  outlineNum: { fontSize: 15, fontWeight: "800", width: 20 },
  outlineText: { flex: 1, fontSize: 14, lineHeight: 21 },
});
