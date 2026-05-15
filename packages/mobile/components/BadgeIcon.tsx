import React from "react";
import Svg, { Circle, Path, G, Defs, LinearGradient, Stop, Polygon, Rect } from "react-native-svg";

export type BadgeTier = "copper" | "silver" | "gold" | "platinum" | "diamond" | "special";

interface BadgeIconProps {
  type: string;       // badge key category (vocab, review, streak, etc.)
  tier?: BadgeTier;
  size?: number;
  earned?: boolean;
}

const TIER_COLORS: Record<BadgeTier, { outer: string; inner: string; shine: string; text: string }> = {
  copper:   { outer: "#B87333", inner: "#D4956A", shine: "#E8B89A", text: "#fff" },
  silver:   { outer: "#9E9E9E", inner: "#C8C8C8", shine: "#E8E8E8", text: "#fff" },
  gold:     { outer: "#C8920A", inner: "#FFD93D", shine: "#FFF0A0", text: "#fff" },
  platinum: { outer: "#5B8EBD", inner: "#8EC5F5", shine: "#C4E4FF", text: "#fff" },
  diamond:  { outer: "#9B59B6", inner: "#CE82FF", shine: "#ECC6FF", text: "#fff" },
  special:  { outer: "#E74C3C", inner: "#FF8A80", shine: "#FFCDD2", text: "#fff" },
};

// Icon shapes per badge category
function BadgeShape({ type, color, size }: { type: string; color: string; size: number }) {
  const s = size / 24;
  const c = size / 2;

  switch (type) {
    case "vocab":
    case "vocabulary":
      // Book shape
      return (
        <G>
          <Rect x={c - 6 * s} y={c - 7 * s} width={12 * s} height={14 * s} rx={1.5 * s} fill={color} opacity={0.9} />
          <Rect x={c - 3 * s} y={c - 5 * s} width={6 * s} height={1.5 * s} rx={0.5 * s} fill="rgba(255,255,255,0.6)" />
          <Rect x={c - 3 * s} y={c - 2 * s} width={6 * s} height={1.5 * s} rx={0.5 * s} fill="rgba(255,255,255,0.6)" />
          <Rect x={c - 3 * s} y={c + 1 * s} width={4 * s} height={1.5 * s} rx={0.5 * s} fill="rgba(255,255,255,0.6)" />
        </G>
      );
    case "review":
    case "reviews":
      // Lightning bolt
      return (
        <Path
          d={`M${c + 2 * s} ${c - 7 * s} L${c - 4 * s} ${c + 1 * s} L${c + 1 * s} ${c + 1 * s} L${c - 2 * s} ${c + 7 * s} L${c + 5 * s} ${c - 1 * s} L${c} ${c - 1 * s} Z`}
          fill={color}
          opacity={0.9}
        />
      );
    case "streak":
      // Flame
      return (
        <G>
          <Path
            d={`M${c} ${c + 7 * s} C${c - 8 * s} ${c + 5 * s} ${c - 7 * s} ${c - 3 * s} ${c - 1 * s} ${c - 5 * s} C${c - 2 * s} ${c - 1 * s} ${c - 1 * s} ${c + 1 * s} ${c} ${c - 1 * s} C${c + 1 * s} ${c - 4 * s} ${c + 3 * s} ${c - 7 * s} ${c + 2 * s} ${c - 7 * s} C${c + 5 * s} ${c - 3 * s} ${c + 8 * s} ${c + 3 * s} ${c} ${c + 7 * s} Z`}
            fill={color}
            opacity={0.9}
          />
          <Path
            d={`M${c} ${c + 4 * s} C${c - 3 * s} ${c + 3 * s} ${c - 2 * s} ${c} ${c} ${c - 1 * s} C${c + 1 * s} ${c + 1 * s} ${c + 3 * s} ${c + 2 * s} ${c} ${c + 4 * s} Z`}
            fill="rgba(255,255,255,0.5)"
          />
        </G>
      );
    case "level":
      // Star
      return (
        <Polygon
          points={`${c},${c - 7 * s} ${c + 2.5 * s},${c - 2 * s} ${c + 8 * s},${c - 2 * s} ${c + 3.5 * s},${c + 2 * s} ${c + 5 * s},${c + 7 * s} ${c},${c + 4 * s} ${c - 5 * s},${c + 7 * s} ${c - 3.5 * s},${c + 2 * s} ${c - 8 * s},${c - 2 * s} ${c - 2.5 * s},${c - 2 * s}`}
          fill={color}
          opacity={0.9}
        />
      );
    case "accuracy":
      // Target / bullseye
      return (
        <G>
          <Circle cx={c} cy={c} r={7 * s} fill="none" stroke={color} strokeWidth={2 * s} opacity={0.9} />
          <Circle cx={c} cy={c} r={4.5 * s} fill="none" stroke={color} strokeWidth={2 * s} opacity={0.9} />
          <Circle cx={c} cy={c} r={2 * s} fill={color} opacity={0.9} />
        </G>
      );
    case "cefr":
      // Graduation cap
      return (
        <G>
          <Path d={`M${c - 7 * s} ${c} L${c} ${c - 5 * s} L${c + 7 * s} ${c} L${c} ${c + 3 * s} Z`} fill={color} opacity={0.9} />
          <Rect x={c + 3 * s} y={c} width={1.5 * s} height={5 * s} fill={color} opacity={0.7} />
          <Circle cx={c + 3.5 * s} cy={c + 5 * s} r={1.5 * s} fill={color} opacity={0.7} />
          <Rect x={c - 4 * s} y={c + 2 * s} width={8 * s} height={4 * s} rx={1 * s} fill={color} opacity={0.7} />
        </G>
      );
    case "variety":
      // Palette / puzzle
      return (
        <G>
          <Circle cx={c - 3 * s} cy={c - 3 * s} r={4 * s} fill={color} opacity={0.8} />
          <Circle cx={c + 3 * s} cy={c - 3 * s} r={4 * s} fill={color} opacity={0.6} />
          <Circle cx={c} cy={c + 3 * s} r={4 * s} fill={color} opacity={0.7} />
        </G>
      );
    case "special":
    default:
      // Sparkle / diamond
      return (
        <G>
          <Path d={`M${c} ${c - 7 * s} L${c + 3 * s} ${c - 1 * s} L${c + 7 * s} ${c} L${c + 3 * s} ${c + 1 * s} L${c} ${c + 7 * s} L${c - 3 * s} ${c + 1 * s} L${c - 7 * s} ${c} L${c - 3 * s} ${c - 1 * s} Z`}
            fill={color} opacity={0.9} />
        </G>
      );
  }
}

export function BadgeIcon({ type, tier = "copper", size = 48, earned = true }: BadgeIconProps) {
  const tc = TIER_COLORS[tier];
  const gradId = `bg_${type}_${tier}`;
  const opacity = earned ? 1 : 0.35;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} opacity={opacity}>
      <Defs>
        <LinearGradient id={gradId} x1="30%" y1="0%" x2="70%" y2="100%">
          <Stop offset="0%" stopColor={tc.shine} />
          <Stop offset="40%" stopColor={tc.inner} />
          <Stop offset="100%" stopColor={tc.outer} />
        </LinearGradient>
      </Defs>
      {/* Outer shield/hexagon shape */}
      <Path
        d={`M${size / 2} ${size * 0.06} L${size * 0.88} ${size * 0.22} L${size * 0.94} ${size * 0.58} L${size / 2} ${size * 0.96} L${size * 0.06} ${size * 0.58} L${size * 0.12} ${size * 0.22} Z`}
        fill={`url(#${gradId})`}
      />
      {/* Inner inset */}
      <Path
        d={`M${size / 2} ${size * 0.12} L${size * 0.83} ${size * 0.26} L${size * 0.88} ${size * 0.57} L${size / 2} ${size * 0.89} L${size * 0.12} ${size * 0.57} L${size * 0.17} ${size * 0.26} Z`}
        fill="rgba(0,0,0,0.15)"
      />
      {/* Icon shape centered */}
      <BadgeShape type={type} color={tc.shine} size={size * 0.6} />
    </Svg>
  );
}

// Map badge key → tier + type
export function getBadgeTierAndType(key: string): { tier: BadgeTier; type: string } {
  // Vocabulary
  if (key === "first_word") return { tier: "copper", type: "vocabulary" };
  if (key === "words_10")   return { tier: "copper", type: "vocabulary" };
  if (key === "words_25")   return { tier: "silver", type: "vocabulary" };
  if (key === "words_50")   return { tier: "silver", type: "vocabulary" };
  if (key === "words_100")  return { tier: "gold", type: "vocabulary" };
  if (key === "words_250")  return { tier: "gold", type: "vocabulary" };
  if (key === "words_500")  return { tier: "platinum", type: "vocabulary" };
  if (key === "words_1000") return { tier: "diamond", type: "vocabulary" };

  // Reviews
  if (key === "first_review")  return { tier: "copper", type: "reviews" };
  if (key === "reviews_10")    return { tier: "copper", type: "reviews" };
  if (key === "reviews_50")    return { tier: "silver", type: "reviews" };
  if (key === "reviews_100")   return { tier: "silver", type: "reviews" };
  if (key === "reviews_250")   return { tier: "gold", type: "reviews" };
  if (key === "reviews_500")   return { tier: "gold", type: "reviews" };
  if (key === "reviews_1000")  return { tier: "platinum", type: "reviews" };
  if (key === "reviews_5000")  return { tier: "diamond", type: "reviews" };

  // Streaks
  if (key === "streak_3")   return { tier: "copper", type: "streak" };
  if (key === "streak_7")   return { tier: "silver", type: "streak" };
  if (key === "streak_14")  return { tier: "silver", type: "streak" };
  if (key === "streak_30")  return { tier: "gold", type: "streak" };
  if (key === "streak_60")  return { tier: "gold", type: "streak" };
  if (key === "streak_100") return { tier: "platinum", type: "streak" };
  if (key === "streak_365") return { tier: "diamond", type: "streak" };

  // Levels
  if (key === "level_5")  return { tier: "copper", type: "level" };
  if (key === "level_10") return { tier: "silver", type: "level" };
  if (key === "level_15") return { tier: "gold", type: "level" };
  if (key === "level_20") return { tier: "platinum", type: "level" };

  // Accuracy
  if (key === "perfect_session") return { tier: "gold", type: "accuracy" };
  if (key === "accuracy_80")     return { tier: "silver", type: "accuracy" };
  if (key === "accuracy_90")     return { tier: "gold", type: "accuracy" };
  if (key === "no_again_10")     return { tier: "silver", type: "accuracy" };
  if (key === "speed_demon")     return { tier: "gold", type: "accuracy" };

  // CEFR
  if (key === "cefr_a1") return { tier: "copper", type: "cefr" };
  if (key === "cefr_a2") return { tier: "copper", type: "cefr" };
  if (key === "cefr_b1") return { tier: "silver", type: "cefr" };
  if (key === "cefr_b2") return { tier: "gold", type: "cefr" };
  if (key === "cefr_c1") return { tier: "platinum", type: "cefr" };
  if (key === "cefr_c2") return { tier: "diamond", type: "cefr" };

  // Variety
  if (key === "noun_master")       return { tier: "silver", type: "variety" };
  if (key === "verb_master")       return { tier: "silver", type: "variety" };
  if (key === "adj_master")        return { tier: "silver", type: "variety" };
  if (key === "polyglot_sampler")  return { tier: "gold", type: "variety" };
  if (key === "gender_expert")     return { tier: "gold", type: "variety" };

  // Special
  return { tier: "special", type: "special" };
}

// Tier label for display
export const TIER_LABELS: Record<BadgeTier, string> = {
  copper:   "Copper",
  silver:   "Silver",
  gold:     "Gold",
  platinum: "Platinum",
  diamond:  "Diamond",
  special:  "Special",
};
