/**
 * examAnalytics.ts
 * Central data layer for Goethe exam attempt history and analytics.
 * Supports multiple attempts per exam, improvement tracking, and aggregate stats.
 */

import { Storage } from "./storage";
import { Level, Section } from "./goetheExamData";

// ─── Schema ───────────────────────────────────────────────────

export interface ExamAttempt {
  score: number;      // 0–100 percentage
  rawCorrect: number; // raw correct answers
  rawTotal: number;   // total questions
  passed: boolean;
  date: string;       // ISO string
  durationSec?: number;
}

/** examId → array of attempts, newest first */
export type ExamResultsV2 = Record<string, ExamAttempt[]>;

export const RESULTS_KEY_V2 = "goethe_exam_results_v2";
const RESULTS_KEY_V1 = "goethe_exam_results_v1";

// ─── Storage helpers ──────────────────────────────────────────

export async function loadResults(): Promise<ExamResultsV2> {
  await migrateV1toV2();
  try {
    const raw = await Storage.getItem(RESULTS_KEY_V2);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function saveAttempt(examId: string, attempt: ExamAttempt): Promise<ExamResultsV2> {
  const results = await loadResults();
  const existing = results[examId] ?? [];
  // prepend newest attempt
  results[examId] = [attempt, ...existing];
  await Storage.setItem(RESULTS_KEY_V2, JSON.stringify(results));
  return results;
}

/** One-time migration from v1 (single entry per exam) → v2 (array of attempts) */
export async function migrateV1toV2(): Promise<void> {
  try {
    const v2Raw = await Storage.getItem(RESULTS_KEY_V2);
    if (v2Raw) return; // already migrated

    const v1Raw = await Storage.getItem(RESULTS_KEY_V1);
    if (!v1Raw) return;

    const v1: Record<string, any> = JSON.parse(v1Raw);
    const v2: ExamResultsV2 = {};

    for (const [id, r] of Object.entries(v1)) {
      if (r && typeof r === "object") {
        v2[id] = [{
          score: r.score ?? 0,
          rawCorrect: r.score ?? 0,
          rawTotal: r.total ?? 100,
          passed: r.passed ?? false,
          date: r.date ?? new Date().toISOString(),
        }];
      }
    }

    await Storage.setItem(RESULTS_KEY_V2, JSON.stringify(v2));
  } catch {
    // silent — migration failure should not break app
  }
}

// ─── Per-exam helpers ─────────────────────────────────────────

export function getExamHistory(results: ExamResultsV2, examId: string): ExamAttempt[] {
  return results[examId] ?? [];
}

export function getBestScore(results: ExamResultsV2, examId: string): number | null {
  const attempts = results[examId];
  if (!attempts || attempts.length === 0) return null;
  return Math.max(...attempts.map((a) => a.score));
}

export function getLatestScore(results: ExamResultsV2, examId: string): number | null {
  const attempts = results[examId];
  if (!attempts || attempts.length === 0) return null;
  return attempts[0].score; // newest first
}

export function getAttemptCount(results: ExamResultsV2, examId: string): number {
  return results[examId]?.length ?? 0;
}

export function hasEverPassed(results: ExamResultsV2, examId: string): boolean {
  return results[examId]?.some((a) => a.passed) ?? false;
}

export function getImprovement(results: ExamResultsV2, examId: string): number | null {
  const attempts = results[examId];
  if (!attempts || attempts.length < 2) return null;
  const first = attempts[attempts.length - 1].score; // oldest
  const latest = attempts[0].score; // newest
  return latest - first;
}

// ─── Section stats ────────────────────────────────────────────

export interface SectionStats {
  level: Level;
  section: Section;
  attempted: number;
  passed: number;
  avgScore: number | null;
  bestScore: number | null;
  totalExams: number;
}

export function getSectionStats(
  results: ExamResultsV2,
  level: Level,
  section: Section,
  examIds: string[]
): SectionStats {
  let attempted = 0;
  let passed = 0;
  let totalScore = 0;
  let scoreCount = 0;
  let bestScore: number | null = null;

  for (const id of examIds) {
    const attempts = results[id];
    if (!attempts || attempts.length === 0) continue;
    attempted++;
    if (attempts.some((a) => a.passed)) passed++;
    const best = Math.max(...attempts.map((a) => a.score));
    totalScore += best;
    scoreCount++;
    if (bestScore === null || best > bestScore) bestScore = best;
  }

  return {
    level,
    section,
    attempted,
    passed,
    avgScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : null,
    bestScore,
    totalExams: examIds.length,
  };
}

// ─── Level stats ──────────────────────────────────────────────

export interface LevelStats {
  level: Level;
  totalExams: number;      // 4 sections × 30
  attempted: number;
  passed: number;
  avgScore: number | null;
  passRate: number | null; // 0–100
}

export function getLevelStats(
  results: ExamResultsV2,
  level: Level,
  allExamIds: string[] // all exam ids for this level (120 total)
): LevelStats {
  let attempted = 0;
  let passed = 0;
  let totalScore = 0;
  let scoreCount = 0;

  for (const id of allExamIds) {
    const attempts = results[id];
    if (!attempts || attempts.length === 0) continue;
    attempted++;
    if (attempts.some((a) => a.passed)) passed++;
    const best = Math.max(...attempts.map((a) => a.score));
    totalScore += best;
    scoreCount++;
  }

  return {
    level,
    totalExams: allExamIds.length,
    attempted,
    passed,
    avgScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : null,
    passRate: attempted > 0 ? Math.round((passed / attempted) * 100) : null,
  };
}

// ─── Overall stats ────────────────────────────────────────────

export interface OverallStats {
  totalAttempts: number;   // sum of all attempt arrays
  uniqueExamsTried: number;
  totalPassed: number;     // exams where ever passed
  passRate: number | null;
  avgScore: number | null;
  recentActivity: RecentActivity[];
}

export interface RecentActivity {
  examId: string;
  score: number;
  passed: boolean;
  date: string;
}

export function getOverallStats(results: ExamResultsV2): OverallStats {
  let totalAttempts = 0;
  let uniqueExamsTried = 0;
  let totalPassed = 0;
  let totalScore = 0;
  let scoreCount = 0;
  const allAttempts: (RecentActivity & { _date: Date })[] = [];

  for (const [examId, attempts] of Object.entries(results)) {
    if (!attempts || attempts.length === 0) continue;
    uniqueExamsTried++;
    totalAttempts += attempts.length;
    if (attempts.some((a) => a.passed)) totalPassed++;
    const best = Math.max(...attempts.map((a) => a.score));
    totalScore += best;
    scoreCount++;

    for (const a of attempts) {
      allAttempts.push({
        examId,
        score: a.score,
        passed: a.passed,
        date: a.date,
        _date: new Date(a.date),
      });
    }
  }

  // Sort recent activity newest first, take top 15
  allAttempts.sort((a, b) => b._date.getTime() - a._date.getTime());
  const recentActivity = allAttempts.slice(0, 15).map(({ _date, ...rest }) => rest);

  return {
    totalAttempts,
    uniqueExamsTried,
    totalPassed,
    passRate: uniqueExamsTried > 0 ? Math.round((totalPassed / uniqueExamsTried) * 100) : null,
    avgScore: scoreCount > 0 ? Math.round(totalScore / scoreCount) : null,
    recentActivity,
  };
}

// ─── Score color helper ───────────────────────────────────────

export function scoreColor(score: number): string {
  if (score >= 80) return "#4CAF50";
  if (score >= 60) return "#8BC34A";
  if (score >= 40) return "#FFC107";
  return "#F44336";
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
