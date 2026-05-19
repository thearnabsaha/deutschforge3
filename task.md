# Offline-First Sync

## Files to create
- packages/mobile/lib/localDb.ts       — expo-sqlite setup + schema
- packages/mobile/lib/syncQueue.ts     — pending ops queue
- packages/mobile/lib/offlineStore.ts  — all CRUD (read/write local, enqueue)
- packages/mobile/lib/useNetwork.ts    — online/offline hook via NetInfo
- packages/mobile/lib/syncEngine.ts    — push queue to server + pull from server

## Files to modify
- packages/mobile/app/(tabs)/words.tsx     — swap API → offlineStore
- packages/mobile/app/(tabs)/study.tsx     — swap words fetch → offlineStore
- packages/mobile/app/study/flashcard.tsx  — swap review submit → offlineStore
- packages/mobile/lib/AppShell.tsx         — add offline banner + sync status
- packages/mobile/app/_layout.tsx          — init localDb + start sync engine on boot

## Server additions (for sync endpoints)
- packages/web/src/api/routes/sync.ts      — POST /api/sync/push, GET /api/sync/pull

## Strategy
- Local SQLite mirrors: words, cards, reviews, userStats, sync_queue
- On any write: write local first, enqueue op
- On reconnect: flush queue → server, then pull latest data down
- Conflict: server wins for words/cards, append-only for reviews
- FSRS runs client-side using ts-fsrs (already a dep on web, add to mobile)
