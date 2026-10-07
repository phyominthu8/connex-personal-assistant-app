import { describe, expect, it } from "vitest";
import { ACCENT_PALETTES, DEFAULT_PREFERENCES, isValidProfileEmail, isValidProfileName, normalizePreferences } from "../lib/preferences";

describe("preferences", () => {
  it("provides stable defaults for appearance and device behavior", () => {
    expect(DEFAULT_PREFERENCES).toEqual({ notifications: true, darkMode: false, accent: "#4F46E5", timezone: "UTC", sound: true, vibration: true, notificationTime: "09:00", name: "", email: "" });
  });

  it("normalizes invalid persisted values safely", () => {
    expect(normalizePreferences({ darkMode: "yes", accent: "#invalid", timezone: "", sound: 1 })).toEqual(DEFAULT_PREFERENCES);
  });

  it("accepts every supported accent palette", () => {
    for (const accent of ACCENT_PALETTES) expect(normalizePreferences({ accent }).accent).toBe(accent);
  });

  it("normalizes and validates profile fields", () => {
    expect(normalizePreferences({ name: "  Alex Morgan  ", email: " ALEX@EXAMPLE.COM " })).toMatchObject({ name: "Alex Morgan", email: "alex@example.com" });
    expect(isValidProfileName("A".repeat(80))).toBe(true);
    expect(isValidProfileName("A".repeat(81))).toBe(false);
    expect(isValidProfileEmail("")).toBe(true);
    expect(isValidProfileEmail("alex@example.com")).toBe(true);
    expect(isValidProfileEmail("not-an-email")).toBe(false);
  });
});
