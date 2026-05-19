/**
 * Sync queue — stores pending operations to be pushed to the server.
 */
import { getDb } from "./localDb";

export type SyncOp =
  | { type: "ADD_WORDS"; payload: { words: string } }
  | { type: "DELETE_WORD"; payload: { id: string } }
  | { type: "SUBMIT_REVIEW"; payload: { cardId: string; rating: number; reviewedAt: number; xpEarned: number; sessionRatings: number[]; sessionComplete: boolean } }
  | { type: "UPDATE_DAILY_GOAL"; payload: { dailyGoal: number } }
  | { type: "RESET_STATS"; payload: Record<string, never> };

export interface QueueItem {
  id: number;
  op: SyncOp;
  createdAt: number;
  attempts: number;
}

export function enqueue(op: SyncOp): void {
  const db = getDb();
  db.runSync(
    `INSERT INTO sync_queue (op, payload, createdAt, attempts) VALUES (?, ?, ?, 0)`,
    [op.type, JSON.stringify(op.payload), Date.now()]
  );
}

export function getPendingQueue(): QueueItem[] {
  const db = getDb();
  const rows = db.getAllSync<{ id: number; op: string; payload: string; createdAt: number; attempts: number }>(
    `SELECT id, op, payload, createdAt, attempts FROM sync_queue ORDER BY id ASC LIMIT 100`
  );
  return rows.map((r) => ({
    id: r.id,
    op: { type: r.op, payload: JSON.parse(r.payload) } as SyncOp,
    createdAt: r.createdAt,
    attempts: r.attempts,
  }));
}

export function markSent(id: number): void {
  const db = getDb();
  db.runSync(`DELETE FROM sync_queue WHERE id = ?`, [id]);
}

export function incrementAttempts(id: number): void {
  const db = getDb();
  db.runSync(`UPDATE sync_queue SET attempts = attempts + 1 WHERE id = ?`, [id]);
}

export function clearQueue(): void {
  const db = getDb();
  db.runSync(`DELETE FROM sync_queue`);
}

export function queueLength(): number {
  const db = getDb();
  const row = db.getFirstSync<{ c: number }>(`SELECT COUNT(*) as c FROM sync_queue`);
  return row?.c ?? 0;
}
