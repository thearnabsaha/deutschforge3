import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  PanResponder,
  GestureResponderEvent,
  LayoutChangeEvent,
} from "react-native";
import { ArrowLeft, Play, Pause, Check } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme, THEMES, ThemeKey, Theme } from "../lib/theme";
import { musicPlayer, TRACKS, TrackKey, CLICK_SOUND_TYPES, ClickSoundType } from "../lib/music";

function useMusicState() {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const unsub = musicPlayer.subscribe(() => forceUpdate((n) => n + 1));
    return () => { unsub(); };
  }, []);
  return {
    enabled: musicPlayer.enabled,
    playing: musicPlayer.playing,
    trackKey: musicPlayer.trackKey,
    volume: musicPlayer.volume,
    clickEnabled: musicPlayer.clickEnabled,
    clickSoundType: musicPlayer.clickSoundType,
  };
}

function VolumeSlider({
  value,
  onChange,
  trackColor,
  bgColor,
}: {
  value: number;
  onChange: (v: number) => void;
  trackColor: string;
  bgColor: string;
}) {
  const trackRef = React.useRef<View>(null);
  const trackWidth = React.useRef(0);
  const trackPageX = React.useRef(0);

  const clamp = (v: number) => Math.min(1, Math.max(0, v));

  const measureTrack = () => {
    trackRef.current?.measure((_x, _y, w, _h, pageX, _pageY) => {
      trackWidth.current = w;
      trackPageX.current = pageX;
    });
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e: GestureResponderEvent) => {
        measureTrack();
        if (trackWidth.current > 0) {
          const x = e.nativeEvent.pageX - trackPageX.current;
          onChange(clamp(x / trackWidth.current));
        }
      },
      onPanResponderMove: (e: GestureResponderEvent) => {
        if (trackWidth.current > 0) {
          const x = e.nativeEvent.pageX - trackPageX.current;
          onChange(clamp(x / trackWidth.current));
        }
      },
    })
  ).current;

  const handleLayout = (e: LayoutChangeEvent) => {
    trackWidth.current = e.nativeEvent.layout.width;
    // also measure for pageX
    setTimeout(() => measureTrack(), 0);
  };

  const thumbLeft = Math.min(Math.max(value * 100, 0), 100);

  return (
    <View
      ref={trackRef}
      style={[styles.sliderTrack, { backgroundColor: bgColor }]}
      onLayout={handleLayout}
      {...panResponder.panHandlers}
    >
      <View style={[styles.sliderFill, { width: `${thumbLeft}%` as any, backgroundColor: trackColor }]} />
      <View
        style={[
          styles.sliderThumb,
          { left: `${thumbLeft}%` as any, backgroundColor: "#fff", borderColor: trackColor },
        ]}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, themeKey, setTheme } = useTheme();
  const music = useMusicState();

  const t = theme;

  const handleTheme = useCallback((key: ThemeKey) => {
    musicPlayer.playClick();
    setTheme(key);
  }, [setTheme]);

  const handleTrack = useCallback((key: TrackKey) => {
    musicPlayer.playClick();
    musicPlayer.setTrack(key);
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.background }]} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={22} color={t.primary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: t.text }]}>Settings</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* ─── APPEARANCE ─── */}
        <Text style={[styles.sectionTitle, { color: t.textMuted }]}>APPEARANCE</Text>
        <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
          <Text style={[styles.cardLabel, { color: t.text }]}>Theme</Text>
          <View style={styles.themeGrid}>
            {(Object.keys(THEMES) as Exclude<ThemeKey, "system">[]).map((key) => {
              const th: Theme = THEMES[key];
              const active = themeKey === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => handleTheme(key)}
                  activeOpacity={0.8}
                  style={[
                    styles.themeChip,
                    { backgroundColor: th.surface, borderColor: active ? th.primary : t.border },
                    active && styles.themeChipActive,
                  ]}
                >
                  {/* Mini preview swatch */}
                  <View style={[styles.themeSwatch, { backgroundColor: th.background }]}>
                    <View style={[styles.themeSwatchDot, { backgroundColor: th.primary }]} />
                    <View style={[styles.themeSwatchDotSmall, { backgroundColor: th.accent }]} />
                  </View>
                  <Text style={styles.themeEmoji}>{th.emoji}</Text>
                  <Text style={[styles.themeChipText, { color: active ? th.primary : t.textSecondary }]}>
                    {th.name}
                  </Text>
                  {active && (
                    <View style={[styles.themeCheckmark, { backgroundColor: th.primary }]}>
                      <Check size={11} color="#fff" strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ─── BACKGROUND MUSIC ─── */}
        <Text style={[styles.sectionTitle, { color: t.textMuted }]}>BACKGROUND MUSIC</Text>
        <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
          {/* Enable toggle */}
          <View style={styles.row}>
            <View>
              <Text style={[styles.rowLabel, { color: t.text }]}>Background Music</Text>
              <Text style={[styles.rowSub, { color: t.textMuted }]}>Play ambient music while studying</Text>
            </View>
            <Switch
              value={music.enabled}
              onValueChange={(v) => musicPlayer.setEnabled(v)}
              trackColor={{ false: t.border, true: t.primary + "66" }}
              thumbColor={music.enabled ? t.primary : t.textMuted}
            />
          </View>

          {music.enabled && (
            <>
              {/* Play/Pause */}
              <View style={[styles.divider, { backgroundColor: t.border }]} />
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: t.text }]}>Playback</Text>
                <TouchableOpacity
                  onPress={() => musicPlayer.togglePlay()}
                  style={[styles.playBtn, { backgroundColor: t.primary }]}
                  activeOpacity={0.8}
                >
                  {music.playing
                    ? <Pause size={18} color="#fff" strokeWidth={2} />
                    : <Play size={18} color="#fff" strokeWidth={2} />
                  }
                </TouchableOpacity>
              </View>

              {/* Track selector */}
              <View style={[styles.divider, { backgroundColor: t.border }]} />
              <Text style={[styles.rowLabel, { color: t.text, marginBottom: 10 }]}>Track</Text>
              <View style={styles.trackRow}>
                {TRACKS.map((track) => {
                  const active = music.trackKey === track.key;
                  return (
                    <TouchableOpacity
                      key={track.key}
                      onPress={() => handleTrack(track.key)}
                      activeOpacity={0.8}
                      style={[
                        styles.trackChip,
                        {
                          backgroundColor: active ? t.primary : t.surfaceAlt,
                          borderColor: active ? t.primaryDark : t.border,
                        },
                      ]}
                    >
                      <Text style={styles.trackEmoji}>{track.emoji}</Text>
                      <Text style={[styles.trackName, { color: active ? "#fff" : t.text }]}>
                        {track.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Volume */}
              <View style={[styles.divider, { backgroundColor: t.border }]} />
              <View style={styles.volumeRow}>
                <Text style={[styles.rowLabel, { color: t.text }]}>Volume</Text>
                <Text style={[styles.volumeValue, { color: t.primary }]}>
                  {Math.round(music.volume * 100)}%
                </Text>
              </View>
              <VolumeSlider
                value={music.volume}
                onChange={(v) => musicPlayer.setVolume(v)}
                trackColor={t.primary}
                bgColor={t.border}
              />
            </>
          )}
        </View>

        {/* ─── SOUND EFFECTS ─── */}
        <Text style={[styles.sectionTitle, { color: t.textMuted }]}>SOUND EFFECTS</Text>
        <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
          <View style={styles.row}>
            <View>
              <Text style={[styles.rowLabel, { color: t.text }]}>Tap Sounds</Text>
              <Text style={[styles.rowSub, { color: t.textMuted }]}>Play click feedback on button presses</Text>
            </View>
            <Switch
              value={music.clickEnabled}
              onValueChange={(v) => {
                musicPlayer.setClickEnabled(v);
                musicPlayer.playClick();
              }}
              trackColor={{ false: t.border, true: t.primary + "66" }}
              thumbColor={music.clickEnabled ? t.primary : t.textMuted}
            />
          </View>
          {music.clickEnabled && (
            <>
              <View style={[styles.divider, { backgroundColor: t.border }]} />
              <Text style={[styles.rowSub, { color: t.textMuted, marginBottom: 10, marginTop: 4 }]}>Sound type</Text>
              <View style={styles.soundChipsRow}>
                {CLICK_SOUND_TYPES.map((s) => {
                  const active = music.clickSoundType === s.key;
                  return (
                    <TouchableOpacity
                      key={s.key}
                      style={[
                        styles.soundChip,
                        { borderColor: active ? t.primary : t.border, backgroundColor: active ? t.primary + "22" : t.surfaceAlt },
                      ]}
                      onPress={() => {
                        musicPlayer.setClickSoundType(s.key as ClickSoundType);
                        if (s.key !== "none") musicPlayer.playClick();
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.soundChipEmoji}>{s.emoji}</Text>
                      <Text style={[styles.soundChipLabel, { color: active ? t.primary : t.textMuted }]}>{s.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, justifyContent: "center" },
  headerTitle: { fontSize: 22, fontWeight: "900" },

  container: { padding: 16 },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 4,
  },

  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 4,
  },
  cardLabel: { fontSize: 16, fontWeight: "700", marginBottom: 14 },

  // Theme picker
  themeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  themeChip: {
    borderRadius: 14,
    borderWidth: 2,
    padding: 12,
    alignItems: "center",
    width: "30%",
    position: "relative",
    minWidth: 90,
  },
  themeChipActive: { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 6, elevation: 3 },
  themeSwatch: {
    width: 40,
    height: 28,
    borderRadius: 8,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  themeSwatchDot: { width: 12, height: 12, borderRadius: 6 },
  themeSwatchDotSmall: { width: 8, height: 8, borderRadius: 4 },
  themeEmoji: { fontSize: 18, marginBottom: 4 },
  themeChipText: { fontSize: 11, fontWeight: "700" },
  themeCheckmark: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },


  // Music controls
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  rowLabel: { fontSize: 15, fontWeight: "700" },
  rowSub: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, marginVertical: 14, borderRadius: 1 },

  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  playBtnText: { fontSize: 20 },

  trackRow: { flexDirection: "row", gap: 10, marginBottom: 4 },
  trackChip: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 12,
    alignItems: "center",
    gap: 4,
  },
  trackEmoji: { fontSize: 22 },
  trackName: { fontSize: 12, fontWeight: "700" },

  volumeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  volumeValue: { fontSize: 14, fontWeight: "800" },
  sliderTrack: {
    height: 8, borderRadius: 4, marginVertical: 8,
    position: "relative", justifyContent: "center",
  },
  sliderFill: { height: "100%", borderRadius: 4 },
  sliderThumb: {
    position: "absolute",
    width: 22, height: 22, borderRadius: 11,
    marginLeft: -11, top: -7,
    borderWidth: 3,
    backgroundColor: "#fff",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  soundChipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  soundChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderWidth: 1.5, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  soundChipEmoji: { fontSize: 14 },
  soundChipLabel: { fontSize: 13, fontWeight: "700" },
});
