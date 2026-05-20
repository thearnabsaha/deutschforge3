/**
 * Grammar progress tracking — stores per-chapter scores, visits, & explicit completion.
 * Uses the existing Storage wrapper (SecureStore / memory fallback).
 */
import { Storage } from "./storage";
import { GRAMMAR_CHAPTERS, A2_GRAMMAR_CHAPTERS, B1_GRAMMAR_CHAPTERS } from "./grammarData";

const ALL_CHAPTERS = [...GRAMMAR_CHAPTERS, ...A2_GRAMMAR_CHAPTERS, ...B1_GRAMMAR_CHAPTERS];

export interface ChapterProgress {
  chapterId: string;
  visitCount: number;
  lastVisited: number | null; // timestamp
  completedAt: number | null; // timestamp — only set when user explicitly marks done
  exerciseAttempts: number;
  exerciseCorrect: number;
}

export interface GrammarProgress {
  chapters: Record<string, ChapterProgress>;
  dailyActivity?: Record<string, number>; // date string -> visit count
}

const KEY = "grammar_progress_v1";

const defaultChapter = (id: string): ChapterProgress => ({
  chapterId: id,
  visitCount: 0,
  lastVisited: null,
  completedAt: null,
  exerciseAttempts: 0,
  exerciseCorrect: 0,
});

export async function loadGrammarProgress(): Promise<GrammarProgress> {
  try {
    const raw = await Storage.getItem(KEY);
    if (raw) return JSON.parse(raw) as GrammarProgress;
  } catch {}
  return { chapters: {} };
}

export async function saveGrammarProgress(p: GrammarProgress): Promise<void> {
  await Storage.setItem(KEY, JSON.stringify(p));
}

export async function recordChapterVisit(chapterId: string): Promise<void> {
  const p = await loadGrammarProgress();
  const ch = p.chapters[chapterId] ?? defaultChapter(chapterId);
  ch.visitCount += 1;
  ch.lastVisited = Date.now();
  p.chapters[chapterId] = ch;
  // Track daily activity
  const today = new Date().toISOString().split("T")[0];
  if (!p.dailyActivity) p.dailyActivity = {};
  p.dailyActivity[today] = (p.dailyActivity[today] ?? 0) + 1;
  await saveGrammarProgress(p);
}

/** User explicitly marks chapter as done (or un-done). */
export async function toggleChapterComplete(chapterId: string): Promise<boolean> {
  const p = await loadGrammarProgress();
  const ch = p.chapters[chapterId] ?? defaultChapter(chapterId);
  const nowDone = ch.completedAt === null;
  ch.completedAt = nowDone ? Date.now() : null;
  p.chapters[chapterId] = ch;
  await saveGrammarProgress(p);
  return nowDone;
}

export async function recordExercise(
  chapterId: string,
  correct: boolean,
): Promise<void> {
  const p = await loadGrammarProgress();
  const ch = p.chapters[chapterId] ?? defaultChapter(chapterId);
  ch.exerciseAttempts += 1;
  if (correct) ch.exerciseCorrect += 1;
  p.chapters[chapterId] = ch;
  // Track daily activity for exercises too
  const today = new Date().toISOString().split("T")[0];
  if (!p.dailyActivity) p.dailyActivity = {};
  p.dailyActivity[today] = (p.dailyActivity[today] ?? 0) + 1;
  await saveGrammarProgress(p);
}

// ─── Practice (MCQ) Progress ──────────────────────────────────────────────────

export interface LevelResult {
  score: number;       // 0-10
  passed: boolean;     // score >= 7
  attempts: number;
  bestScore: number;
  lastAttempted: number; // timestamp
}

export interface PracticeProgress {
  chapters: Record<string, LevelResult[]>; // chapterId → array of 10 LevelResult
}

const PRACTICE_KEY = "grammar_practice_v1";

export async function loadPracticeProgress(): Promise<PracticeProgress> {
  try {
    const raw = await Storage.getItem(PRACTICE_KEY);
    if (raw) return JSON.parse(raw) as PracticeProgress;
  } catch {}
  return { chapters: {} };
}

export async function savePracticeProgress(p: PracticeProgress): Promise<void> {
  await Storage.setItem(PRACTICE_KEY, JSON.stringify(p));
}

/** Record a level attempt. Returns updated LevelResult. */
export async function recordLevelAttempt(
  chapterId: string,
  levelIndex: number, // 0-9
  score: number,
): Promise<LevelResult> {
  const p = await loadPracticeProgress();
  if (!p.chapters[chapterId]) {
    p.chapters[chapterId] = Array.from({ length: 10 }, () => ({
      score: 0, passed: false, attempts: 0, bestScore: 0, lastAttempted: 0,
    }));
  }
  const existing = p.chapters[chapterId][levelIndex];
  const updated: LevelResult = {
    score,
    passed: existing.passed || score >= 7,
    attempts: existing.attempts + 1,
    bestScore: Math.max(existing.bestScore, score),
    lastAttempted: Date.now(),
  };
  p.chapters[chapterId][levelIndex] = updated;
  await savePracticeProgress(p);
  return updated;
}

/**
 * Returns state of a level: 'locked' | 'unlocked' | 'passed'
 * Level 0 is always unlocked. Each subsequent level unlocks when prior is passed.
 */
export function getLevelState(
  chapterId: string,
  levelIndex: number,
  p: PracticeProgress,
): "locked" | "unlocked" | "passed" {
  const levels = p.chapters[chapterId];
  if (!levels) return levelIndex === 0 ? "unlocked" : "locked";
  if (levelIndex === 0) return levels[0].passed ? "passed" : "unlocked";
  const prev = levels[levelIndex - 1];
  if (!prev?.passed) return "locked";
  return levels[levelIndex].passed ? "passed" : "unlocked";
}

/** Wipe all grammar progress. */
export async function resetGrammarProgress(): Promise<void> {
  await Storage.setItem(KEY, JSON.stringify({ chapters: {} }));
}

/** Derived stats used by Dashboard */
export function computeStats(p: GrammarProgress) {
  const total = ALL_CHAPTERS.length;

  // visited = opened at least once
  const visited = ALL_CHAPTERS.filter(
    (c) => (p.chapters[c.id]?.visitCount ?? 0) > 0,
  );
  // completed = explicitly marked done
  const completed = ALL_CHAPTERS.filter(
    (c) => p.chapters[c.id]?.completedAt != null,
  );
  const withScores = ALL_CHAPTERS.filter(
    (c) => (p.chapters[c.id]?.exerciseAttempts ?? 0) > 0,
  );

  const accuracy = (chId: string): number | null => {
    const ch = p.chapters[chId];
    if (!ch || ch.exerciseAttempts === 0) return null;
    return Math.round((ch.exerciseCorrect / ch.exerciseAttempts) * 100);
  };

  const strengths = withScores
    .filter((c) => (accuracy(c.id) ?? 0) >= 80)
    .sort((a, b) => (accuracy(b.id) ?? 0) - (accuracy(a.id) ?? 0))
    .slice(0, 5);

  const weaknesses = withScores
    .filter((c) => (accuracy(c.id) ?? 101) < 70)
    .sort((a, b) => (accuracy(a.id) ?? 101) - (accuracy(b.id) ?? 101))
    .slice(0, 5);

  const overallAccuracy =
    withScores.length > 0
      ? Math.round(
          withScores.reduce((sum, c) => sum + (accuracy(c.id) ?? 0), 0) /
            withScores.length,
        )
      : null;

  // Build 52-week activity (364 days)
  const activityMap = p.dailyActivity ?? {};
  const weeklyActivity: { date: string; count: number }[] = [];
  for (let i = 363; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    weeklyActivity.push({ date: dateStr, count: activityMap[dateStr] ?? 0 });
  }

  // Active days and total interactions
  const activeDays = weeklyActivity.filter((d) => d.count > 0).length;
  const totalInteractions = weeklyActivity.reduce((s, d) => s + d.count, 0);

  return {
    total,
    visited: visited.length,
    completed: completed.length,
    withScores: withScores.length,
    overallAccuracy,
    strengths,
    weaknesses,
    accuracy,
    weeklyActivity,
    activeDays,
    totalInteractions,
  };
}
