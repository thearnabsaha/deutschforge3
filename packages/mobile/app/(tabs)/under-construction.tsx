import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Wrench,
  BookOpen,
  PenLine,
  Target,
  ChevronRight,
  ArrowLeft,
} from "lucide-react-native";
import { useTheme } from "../../lib/theme";
import { useAppMode } from "../../lib/appMode";
import { ModeSwitcherModal } from "../../lib/ModeSwitcher";

const FEATURES: Record<string, { icon: any; label: string }[]> = {
  grammar: [
    { icon: PenLine, label: "Noun genders & declensions" },
    { icon: PenLine, label: "Verb conjugation tables" },
    { icon: PenLine, label: "Case system (Nom / Akk / Dat / Gen)" },
    { icon: PenLine, label: "Sentence structure drills" },
    { icon: PenLine, label: "Interactive grammar exercises" },
  ],
  exam: [
    { icon: Target, label: "Goethe A1 / A2 mock exams" },
    { icon: Target, label: "Timed test sessions" },
    { icon: Target, label: "Performance analytics" },
    { icon: Target, label: "Weak-area targeting" },
    { icon: Target, label: "Certificate readiness score" },
  ],
};

function ModeIcon({ mode, size, color }: { mode: string; size: number; color: string }) {
  if (mode === "grammar") return <PenLine size={size} color={color} strokeWidth={2} />;
  if (mode === "exam") return <Target size={size} color={color} strokeWidth={2} />;
  return <BookOpen size={size} color={color} strokeWidth={2} />;
}

export default function UnderConstruction() {
  const { theme: t } = useTheme();
  const { mode, modeConfig, setMode } = useAppMode();
  const [showSwitcher, setShowSwitcher] = React.useState(false);

  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const features = FEATURES[mode] ?? [];
  const color = modeConfig.color;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: t.background }]} edges={["top", "left", "right"]}>
      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity
          onPress={() => setMode("words")}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={24} color={t.text} strokeWidth={2.5} />
        </TouchableOpacity>

        <Text style={[s.topTitle, { color: t.text }]}>{modeConfig.label} Mode</Text>

        <TouchableOpacity
          onPress={() => setShowSwitcher(true)}
          activeOpacity={0.8}
          style={[s.modeBadge, { backgroundColor: color + "22", borderColor: color + "55" }]}
        >
          <ModeIcon mode={mode} size={18} color={color} />
          <View style={[s.dot, { backgroundColor: color }]} />
        </TouchableOpacity>
      </View>

      <View style={s.body}>
        {/* Pulsing icon */}
        <Animated.View
          style={[
            s.iconWrap,
            { backgroundColor: color + "15", borderColor: color + "30", transform: [{ scale: pulse }] },
          ]}
        >
          <Wrench size={52} color={color} strokeWidth={1.5} />
        </Animated.View>

        <Text style={[s.heading, { color: t.text }]}>Under Construction</Text>
        <Text style={[s.sub, { color: t.textMuted }]}>
          {modeConfig.label} mode is being built.{"\n"}Here's what's coming:
        </Text>

        {/* Feature list */}
        <View style={[s.featureCard, { backgroundColor: t.surface, borderColor: t.border }]}>
          {features.map((f, i) => (
            <View
              key={i}
              style={[
                s.featureRow,
                i < features.length - 1 && { borderBottomColor: t.border, borderBottomWidth: StyleSheet.hairlineWidth },
              ]}
            >
              <View style={[s.featureDot, { backgroundColor: color }]} />
              <Text style={[s.featureTxt, { color: t.text }]}>{f.label}</Text>
              <ChevronRight size={14} color={t.border} strokeWidth={2} />
            </View>
          ))}
        </View>

        {/* Back to Words */}
        <TouchableOpacity
          style={[s.cta, { backgroundColor: "#58CC02" }]}
          onPress={() => setMode("words")}
          activeOpacity={0.85}
        >
          <BookOpen size={18} color="#fff" strokeWidth={2.5} />
          <Text style={s.ctaTxt}>Back to Words Mode</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowSwitcher(true)}
          activeOpacity={0.7}
          style={s.switchRow}
        >
          <Text style={[s.switchLink, { color: color }]}>Switch mode</Text>
          <ChevronRight size={14} color={color} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ModeSwitcherModal visible={showSwitcher} onClose={() => setShowSwitcher(false)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topTitle: { fontSize: 17, fontWeight: "800" },
  modeBadge: {
    width: 42, height: 42, borderRadius: 21,
    borderWidth: 2, alignItems: "center", justifyContent: "center",
  },
  dot: {
    position: "absolute", bottom: 1, right: 1,
    width: 10, height: 10, borderRadius: 5,
    borderWidth: 2, borderColor: "#fff",
  },
  body: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 16,
  },
  iconWrap: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  heading: { fontSize: 26, fontWeight: "900", textAlign: "center" },
  sub: { fontSize: 14, textAlign: "center", lineHeight: 22, color: "#888" },
  featureCard: {
    width: "100%",
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: "hidden",
    marginTop: 4,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  featureDot: { width: 7, height: 7, borderRadius: 4 },
  featureTxt: { fontSize: 15, fontWeight: "600", flex: 1 },
  cta: {
    width: "100%",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
  },
  ctaTxt: { color: "#fff", fontSize: 16, fontWeight: "800" },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  switchLink: { fontSize: 14, fontWeight: "700" },
});
