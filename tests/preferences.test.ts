import { describe, expect, it } from "vitest";
import { ACCENT_PALETTES, DEFAULT_PREFERENCES, normalizePreferences } from "../lib/preferences";

describe("preferences", () => {
  it("provides stable defaults for appearance and device behavior", () => {
    expect(DEFAULT_PREFERENCES).toEqual({ notifications: true, darkMode: false, accent: "#4F46E5", timezone: "UTC", sound: true, vibration: true });
  });

  it("normalizes invalid persisted values safely", () => {
    expect(normalizePreferences({ darkMode: "yes", accent: "#invalid", timezone: "", sound: 1 })).toEqual(DEFAULT_PREFERENCES);
  });

  it("accepts every supported accent palette", () => {
    for (const accent of ACCENT_PALETTES) expect(normalizePreferences({ accent }).accent).toBe(accent);
  });
});
