/**
 * DeutschForge — Global Design Tokens
 * Single source of truth for typography, spacing, and radius.
 * All screens should reference these values.
 */

export const FONT = {
  screenTitle:  { fontSize: 22, fontWeight: "900" as const },
  sectionTitle: { fontSize: 16, fontWeight: "800" as const },
  sectionLabel: { fontSize: 11, fontWeight: "800" as const, letterSpacing: 1.2 },
  cardTitle:    { fontSize: 15, fontWeight: "800" as const },
  rowLabel:     { fontSize: 15, fontWeight: "700" as const },
  rowSub:       { fontSize: 12, fontWeight: "500" as const },
  body:         { fontSize: 14, fontWeight: "400" as const },
  caption:      { fontSize: 11, fontWeight: "600" as const },
} as const;

export const RADIUS = {
  card:   16,
  chip:   20,
  icon:   10,
  button: 12,
} as const;

export const SPACE = {
  screen:  16,  // horizontal screen padding
  section: 20,  // vertical gap between sections
  card:    16,  // internal card padding
} as const;
