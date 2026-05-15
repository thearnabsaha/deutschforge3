/**
 * examAudioPlayer — TTS + ambient audio utilities for the exam screens.
 *
 * TTS  : expo-speech, German voice (de-DE), speak any text instantly.
 * Ambient: expo-av Audio, loops a bundled MP3 in the background.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import * as Speech from "expo-speech";
import { Audio, AVPlaybackStatus } from "expo-av";

// ── TTS ──────────────────────────────────────────────────────────

/** Speak German text via TTS. Stops anything currently speaking first. */
export function speakGerman(text: string) {
  Speech.stop();
  Speech.speak(text, {
    language: "de-DE",
    pitch: 1.0,
    rate: 0.85, // slightly slower for learners
  });
}

/** Stop TTS immediately. */
export function stopSpeech() {
  Speech.stop();
}

/** Hook: returns { speaking, speak, stop } for a specific text. */
export function useTTS(text: string) {
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback(() => {
    Speech.stop();
    setSpeaking(true);
    Speech.speak(text, {
      language: "de-DE",
      pitch: 1.0,
      rate: 0.85,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }, [text]);

  const stop = useCallback(() => {
    Speech.stop();
    setSpeaking(false);
  }, []);

  // cleanup on unmount
  useEffect(() => () => { Speech.stop(); }, []);

  return { speaking, speak, stop };
}

// ── Ambient Audio ─────────────────────────────────────────────────

export type AmbientTrack = "cafe" | "street" | "neutral";

const AMBIENT_SOURCES: Record<AmbientTrack, any> = {
  cafe: require("../assets/exam-audio/cafe_ambient.mp3"),
  street: require("../assets/exam-audio/street_ambient.mp3"),
  neutral: require("../assets/exam-audio/neutral_ambient.mp3"),
};

const AMBIENT_LABELS: Record<AmbientTrack, string> = {
  cafe: "☕ Café",
  street: "🚶 Straße",
  neutral: "🔇 Neutral",
};

export { AMBIENT_LABELS };

/**
 * Hook: manages looping ambient audio.
 * Returns { playing, track, setTrack, toggle, stop }
 */
export function useAmbientAudio() {
  const [playing, setPlaying] = useState(false);
  const [track, setTrackState] = useState<AmbientTrack>("cafe");
  const soundRef = useRef<Audio.Sound | null>(null);

  const stopSound = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (_) {}
      soundRef.current = null;
    }
    setPlaying(false);
  }, []);

  const startSound = useCallback(async (t: AmbientTrack) => {
    await stopSound();
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        AMBIENT_SOURCES[t],
        { shouldPlay: true, isLooping: true, volume: 0.4 }
      );
      soundRef.current = sound;
      setPlaying(true);
    } catch (e) {
      console.warn("Ambient audio error:", e);
    }
  }, [stopSound]);

  const setTrack = useCallback(async (t: AmbientTrack) => {
    setTrackState(t);
    if (playing) {
      await startSound(t);
    }
  }, [playing, startSound]);

  const toggle = useCallback(async () => {
    if (playing) {
      await stopSound();
    } else {
      await startSound(track);
    }
  }, [playing, track, startSound, stopSound]);

  // cleanup on unmount
  useEffect(() => () => { stopSound(); }, [stopSound]);

  return { playing, track, setTrack, toggle, stop: stopSound };
}
