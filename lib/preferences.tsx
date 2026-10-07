import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const KEY = "personal-assistant.preferences.v2";
export const ACCENT_PALETTES = ["#4F46E5", "#0F766E", "#C2410C", "#BE185D", "#7C3AED"] as const;
export type AccentPalette = (typeof ACCENT_PALETTES)[number];
export type Preferences = { name: string; email: string; notifications: boolean; darkMode: boolean; accent: string; timezone: string; sound: boolean; vibration: boolean; notificationTime: string };
const defaults: Preferences = { name: "", email: "", notifications: true, darkMode: false, accent: "#4F46E5", timezone: "UTC", sound: true, vibration: true, notificationTime: "09:00" };
export function normalizeProfileName(value: unknown) { return typeof value === "string" ? value.trim().slice(0, 80) : ""; }
export function normalizeProfileEmail(value: unknown) { return typeof value === "string" ? value.trim().toLowerCase().slice(0, 320) : ""; }
export function isValidProfileName(value: string) { return value.trim().length <= 80; }
export function isValidProfileEmail(value: string) { return value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }

export function normalizePreferences(raw: unknown): Preferences {
  const value = raw && typeof raw === "object" ? raw as Partial<Preferences> : {};
  return {
    name: normalizeProfileName(value.name),
    email: normalizeProfileEmail(value.email),
    notifications: typeof value.notifications === "boolean" ? value.notifications : defaults.notifications,
    darkMode: typeof value.darkMode === "boolean" ? value.darkMode : defaults.darkMode,
    accent: ACCENT_PALETTES.includes(value.accent as AccentPalette) ? value.accent as string : defaults.accent,
    timezone: typeof value.timezone === "string" && value.timezone.length > 0 ? value.timezone : defaults.timezone,
    sound: typeof value.sound === "boolean" ? value.sound : defaults.sound,
    vibration: typeof value.vibration === "boolean" ? value.vibration : defaults.vibration,
    notificationTime: typeof value.notificationTime === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value.notificationTime) ? value.notificationTime : defaults.notificationTime,
  };
}

type PreferencesContextValue = { preferences: Preferences; update: (patch: Partial<Preferences>) => void; hydrated: boolean };
const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(defaults);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => { if (raw) { try { setPreferences(normalizePreferences(JSON.parse(raw))); } catch { setPreferences(defaults); } } }).catch(() => undefined).finally(() => setHydrated(true));
  }, []);
  const update = (patch: Partial<Preferences>) => {
    const next = normalizePreferences({ ...preferences, ...patch });
    setPreferences(next);
    void AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => undefined);
  };
  return <PreferencesContext.Provider value={{ preferences, update, hydrated }}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error("usePreferences must be used inside PreferencesProvider");
  return context;
}
export { defaults as DEFAULT_PREFERENCES };
