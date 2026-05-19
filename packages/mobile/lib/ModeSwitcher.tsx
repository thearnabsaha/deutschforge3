import React, { useState } from "react";
import type { ModeConfig } from "./appMode";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from "react-native";
import { BookOpen, PenLine, Target, Check, Clock, GraduationCap } from "lucide-react-native";
import { useTheme } from "./theme";
import { useAppMode, MODE_CONFIGS, type AppMode } from "./appMode";

function ModeIcon({ mode, size, color }: { mode: AppMode; size: number; color: string }) {
  if (mode === "learn") return <GraduationCap size={size} color={color} strokeWidth={2.5} />;
  if (mode === "words") return <BookOpen size={size} color={color} strokeWidth={2.5} />;
  if (mode === "grammar") return <PenLine size={size} color={color} strokeWidth={2.5} />;
  return <Target size={size} color={color} strokeWidth={2.5} />;
}

// ─── Mode Badge (top-right button) ────────────────────────────────────────────
export function ModeBadge() {
  const { modeConfig, mode } = useAppMode();
  const [open, setOpen] = useState(false);
  const { theme: t } = useTheme();

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
        style={[
          badge.btn,
          { backgroundColor: modeConfig.color + "22", borderColor: modeConfig.color + "55" },
        ]}
      >
        <ModeIcon mode={mode} size={18} color={modeConfig.color} />
        <View style={[badge.dot, { backgroundColor: modeConfig.color }]} />
      </TouchableOpacity>
      <ModeSwitcherModal visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

const badge = StyleSheet.create({
  btn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#fff",
  },
});

// ─── Mode Switcher Modal ───────────────────────────────────────────────────────
export function ModeSwitcherModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { theme: t } = useTheme();
  const { mode, setMode } = useAppMode();

  const handleSelect = (key: AppMode) => {
    setMode(key);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={modal.overlay} onPress={onClose} />
      <View style={[modal.sheet, { backgroundColor: t.surface }]}>
        {/* Handle */}
        <View style={[modal.handle, { backgroundColor: t.border }]} />

        <Text style={[modal.title, { color: t.text }]}>Choose Mode</Text>
        <Text style={[modal.sub, { color: t.textMuted }]}>
          Your app restructures around the selected mode
        </Text>

        <View style={modal.cards}>
          {(Object.values(MODE_CONFIGS) as ModeConfig[]).map((cfg) => {
            const active = mode === cfg.key;
            return (
              <TouchableOpacity
                key={cfg.key}
                onPress={() => handleSelect(cfg.key)}
                activeOpacity={0.85}
                style={[
                  modal.card,
                  {
                    backgroundColor: active ? cfg.color + "18" : t.surfaceAlt,
                    borderColor: active ? cfg.color : t.border,
                    borderWidth: active ? 2 : 1.5,
                  },
                ]}
              >
                {/* Icon circle */}
                <View style={[modal.iconCircle, { backgroundColor: cfg.color + "22" }]}>
                  <ModeIcon mode={cfg.key} size={24} color={cfg.color} />
                </View>

                {/* Text */}
                <View style={modal.cardBody}>
                  <View style={modal.cardRow}>
                    <Text style={[modal.cardLabel, { color: t.text }]}>{cfg.label}</Text>
                  </View>
                  <Text style={[modal.cardTagline, { color: t.textMuted }]}>
                    {cfg.tagline}
                  </Text>
                </View>

                {/* Active check */}
                {active && (
                  <Check size={18} color={cfg.color} strokeWidth={3} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity onPress={onClose} style={[modal.closeBtn, { backgroundColor: t.surfaceAlt }]}>
          <Text style={[modal.closeTxt, { color: t.textMuted }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const modal = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    gap: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: "900", textAlign: "center" },
  sub: { fontSize: 13, textAlign: "center", marginBottom: 20 },
  cards: { gap: 12, marginBottom: 16 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    padding: 16,
    gap: 14,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1, gap: 3 },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardLabel: { fontSize: 17, fontWeight: "800" },
  cardTagline: { fontSize: 13, fontWeight: "500" },
  comingTag: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  comingTagTxt: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  closeBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  closeTxt: { fontSize: 15, fontWeight: "700" },
});
