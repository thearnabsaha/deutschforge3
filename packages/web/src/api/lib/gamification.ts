// XP and level logic
export const XP_PER_RATING: Record<number, number> = {
  1: 2,  // Again
  2: 5,  // Hard
  3: 10, // Good
  4: 15, // Easy
};

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 900, 1500, 2300, 3300, 4600, 6100, 8000,
  10500, 13500, 17000, 21000, 26000, 32000, 39000, 47000, 56000, 66000,
];

export function getLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getXpForNextLevel(level: number): number {
  return LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
}

export function getXpForCurrentLevel(level: number): number {
  return LEVEL_THRESHOLDS[level - 1] ?? 0;
}

// Badge definitions
export interface BadgeDef {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: "vocabulary" | "reviews" | "streak" | "level" | "accuracy" | "special" | "cefr" | "variety";
}

export const BADGE_DEFS: BadgeDef[] = [
  // ── Vocabulary milestones ──
  { key: "first_word", name: "First Step", description: "Added your first German word", icon: "🌱", category: "vocabulary" },
  { key: "words_10", name: "Vocabulary Starter", description: "Added 10 words", icon: "📚", category: "vocabulary" },
  { key: "words_25", name: "Growing List", description: "Added 25 words", icon: "📋", category: "vocabulary" },
  { key: "words_50", name: "Word Collector", description: "Added 50 words", icon: "🗂️", category: "vocabulary" },
  { key: "words_100", name: "Lexicon", description: "Added 100 words", icon: "📖", category: "vocabulary" },
  { key: "words_250", name: "Word Hoarder", description: "Added 250 words", icon: "🏛️", category: "vocabulary" },
  { key: "words_500", name: "Vocabulary King", description: "Added 500 words", icon: "👑", category: "vocabulary" },
  { key: "words_1000", name: "Thousand Strong", description: "Added 1000 words!", icon: "💎", category: "vocabulary" },

  // ── Review milestones ──
  { key: "first_review", name: "First Review", description: "Completed your first review", icon: "✨", category: "reviews" },
  { key: "reviews_10", name: "Getting Started", description: "Completed 10 reviews", icon: "🔥", category: "reviews" },
  { key: "reviews_50", name: "Consistent Learner", description: "Completed 50 reviews", icon: "📝", category: "reviews" },
  { key: "reviews_100", name: "Dedicated Learner", description: "Completed 100 reviews", icon: "💪", category: "reviews" },
  { key: "reviews_250", name: "Study Warrior", description: "Completed 250 reviews", icon: "⚔️", category: "reviews" },
  { key: "reviews_500", name: "Master Student", description: "Completed 500 reviews", icon: "🏆", category: "reviews" },
  { key: "reviews_1000", name: "Review Legend", description: "Completed 1000 reviews", icon: "🌟", category: "reviews" },
  { key: "reviews_5000", name: "Grandmaster", description: "Completed 5000 reviews", icon: "🧙", category: "reviews" },

  // ── Streaks ──
  { key: "streak_3", name: "Hat Trick", description: "3-day study streak", icon: "🎯", category: "streak" },
  { key: "streak_7", name: "Week Warrior", description: "7-day study streak", icon: "⚡", category: "streak" },
  { key: "streak_14", name: "Two Weeks", description: "14-day study streak", icon: "🔆", category: "streak" },
  { key: "streak_30", name: "Monthly Master", description: "30-day study streak", icon: "🌟", category: "streak" },
  { key: "streak_60", name: "Iron Will", description: "60-day study streak", icon: "🦾", category: "streak" },
  { key: "streak_100", name: "Centurion", description: "100-day study streak!", icon: "🏅", category: "streak" },
  { key: "streak_365", name: "Year of German", description: "365-day streak — legendary!", icon: "🎖️", category: "streak" },

  // ── Levels ──
  { key: "level_5", name: "Rising Star", description: "Reached level 5", icon: "⭐", category: "level" },
  { key: "level_10", name: "Expert Learner", description: "Reached level 10", icon: "🎓", category: "level" },
  { key: "level_15", name: "Seasoned Pro", description: "Reached level 15", icon: "🎯", category: "level" },
  { key: "level_20", name: "Elite Scholar", description: "Reached level 20", icon: "🏆", category: "level" },

  // ── Accuracy / Performance ──
  { key: "perfect_session", name: "Flawless", description: "Rated all cards Easy in one session", icon: "💯", category: "accuracy" },
  { key: "accuracy_80", name: "Sharp Mind", description: "80%+ Easy/Good rate over 20 reviews", icon: "🧠", category: "accuracy" },
  { key: "accuracy_90", name: "Precision Learner", description: "90%+ Easy/Good rate over 50 reviews", icon: "🎯", category: "accuracy" },
  { key: "no_again_10", name: "Clean Sweep", description: "10 reviews without rating 'Again'", icon: "🧹", category: "accuracy" },
  { key: "speed_demon", name: "Speed Demon", description: "Reviewed 20+ cards in one session", icon: "⚡", category: "accuracy" },

  // ── CEFR badges ──
  { key: "cefr_a1", name: "A1 Unlocked", description: "Added your first A1 word", icon: "🔓", category: "cefr" },
  { key: "cefr_a2", name: "A2 Explorer", description: "Have 10+ A2 words", icon: "🗺️", category: "cefr" },
  { key: "cefr_b1", name: "B1 Breaker", description: "Have 10+ B1 words", icon: "🚀", category: "cefr" },
  { key: "cefr_b2", name: "B2 Builder", description: "Have 10+ B2 words", icon: "🏗️", category: "cefr" },
  { key: "cefr_c1", name: "C1 Champion", description: "Have 5+ C1 words", icon: "🥇", category: "cefr" },
  { key: "cefr_c2", name: "Native Territory", description: "Have 5+ C2 words", icon: "👸", category: "cefr" },

  // ── Variety / Word types ──
  { key: "noun_master", name: "Noun Ninja", description: "Added 20 nouns", icon: "🔵", category: "variety" },
  { key: "verb_master", name: "Verb Virtuoso", description: "Added 20 verbs", icon: "🟢", category: "variety" },
  { key: "adj_master", name: "Adjective Ace", description: "Added 15 adjectives", icon: "🟡", category: "variety" },
  { key: "polyglot_sampler", name: "Polyglot Sampler", description: "Have nouns, verbs AND adjectives", icon: "🎨", category: "variety" },
  { key: "gender_expert", name: "Gender Expert", description: "Have 5 words of each gender (der/die/das)", icon: "⚖️", category: "variety" },

  // ── Special ──
  { key: "daily_goal", name: "Goal Crusher", description: "Completed daily goal for the first time", icon: "🎉", category: "special" },
  { key: "night_owl", name: "Night Owl", description: "Studied past midnight", icon: "🦉", category: "special" },
  { key: "early_bird", name: "Early Bird", description: "Studied before 7am", icon: "🐦", category: "special" },
  { key: "weekend_warrior", name: "Weekend Warrior", description: "Studied on both Saturday and Sunday", icon: "🎮", category: "special" },
  { key: "comeback_kid", name: "Comeback Kid", description: "Returned after a 7+ day break", icon: "🔄", category: "special" },
];

export function checkBadges(params: {
  wordCount: number;
  totalReviews: number;
  streak: number;
  level: number;
  dailyGoalCompleted: boolean;
  existingBadgeKeys: string[];
  // New params
  perfectSession?: boolean;
  sessionCardCount?: number;
  accuracyRate?: number; // 0-1, recent sessions
  reviewsWithoutAgain?: number;
  a1Count?: number;
  a2Count?: number;
  b1Count?: number;
  b2Count?: number;
  c1Count?: number;
  c2Count?: number;
  nounCount?: number;
  verbCount?: number;
  adjCount?: number;
  masculineCount?: number;
  feminineCount?: number;
  neutralCount?: number;
  studyHour?: number; // 0-23
  studiedWeekend?: boolean;
  comebackAfterBreak?: boolean;
}): string[] {
  const {
    wordCount, totalReviews, streak, level, dailyGoalCompleted, existingBadgeKeys,
    perfectSession, sessionCardCount, accuracyRate, reviewsWithoutAgain,
    a1Count = 0, a2Count = 0, b1Count = 0, b2Count = 0, c1Count = 0, c2Count = 0,
    nounCount = 0, verbCount = 0, adjCount = 0,
    masculineCount = 0, feminineCount = 0, neutralCount = 0,
    studyHour, studiedWeekend, comebackAfterBreak,
  } = params;

  const earned = new Set(existingBadgeKeys);
  const newBadges: string[] = [];

  const check = (key: string, condition: boolean) => {
    if (condition && !earned.has(key)) newBadges.push(key);
  };

  // Vocabulary
  check("first_word", wordCount >= 1);
  check("words_10", wordCount >= 10);
  check("words_25", wordCount >= 25);
  check("words_50", wordCount >= 50);
  check("words_100", wordCount >= 100);
  check("words_250", wordCount >= 250);
  check("words_500", wordCount >= 500);
  check("words_1000", wordCount >= 1000);

  // Reviews
  check("first_review", totalReviews >= 1);
  check("reviews_10", totalReviews >= 10);
  check("reviews_50", totalReviews >= 50);
  check("reviews_100", totalReviews >= 100);
  check("reviews_250", totalReviews >= 250);
  check("reviews_500", totalReviews >= 500);
  check("reviews_1000", totalReviews >= 1000);
  check("reviews_5000", totalReviews >= 5000);

  // Streaks
  check("streak_3", streak >= 3);
  check("streak_7", streak >= 7);
  check("streak_14", streak >= 14);
  check("streak_30", streak >= 30);
  check("streak_60", streak >= 60);
  check("streak_100", streak >= 100);
  check("streak_365", streak >= 365);

  // Levels
  check("level_5", level >= 5);
  check("level_10", level >= 10);
  check("level_15", level >= 15);
  check("level_20", level >= 20);

  // Accuracy / performance
  check("perfect_session", !!perfectSession);
  check("accuracy_80", totalReviews >= 20 && (accuracyRate ?? 0) >= 0.8);
  check("accuracy_90", totalReviews >= 50 && (accuracyRate ?? 0) >= 0.9);
  check("no_again_10", (reviewsWithoutAgain ?? 0) >= 10);
  check("speed_demon", (sessionCardCount ?? 0) >= 20);

  // CEFR
  check("cefr_a1", a1Count >= 1);
  check("cefr_a2", a2Count >= 10);
  check("cefr_b1", b1Count >= 10);
  check("cefr_b2", b2Count >= 10);
  check("cefr_c1", c1Count >= 5);
  check("cefr_c2", c2Count >= 5);

  // Variety
  check("noun_master", nounCount >= 20);
  check("verb_master", verbCount >= 20);
  check("adj_master", adjCount >= 15);
  check("polyglot_sampler", nounCount >= 1 && verbCount >= 1 && adjCount >= 1);
  check("gender_expert", masculineCount >= 5 && feminineCount >= 5 && neutralCount >= 5);

  // Special
  check("daily_goal", dailyGoalCompleted);
  check("night_owl", studyHour !== undefined && (studyHour >= 0 && studyHour <= 4));
  check("early_bird", studyHour !== undefined && studyHour >= 5 && studyHour <= 6);
  check("weekend_warrior", !!studiedWeekend);
  check("comeback_kid", !!comebackAfterBreak);

  return newBadges;
}
