/**
 * examImageMap — maps imageHint keywords → bundled require() paths.
 * Images live in assets/exam-images/ (pre-generated AI art).
 * Usage: getExamImage("a coffee cup") → ImageSourcePropType | null
 *
 * ORDER MATTERS: more specific entries must come before generic catch-alls.
 */

import { ImageSourcePropType } from "react-native";

const MAP: Array<{ keys: string[]; src: ImageSourcePropType }> = [
  // ── Seasons (before weather so "spring/summer/autumn" hits here first) ──
  {
    keys: ["season", "jahreszeit", "spring", "summer", "autumn", "winter",
           "frühling", "herbst", "sommer", "leaves", "flowers", "bloom"],
    src: require("../assets/exam-images/seasons.png"),
  },

  // ── Sports (before activities so "swim/run/tennis" hits sport first) ──
  // Note: bicycle/bike are in transport only
  {
    keys: ["sport", "sports", "soccer", "football", "swim", "swimming", "pool",
           "run", "gym", "tennis", "basketball", "volleyball", "jogging", "fußball"],
    src: require("../assets/exam-images/sports.png"),
  },

  // ── Directions / map (specific before generic "street" in transport) ──
  {
    keys: ["direction", "map", "karte", "pharmacy", "apotheke", "straße",
           "weg", "left", "right", "straight", "navigate", "route", "sign"],
    src: require("../assets/exam-images/directions.png"),
  },

  // ── Drinks (coffee/tea — before beverages which has "drink" too) ──
  {
    keys: ["coffee", "tea", "cup", "café", "cafe", "espresso", "latte",
           "cappuccino", "beer", "wine", "bier", "wein"],
    src: require("../assets/exam-images/drinks.png"),
  },

  // ── Beverages (juice, water, milk — after specific drink entry) ──
  {
    keys: ["beverage", "juice", "water", "saft", "wasser", "milk", "milch",
           "flask", "bottle", "getränk"],
    src: require("../assets/exam-images/beverages.png"),
  },

  // ── Breakfast ──
  {
    keys: ["breakfast", "toast", "bread", "brötchen", "frühstück", "jam",
           "butter", "muesli", "müsli", "eggs", "ei", "cereal"],
    src: require("../assets/exam-images/breakfast.png"),
  },

  // ── Weather (after seasons so "spring/summer" doesn't land here) ──
  {
    keys: ["weather", "rain", "sun", "cloud", "wetter", "storm", "wind",
           "snow", "regen", "bewölkt", "sonnig"],
    src: require("../assets/exam-images/weather.png"),
  },

  // ── Transport ──
  {
    keys: ["transport", "bus", "train", "car", "zug", "auto", "bahn",
           "tram", "metro", "taxi", "bicycle", "bike", "fahrrad", "plane",
           "flugzeug", "vehicle"],
    src: require("../assets/exam-images/transport.png"),
  },

  // ── Clothing ──
  {
    keys: ["cloth", "shirt", "dress", "jacket", "kleid", "hose", "mode",
           "fashion", "outfit", "trousers", "skirt", "rock", "bluse", "anzug",
           "scarf", "schal", "wear", "wardrobe"],
    src: require("../assets/exam-images/clothing.png"),
  },

  // ── Activities (before housing so "kitchen" alone doesn't pull housing) ──
  {
    keys: ["activity", "hobby", "leisure", "freizeit", "kochen", "cooking",
           "baking", "gardening", "housework", "sleeping", "schlafen",
           "singen", "sing", "tanzen", "dance", "clean", "putzen", "malen",
           "paint", "knit", "stricken"],
    src: require("../assets/exam-images/activities.png"),
  },

  // ── Housing (kitchen only if "kitchen" appears alone/with home words) ──
  {
    keys: ["house", "room", "apartment", "wohnung", "zimmer", "kitchen",
           "küche", "home", "living", "bathroom", "badezimmer", "bedroom",
           "schlafzimmer", "balcony", "balkon"],
    src: require("../assets/exam-images/housing.png"),
  },

  // ── Animals ──
  {
    keys: ["animal", "dog", "cat", "bird", "tier", "hund", "katze", "horse",
           "cow", "pferd", "kuh", "fish", "fisch", "rabbit", "kaninchen"],
    src: require("../assets/exam-images/animals.png"),
  },

  // ── Shopping ──
  {
    keys: ["shop", "store", "market", "supermarkt", "einkauf", "buy",
           "price", "mall", "kaufen", "laden", "backpack", "rucksack",
           "notebook", "notizbuch", "stationery"],
    src: require("../assets/exam-images/shopping.png"),
  },

  // ── Family & outings ──
  {
    keys: ["family", "child", "parent", "eltern", "kinder", "together",
           "picnic", "outing", "man", "woman", "person", "leute", "people",
           "together", "gruppe"],
    src: require("../assets/exam-images/family_activities.png"),
  },

  // ── Travel / destinations ──
  {
    keys: ["travel", "destination", "holiday", "urlaub", "reise", "beach",
           "mountain", "city", "hotel", "hostel", "airport", "flughafen",
           "sightseeing"],
    src: require("../assets/exam-images/destinations.png"),
  },

  // ── Reading / books ──
  {
    keys: ["read", "book", "newspaper", "zeitung", "buch", "magazine",
           "lesen", "library", "bibliothek"],
    src: require("../assets/exam-images/reading_items.png"),
  },

  // ── Sky / colors (least specific, catch-all visuals) ──
  {
    keys: ["sky", "color", "farbe", "himmel", "blue", "blau", "sunset",
           "sunrise", "dawn", "rot", "grün"],
    src: require("../assets/exam-images/sky_colors.png"),
  },

  // ── Hören banner ──
  {
    keys: ["hoeren", "listen", "audio", "hören", "headphone", "speaker", "ear"],
    src: require("../assets/exam-images/hoeren_banner.png"),
  },
];

/** Returns the best matching image source for an imageHint string, or null.
 *  Uses word-boundary matching so "sport" does not match inside "transport".
 */
export function getExamImage(hint: string | undefined | null): ImageSourcePropType | null {
  if (!hint) return null;
  const lower = hint.toLowerCase();
  for (const entry of MAP) {
    for (const key of entry.keys) {
      // Escape regex special chars, then wrap with negative lookbehind/lookahead
      const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp("(?<![a-z\u00e4\u00f6\u00fc\u00df])" + escaped + "(?![a-z\u00e4\u00f6\u00fc\u00df])");
      if (re.test(lower)) return entry.src;
    }
  }
  return null;
}
