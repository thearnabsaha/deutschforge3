# Grammar Practice Tab — Task Plan

## What we're building
- New "Practice" tab in grammar-chapter.tsx (the chapter detail screen)
- 100 MCQ questions per chapter, split into 10 levels (10 questions each)
- Level unlocks sequentially (complete level 1 → unlock level 2, etc.)
- Chapter completion = lesson read (visited) + ALL 10 levels passed
- Can redo any completed level anytime

## Data Architecture
- `grammarPracticeData.ts` — 100 Q per chapter for ALL 61 chapters (AI-generated inline)
  - Q format: { q: string, options: string[4], answer: number (0-3) }
  - 10 levels × 10 questions = 100 per chapter
  - Store as: `Record<chapterId, Question[]>` (100 items, sliced by level)
  
- `grammarProgress.ts` — extend ChapterProgress:
  - `practiceLevel: number` — highest level completed (0 = none)
  - `practiceLevelScores: Record<levelIndex, { correct: number, total: number, completedAt: number }>` 
  - chapter "complete" = completedAt != null AND practiceLevel >= 10

## UI Flow
1. Practice tab in grammar-chapter.tsx shows 10 level cards
2. Tap level → full-screen quiz (10 questions, one at a time)
3. After each answer → show correct/wrong feedback + explanation
4. After all 10 → score screen (X/10) → "Next Level" or "Retry"
5. Pass = score ≥ 6/10 → unlocks next level + saves progress

## Completion Logic (grammar-chapter.tsx)
- "Mark as done" button REMOVED / replaced by auto-completion
- Chapter auto-completes when: visited + all 10 levels passed (≥6/10 each)
- User can still manually mark done (keep the button as fallback)

## Files to create/edit
1. CREATE: `packages/mobile/lib/grammarPracticeData.ts` — 100 Q × 61 chapters
2. EDIT: `packages/mobile/lib/grammarProgress.ts` — add practice fields
3. EDIT: `packages/mobile/app/grammar-chapter.tsx` — add Practice tab + quiz flow
4. EDIT: `packages/mobile/app/grammar.tsx` — update completion logic display

## Steps
- [x] Plan
- [ ] Write grammarPracticeData.ts (61 chapters × 100 Q each) — BIG file
- [ ] Update grammarProgress.ts types + functions
- [ ] Build Practice tab UI + quiz screen in grammar-chapter.tsx
- [ ] Wire completion logic
- [ ] Test
