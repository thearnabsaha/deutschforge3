/**
 * Learn Mode Progress Tracking
 * Stores per-chapter level completions, XP, and streak data.
 */
import { Storage } from "./storage";
import { CEFR_LEVELS, LEVELS_PER_CHAPTER } from "./learnData";

const KEY = "learn_progress_v1";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LevelProgress {
  completed: boolean;
  score: number;        // 0–10 correct answers
  xpEarned: number;
  completedAt: number | null;
  attempts: number;
}

export interface ChapterLearnProgress {
  chapterId: string;
  levels: Record<number, LevelProgress>; // key = level index 0–9
}

export interface LearnProgress {
  xp: number;
  streak: number;
  lastStreakDate: string | null; // ISO date string "YYYY-MM-DD"
  chapters: Record<string, ChapterLearnProgress>;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultLevelProgress = (): LevelProgress => ({
  completed: false,
  score: 0,
  xpEarned: 0,
  completedAt: null,
  attempts: 0,
});

const defaultChapterProgress = (chapterId: string): ChapterLearnProgress => ({
  chapterId,
  levels: {},
});

const defaultProgress = (): LearnProgress => ({
  xp: 0,
  streak: 0,
  lastStreakDate: null,
  chapters: {},
});

// ─── Storage ──────────────────────────────────────────────────────────────────

export async function loadLearnProgress(): Promise<LearnProgress> {
  try {
    const raw = await Storage.getItem(KEY);
    if (raw) return JSON.parse(raw) as LearnProgress;
  } catch {}
  return defaultProgress();
}

export async function saveLearnProgress(p: LearnProgress): Promise<void> {
  await Storage.setItem(KEY, JSON.stringify(p));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

export async function recordLevelCompletion(
  chapterId: string,
  levelIndex: number,
  score: number
): Promise<{ xpEarned: number; isNewCompletion: boolean }> {
  const p = await loadLearnProgress();

  if (!p.chapters[chapterId]) {
    p.chapters[chapterId] = defaultChapterProgress(chapterId);
  }

  const ch = p.chapters[chapterId];
  const prev = ch.levels[levelIndex];
  const wasCompleted = prev?.completed ?? false;

  // XP: base 10, perfect bonus 20, first-time bonus 5
  const xpBase = 10;
  const perfectBonus = score === 10 ? 20 : 0;
  const firstTimeBonus = !wasCompleted ? 5 : 0;
  const xpEarned = xpBase + perfectBonus + firstTimeBonus;

  ch.levels[levelIndex] = {
    completed: true,
    score,
    xpEarned,
    completedAt: Date.now(),
    attempts: (prev?.attempts ?? 0) + 1,
  };

  p.xp += xpEarned;

  // Streak update
  const today = todayString();
  if (p.lastStreakDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split("T")[0];
    if (p.lastStreakDate === yStr) {
      p.streak += 1;
    } else {
      p.streak = 1;
    }
    p.lastStreakDate = today;
  }

  await saveLearnProgress(p);
  return { xpEarned, isNewCompletion: !wasCompleted };
}

// ─── Progress Queries ─────────────────────────────────────────────────────────

export function getChapterProgress(
  p: LearnProgress,
  chapterId: string
): ChapterLearnProgress {
  return p.chapters[chapterId] ?? defaultChapterProgress(chapterId);
}

export function getLevelProgress(
  p: LearnProgress,
  chapterId: string,
  levelIndex: number
): LevelProgress {
  return p.chapters[chapterId]?.levels[levelIndex] ?? defaultLevelProgress();
}

/** How many levels in this chapter are completed */
export function getChapterLevelsCompleted(p: LearnProgress, chapterId: string): number {
  const ch = p.chapters[chapterId];
  if (!ch) return 0;
  return Object.values(ch.levels).filter((l) => l.completed).length;
}

/** First incomplete level index (0–9), or 10 if all done */
export function getNextLevelIndex(p: LearnProgress, chapterId: string): number {
  const ch = p.chapters[chapterId];
  if (!ch) return 0;
  for (let i = 0; i < LEVELS_PER_CHAPTER; i++) {
    if (!ch.levels[i]?.completed) return i;
  }
  return LEVELS_PER_CHAPTER;
}

/** Is a chapter fully completed (all 10 levels done)? */
export function isChapterComplete(p: LearnProgress, chapterId: string): boolean {
  return getChapterLevelsCompleted(p, chapterId) >= LEVELS_PER_CHAPTER;
}

/** Is a unit unlocked? First unit always unlocked. Others: previous unit must have 
 *  all chapters with at least level 0 completed. */
export function isUnitUnlocked(p: LearnProgress, unitId: string): boolean {
  for (const cefrLevel of CEFR_LEVELS) {
    const idx = cefrLevel.units.findIndex((u) => u.unitId === unitId);
    if (idx === -1) continue;
    if (idx === 0) {
      // First unit of A1 always unlocked, A2/B1 need previous CEFR done
      if (cefrLevel.id === "A1") return true;
      if (cefrLevel.id === "A2") return isCEFRComplete(p, "A1");
      if (cefrLevel.id === "B1") return isCEFRComplete(p, "A2");
    }
    const prevUnit = cefrLevel.units[idx - 1];
    return prevUnit.chapters.every((ch) => getChapterLevelsCompleted(p, ch.chapterId) >= 1);
  }
  return false;
}

/** Is a unit fully completed (all chapters, all 10 levels)? */
export function isUnitComplete(p: LearnProgress, unitId: string): boolean {
  for (const cefrLevel of CEFR_LEVELS) {
    const unit = cefrLevel.units.find((u) => u.unitId === unitId);
    if (!unit) continue;
    return unit.chapters.every((ch) => isChapterComplete(p, ch.chapterId));
  }
  return false;
}

/** Unit progress 0–1 (fraction of all levels completed) */
export function getUnitProgress(p: LearnProgress, unitId: string): number {
  for (const cefrLevel of CEFR_LEVELS) {
    const unit = cefrLevel.units.find((u) => u.unitId === unitId);
    if (!unit) continue;
    const total = unit.chapters.length * LEVELS_PER_CHAPTER;
    const done = unit.chapters.reduce(
      (acc, ch) => acc + getChapterLevelsCompleted(p, ch.chapterId),
      0
    );
    return total > 0 ? done / total : 0;
  }
  return 0;
}

function isCEFRComplete(p: LearnProgress, cefrId: "A1" | "A2" | "B1"): boolean {
  const level = CEFR_LEVELS.find((l) => l.id === cefrId);
  if (!level) return false;
  return level.units
    .flatMap((u) => u.chapters)
    .every((ch) => getChapterLevelsCompleted(p, ch.chapterId) >= 1);
}

/** Get total XP earned for a chapter */
export function getChapterXP(p: LearnProgress, chapterId: string): number {
  const ch = p.chapters[chapterId];
  if (!ch) return 0;
  return Object.values(ch.levels).reduce((acc, l) => acc + l.xpEarned, 0);
}
