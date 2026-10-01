import { describe, expect, it } from "vitest";
import { formatGreeting, getTimeGreeting } from "../lib/greeting";

describe("greetings", () => {
  it("selects morning, afternoon, and evening by local hour", () => {
    expect(getTimeGreeting(new Date(2026, 8, 1, 8))).toBe("Good morning");
    expect(getTimeGreeting(new Date(2026, 8, 1, 14))).toBe("Good afternoon");
    expect(getTimeGreeting(new Date(2026, 8, 1, 19))).toBe("Good evening");
  });

  it("adds a normalized display name when one is saved", () => {
    expect(formatGreeting("  Phyo  ", new Date(2026, 8, 1, 9))).toBe("Good morning Phyo");
    expect(formatGreeting("", new Date(2026, 8, 1, 9))).toBe("Good morning");
  });
});
