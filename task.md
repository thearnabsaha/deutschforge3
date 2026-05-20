# DeutschForge Web PWA Task

## Goal
- Add all mobile features to web
- Make web a PWA
- Match mobile layout on phone (bottom tab nav)

## Done
- [x] vite-plugin-pwa installed + vite.config.ts updated
- [x] index.html updated with PWA meta tags
- [x] Icons created (192, 512)
- [x] Storage wrapper created (web localStorage)
- [x] grammarData.ts, syllabusData.ts, syllabusProgress.ts, grammarProgress.ts copied to web

## In Progress
- [ ] Create new Layout with bottom tabs on mobile + sidebar on desktop
- [ ] Grammar page (chapter browser A1/A2/B1 + chapter detail modal)
- [ ] Learn page (zigzag path with units/levels)
- [ ] Goethe Exams page (placeholder / basic)
- [ ] Update app.tsx routes
- [ ] Build verification

## Files to Create/Modify
- packages/web/src/web/components/layout.tsx — add bottom tab nav for mobile
- packages/web/src/web/pages/grammar.tsx — new
- packages/web/src/web/pages/grammar-chapter.tsx — new (modal/page)
- packages/web/src/web/pages/learn.tsx — new
- packages/web/src/web/pages/exams.tsx — new
- packages/web/src/web/app.tsx — add routes
- packages/web/src/web/styles.css — ensure mobile safe area
