# DeutschForge Task Log

## ✅ All Done

### Web features added
- [x] Grammar page (`/grammar`) — 3 levels (A1/A2/B1), chapter browser, modal with exercises
- [x] Learn page (`/learn`) — zigzag path, unit headers, progress bar, locked/unlocked/completed nodes
- [x] Exams page (`/exams`) — full Goethe exam browser with runner: Hören, Lesen, Schreiben, Sprechen
- [x] Exam Analytics view
- [x] All routes added to app.tsx
- [x] PWA: vite-plugin-pwa v1.3.0, service worker, manifest, icons (192+512)
- [x] Bottom tab nav (mobile): Home, Words, Study, Grammar, Learn, Exams, Profile
- [x] Desktop sidebar with same 7 items

### Lib files copied to web
- grammarData.ts, grammarProgress.ts, syllabusData.ts, syllabusProgress.ts
- goetheExamData.ts, examAnalytics.ts
- storage.ts (localStorage wrapper)

### Build
- ✅ Clean build: `bun run build` in packages/web
- ✅ PWA service worker generated
- ✅ Pushed to GitHub (commit 68ae883) → Render auto-deploys

### Remaining manual steps
- User needs to set `WEBSITE_URL` in Render dashboard env vars
