import { Audio } from "expo-av";
import { Storage } from "./storage";

export type TrackKey = "calm" | "focus" | "energetic" | "none";
export type ClickSoundType = "click" | "pop" | "swoosh" | "soft" | "none";

export interface Track {
  key: TrackKey;
  name: string;
  emoji: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  source: any;
}

export const TRACKS: Track[] = [
  { key: "calm", name: "Calm", emoji: "🌙", source: require("../assets/music/calm.mp3") },
  { key: "focus", name: "Focus", emoji: "🎯", source: require("../assets/music/focus.mp3") },
  { key: "energetic", name: "Energetic", emoji: "⚡", source: require("../assets/music/energetic.mp3") },
];

export const CLICK_SOUND_TYPES: { key: ClickSoundType; label: string; emoji: string }[] = [
  { key: "click", label: "Click", emoji: "🖱️" },
  { key: "pop", label: "Pop", emoji: "💫" },
  { key: "swoosh", label: "Swoosh", emoji: "💨" },
  { key: "soft", label: "Soft", emoji: "🎵" },
  { key: "none", label: "None", emoji: "🔇" },
];

const STORAGE_KEY_TRACK = "deutschforge:music:track";
const STORAGE_KEY_VOLUME = "deutschforge:music:volume";
const STORAGE_KEY_ENABLED = "deutschforge:music:enabled";
const STORAGE_KEY_CLICK = "deutschforge:sounds:click";
const STORAGE_KEY_CLICK_TYPE = "deutschforge:sounds:clickType";

const CLICK_SOURCES: Record<Exclude<ClickSoundType, "none">, any> = {
  click: require("../assets/sounds/click.mp3"),
  pop: require("../assets/sounds/pop.mp3"),
  swoosh: require("../assets/sounds/swoosh.mp3"),
  soft: require("../assets/sounds/soft.mp3"),
};

type Listener = () => void;

class MusicPlayer {
  private sound: Audio.Sound | null = null;
  private clickSounds: Partial<Record<Exclude<ClickSoundType, "none">, Audio.Sound>> = {};
  private _clickPlaying = false; // guard: prevent overlapping click sounds
  private _trackKey: TrackKey = "calm";
  private _volume: number = 0.5;
  private _playing: boolean = false;
  private _enabled: boolean = false;
  private _clickEnabled: boolean = true;
  private _clickSoundType: ClickSoundType = "click";
  private listeners: Set<Listener> = new Set();
  private initialized = false;

  get trackKey() { return this._trackKey; }
  get volume() { return this._volume; }
  get playing() { return this._playing; }
  get enabled() { return this._enabled; }
  get clickEnabled() { return this._clickEnabled; }
  get clickSoundType() { return this._clickSoundType; }

  async init() {
    if (this.initialized) return;
    this.initialized = true;

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
    } catch (_) {}

    // Load persisted settings
    const [trackVal, volumeVal, enabledVal, clickVal, clickTypeVal] = await Promise.all([
      Storage.getItem(STORAGE_KEY_TRACK),
      Storage.getItem(STORAGE_KEY_VOLUME),
      Storage.getItem(STORAGE_KEY_ENABLED),
      Storage.getItem(STORAGE_KEY_CLICK),
      Storage.getItem(STORAGE_KEY_CLICK_TYPE),
    ]);

    if (trackVal && TRACKS.find((t) => t.key === trackVal)) {
      this._trackKey = trackVal as TrackKey;
    }
    if (volumeVal) this._volume = parseFloat(volumeVal);
    // Default: music OFF, clicks ON
    this._enabled = enabledVal === "true";
    this._clickEnabled = clickVal !== "false";
    if (clickTypeVal && CLICK_SOUND_TYPES.find((s) => s.key === clickTypeVal)) {
      this._clickSoundType = clickTypeVal as ClickSoundType;
    }

    // Load all click sounds
    await Promise.all(
      (["click", "pop", "swoosh", "soft"] as const).map(async (type) => {
        try {
          const { sound } = await Audio.Sound.createAsync(CLICK_SOURCES[type], {
            volume: 1.0,
            shouldPlay: false,
          });
          this.clickSounds[type] = sound;
        } catch (_) {}
      })
    );

    if (this._enabled) {
      await this._loadAndPlay();
    }

    this.notify();
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private async _loadAndPlay() {
    await this._unload();
    const track = TRACKS.find((t) => t.key === this._trackKey) ?? TRACKS[0];
    try {
      const { sound } = await Audio.Sound.createAsync(
        track.source,
        { isLooping: true, volume: this._volume, shouldPlay: true }
      );
      this.sound = sound;
      this._playing = true;
    } catch (_) {
      this._playing = false;
    }
    this.notify();
  }

  private async _unload() {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
      } catch (_) {}
      this.sound = null;
    }
    this._playing = false;
  }

  async setEnabled(val: boolean) {
    this._enabled = val;
    Storage.setItem(STORAGE_KEY_ENABLED, String(val));
    if (val) {
      await this._loadAndPlay();
    } else {
      await this._unload();
      this._playing = false;
    }
    this.notify();
  }

  async togglePlay() {
    if (!this._enabled) return;
    if (this._playing) {
      try { await this.sound?.pauseAsync(); } catch (_) {}
      this._playing = false;
    } else {
      if (!this.sound) {
        await this._loadAndPlay();
        return;
      }
      try { await this.sound.playAsync(); } catch (_) {}
      this._playing = true;
    }
    this.notify();
  }

  async setTrack(key: TrackKey) {
    this._trackKey = key;
    Storage.setItem(STORAGE_KEY_TRACK, key);
    if (this._enabled) {
      await this._loadAndPlay();
    }
    this.notify();
  }

  async setVolume(vol: number) {
    this._volume = vol;
    Storage.setItem(STORAGE_KEY_VOLUME, String(vol));
    if (this.sound) {
      try { await this.sound.setVolumeAsync(vol); } catch (_) {}
    }
    this.notify();
  }

  async setClickEnabled(val: boolean) {
    this._clickEnabled = val;
    Storage.setItem(STORAGE_KEY_CLICK, String(val));
    this.notify();
  }

  async setClickSoundType(type: ClickSoundType) {
    this._clickSoundType = type;
    Storage.setItem(STORAGE_KEY_CLICK_TYPE, type);
    this.notify();
  }

  async playClick() {
    if (!this._clickEnabled) return;
    if (this._clickSoundType === "none") return;
    if (this._clickPlaying) return;

    const sound = this.clickSounds[this._clickSoundType as Exclude<ClickSoundType, "none">];
    if (!sound) return;

    this._clickPlaying = true;

    try {
      // Seek to start then play — more reliable than replayAsync across RN versions
      await sound.setPositionAsync(0);
      await sound.setVolumeAsync(1.0);
      await sound.playAsync();
    } catch (_) {}

    // Release guard after short delay — don't block on callback
    setTimeout(() => { this._clickPlaying = false; }, 400);
  }
}

export const musicPlayer = new MusicPlayer();
