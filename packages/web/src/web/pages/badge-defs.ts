// Mirror of server-side badge definitions for display in the UI
export const BADGE_DEFS: Record<string, { icon: string; name: string; desc: string }> = {
  first_word:   { icon: "🌱", name: "First Step",        desc: "Added your first word" },
  words_10:     { icon: "📚", name: "Vocab Starter",     desc: "Added 10 words" },
  words_50:     { icon: "🗂️", name: "Word Collector",    desc: "Added 50 words" },
  words_100:    { icon: "📖", name: "Lexicon",            desc: "Added 100 words" },
  first_review: { icon: "✨", name: "First Review",      desc: "Completed first review" },
  reviews_10:   { icon: "🔥", name: "Getting Started",   desc: "10 reviews done" },
  reviews_100:  { icon: "💪", name: "Dedicated Learner", desc: "100 reviews done" },
  reviews_500:  { icon: "🏆", name: "Master Student",    desc: "500 reviews done" },
  streak_3:     { icon: "🎯", name: "Hat Trick",         desc: "3-day streak" },
  streak_7:     { icon: "⚡", name: "Week Warrior",      desc: "7-day streak" },
  streak_30:    { icon: "🌟", name: "Monthly Master",    desc: "30-day streak" },
  level_5:      { icon: "⭐", name: "Rising Star",       desc: "Reached level 5" },
  level_10:     { icon: "🎓", name: "Expert Learner",    desc: "Reached level 10" },
  daily_goal:   { icon: "🎉", name: "Goal Crusher",      desc: "Completed daily goal" },
};
