/**
 * Sync engine — push local queue to server, pull latest data down.
 * Called on app foreground + whenever network reconnects.
 */
import { api, baseUrl } from "./api";
import {
  getPendingQueue, markSent, incrementAttempts, queueLength,
} from "./syncQueue";
import {
  upsertWordLocally, upsertCardLocally, upsertStatsLocally,
  getLocalWordCount,
} from "./offlineStore";

// ─── State ────────────────────────────────────────────────────────────────────

type SyncStatus = "idle" | "syncing" | "error";

let _status: SyncStatus = "idle";
let _lastSync: number | null = null;
let _pendingCount = 0;
let _listeners: Array<(s: SyncState) => void> = [];

export interface SyncState {
  status: SyncStatus;
  lastSync: number | null;
  pendingCount: number;
}

export function getSyncState(): SyncState {
  return { status: _status, lastSync: _lastSync, pendingCount: _pendingCount };
}

export function subscribeSyncState(fn: (s: SyncState) => void): () => void {
  _listeners.push(fn);
  fn(getSyncState());
  return () => { _listeners = _listeners.filter((l) => l !== fn); };
}

function notify() {
  _pendingCount = queueLength();
  const state = getSyncState();
  _listeners.forEach((l) => l(state));
}

// ─── Push queue to server ─────────────────────────────────────────────────────

async function pushQueue(): Promise<void> {
  const items = getPendingQueue();
  if (items.length === 0) return;

  for (const item of items) {
    try {
      const op = item.op;

      if (op.type === "ADD_WORDS") {
        const res = await api.words.add.$post({ json: { words: op.payload.words } });
        if (!res.ok) throw new Error(`ADD_WORDS failed: ${res.status}`);
        // Server will enrich — pull will bring enriched data back
        markSent(item.id);

      } else if (op.type === "DELETE_WORD") {
        const res = await fetch(`${baseUrl}/api/words/${op.payload.id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok && res.status !== 404) throw new Error(`DELETE_WORD failed: ${res.status}`);
        markSent(item.id);

      } else if (op.type === "SUBMIT_REVIEW") {
        const res = await api.review.submit.$post({
          json: {
            cardId: op.payload.cardId,
            rating: op.payload.rating,
            sessionRatings: op.payload.sessionRatings,
            sessionComplete: op.payload.sessionComplete,
          },
        });
        if (!res.ok) throw new Error(`SUBMIT_REVIEW failed: ${res.status}`);
        markSent(item.id);

      } else if (op.type === "UPDATE_DAILY_GOAL") {
        const res = await api.stats.goal.$put({ json: { dailyGoal: op.payload.dailyGoal } });
        if (!res.ok) throw new Error(`UPDATE_DAILY_GOAL failed: ${res.status}`);
        markSent(item.id);

      } else if (op.type === "RESET_STATS") {
        const res = await fetch(`${baseUrl}/api/stats/reset`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) throw new Error(`RESET_STATS failed: ${res.status}`);
        markSent(item.id);
      }

    } catch (e) {
      console.warn("[sync] push failed for op", item.op.type, e);
      incrementAttempts(item.id);
      // Don't abort entire queue on one failure
    }
  }
}

// ─── Pull from server ─────────────────────────────────────────────────────────

async function pullFromServer(userId: string): Promise<void> {
  try {
    // Pull words + cards
    const wordsRes = await api.words.$get({ query: {} });
    if (wordsRes.ok) {
      const data = await wordsRes.json() as { words: any[] };
      for (const w of data.words) {
        upsertWordLocally({
          id: w.id,
          userId,
          german: w.german,
          displayGerman: w.displayGerman ?? null,
          english: w.english,
          partOfSpeech: w.partOfSpeech,
          gender: w.gender ?? null,
          genderCategory: w.genderCategory ?? null,
          cefrLevel: w.cefrLevel ?? null,
          exampleSentence: w.exampleSentence ?? null,
          exampleTranslation: w.exampleTranslation ?? null,
          aiNotes: w.aiNotes ?? null,
          ipa: w.ipa ?? null,
          addedAt: w.addedAt,
        });

        // If the server returned card state inline (reps/state), upsert it.
        // If not, ensure a placeholder card exists so the word appears in due queries.
        if (w.cardId) {
          upsertCardLocally({
            id: w.cardId,
            userId,
            wordId: w.id,
            due: w.due ?? Date.now(),
            stability: w.stability ?? 0,
            difficulty: w.difficulty ?? 5,
            elapsedDays: w.elapsedDays ?? 0,
            scheduledDays: w.scheduledDays ?? 0,
            reps: w.reps ?? 0,
            lapses: w.lapses ?? 0,
            state: w.state ?? 0,
            lastReview: w.lastReview ?? null,
            learningSteps: w.learningSteps ?? 0,
          });
        }
      }
    }

    // Pull stats
    const statsRes = await api.stats.$get();
    if (statsRes.ok) {
      const stats = await statsRes.json() as any;
      upsertStatsLocally({
        userId,
        xp: stats.xp,
        level: stats.level,
        streak: stats.streak,
        longestStreak: stats.longestStreak,
        lastActiveDate: stats.lastActiveDate,
        totalReviews: stats.totalReviews,
        dailyGoal: stats.dailyGoal,
        todayReviews: stats.todayReviews,
        lastReviewDate: stats.lastReviewDate,
      });
    }

    // Pull due cards (includes card state + word data)
    const dueRes = await fetch(`${baseUrl}/api/review/due?limit=200`, {
      credentials: "include",
    });
    if (dueRes.ok) {
      const dueData = await dueRes.json() as { cards: Array<{ card: any; word: any }> };
      for (const { card: c, word: w } of dueData.cards) {
        upsertWordLocally({
          id: w.id, userId, german: w.german, displayGerman: w.displayGerman ?? null,
          english: w.english, partOfSpeech: w.partOfSpeech, gender: w.gender ?? null,
          genderCategory: w.genderCategory ?? null, cefrLevel: w.cefrLevel ?? null,
          exampleSentence: w.exampleSentence ?? null, exampleTranslation: w.exampleTranslation ?? null,
          aiNotes: w.aiNotes ?? null, ipa: w.ipa ?? null, addedAt: w.addedAt,
        });
        upsertCardLocally({
          id: c.id, userId, wordId: c.wordId, due: c.due,
          stability: c.stability, difficulty: c.difficulty,
          elapsedDays: c.elapsedDays, scheduledDays: c.scheduledDays,
          reps: c.reps, lapses: c.lapses, state: c.state,
          lastReview: c.lastReview ?? null, learningSteps: c.learningSteps ?? 0,
        });
      }
    }

  } catch (e) {
    console.warn("[sync] pull failed", e);
    throw e;
  }
}

// ─── Main sync entry point ────────────────────────────────────────────────────

let _syncInProgress = false;

/**
 * Force an immediate sync, bypassing any external throttle.
 * Skips if a sync is already in progress (deduplicated).
 */
export async function forceSyncNow(userId: string): Promise<void> {
  return runSync(userId);
}

export async function runSync(userId: string): Promise<void> {
  if (_syncInProgress) return;
  _syncInProgress = true;
  _status = "syncing";
  notify();

  try {
    await pushQueue();
    await pullFromServer(userId);
    _status = "idle";
    _lastSync = Date.now();
  } catch (e) {
    console.warn("[sync] sync cycle failed", e);
    _status = "error";
  } finally {
    _syncInProgress = false;
    notify();
  }
}
