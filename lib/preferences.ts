import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const KEY = "personal-assistant.preferences.v1";
export type Preferences = { notifications: boolean; darkMode: boolean; accent: string; timezone: string };
const defaults: Preferences = { notifications: true, darkMode: false, accent: "#4F46E5", timezone: "UTC" };
export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(defaults);
  useEffect(() => { AsyncStorage.getItem(KEY).then((raw) => { if (!raw) return; try { setPreferences({ ...defaults, ...JSON.parse(raw) }); } catch { /* reset to defaults */ } }).catch(() => undefined); }, []);
  const update = (patch: Partial<Preferences>) => { const next = { ...preferences, ...patch }; setPreferences(next); void AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => undefined); };
  return { preferences, update };
}
