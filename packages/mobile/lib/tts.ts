/**
 * Shared TTS helper — detects best German voice once, caches it,
 * and provides a clean speakGerman() API with speaking state callbacks.
 */
import * as Speech from "expo-speech";

// undefined = not fetched yet; null = no German voice found
let _cachedVoice: Speech.Voice | null | undefined = undefined;

export async function getGermanVoice(): Promise<Speech.Voice | null> {
  if (_cachedVoice !== undefined) return _cachedVoice;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const deDE = voices.find((v) => v.language === "de-DE");
    const deAny = voices.find((v) => v.language?.startsWith("de"));
    _cachedVoice = deDE ?? deAny ?? null;
  } catch {
    _cachedVoice = null;
  }
  return _cachedVoice;
}

// Kick off voice detection immediately at module load — warm it up
getGermanVoice();

export async function speakGerman(
  text: string,
  opts?: { onStart?: () => void; onDone?: () => void }
): Promise<void> {
  try {
    const speaking = await Speech.isSpeakingAsync();
    if (speaking) await Speech.stop();

    const voice = await getGermanVoice();
    const options: Speech.SpeechOptions = {
      rate: 0.8,
      onStart: opts?.onStart,
      onDone: opts?.onDone,
      onError: opts?.onDone, // treat error as done
    };

    if (voice) {
      options.voice = voice.identifier;
      options.language = voice.language;
    } else {
      options.language = "de-DE"; // fallback hint
    }

    Speech.speak(text, options);
  } catch {
    opts?.onDone?.();
  }
}

export async function stopSpeaking(): Promise<void> {
  try {
    await Speech.stop();
  } catch {
    // ignore
  }
}
