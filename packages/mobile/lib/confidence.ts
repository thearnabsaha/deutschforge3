import type { StudyWord } from "../app/(tabs)/study";

export interface ExamHistoryEntry {
  id: string;
  setId: string;
  setName: string;
  date: string;
  score: number;
  total: number;
  grade: string;
  durationSec: number;
  wrongWordIds: string[];
}

export const EXAM_HISTORY_KEY = "exam_history_v1";

/**
 * Compute 0–100 confidence score for a single word based on FSRS data.
 * stability: how long (days) memory lasts. >30 days = strong.
 * reps: number of times reviewed
 * lapses: number of times forgotten
 */
export function wordConfidence(word: StudyWord): number {
  const stability = word.stability ?? 0;
  const reps = word.reps ?? 0;
  const lapses = word.lapses ?? 0;

  // FSRS stability (0–60 pts): stability/30 days capped at 1
  const stabilityScore = Math.min(stability / 30, 1) * 60;

  // Practice depth (0–10 pts): reps capped at 10
  const practiceScore = Math.min(reps / 10, 1) * 10;

  // Lapse penalty: subtract up to 20 pts for lapses
  const lapsePenalty = Math.min(lapses * 5, 20);

  return Math.max(0, Math.round(stabilityScore + practiceScore - lapsePenalty));
}

/**
 * Compute confidence for a whole set.
 * Incorporates per-word FSRS data (70%) + exam history accuracy (30%).
 */
export function setConfidence(
  words: StudyWord[],
  examHistory: ExamHistoryEntry[],
  setId: string,
): number {
  if (words.length === 0) return 0;

  // Per-word FSRS component (70 pts max)
  const avgWordConf = words.reduce((sum, w) => sum + wordConfidence(w), 0) / words.length;
  const fsrsScore = (avgWordConf / 70) * 70; // normalize since max is ~70

  // Exam history component (30 pts max) — last 3 exams for this set
  const setExams = examHistory
    .filter((e) => e.setId === setId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  let examScore = 0;
  if (setExams.length > 0) {
    const avgPct = setExams.reduce((sum, e) => sum + (e.score / Math.max(e.total, 1)), 0) / setExams.length;
    examScore = avgPct * 30;
  }

  return Math.min(100, Math.round(fsrsScore + examScore));
}

/** Color for a confidence score */
export function confidenceColor(score: number): string {
  if (score >= 70) return "#58CC02";
  if (score >= 40) return "#FFC800";
  return "#FF4B4B";
}
