import type { ExpoSpeechRecognitionModule as ExpoSpeechRecognitionModuleType } from "expo-speech-recognition";

type SpeechModule = typeof ExpoSpeechRecognitionModuleType;

/**
 * Expo Go does not contain custom native modules. Load the recognizer lazily so
 * the rest of Connex, including the text fallback, remains usable there.
 */
export function getLocalSpeechModule(): SpeechModule | null {
  try {
    return require("expo-speech-recognition").ExpoSpeechRecognitionModule as SpeechModule;
  } catch {
    return null;
  }
}
