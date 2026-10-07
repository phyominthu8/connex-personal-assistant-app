import { describe, expect, it } from "vitest";
import { dateAtNotificationTime, DEFAULT_NOTIFICATION_TIME, normalizeNotificationTime } from "../lib/reminder-time";

describe("reminder time", () => {
  it("defaults due-date alarms to 9:00 AM", () => {
    expect(DEFAULT_NOTIFICATION_TIME).toBe("09:00");
    expect(dateAtNotificationTime("2026-10-07")?.toISOString()).toBe("2026-10-07T09:00:00.000Z");
  });
  it("supports manual valid times and falls back for invalid values", () => {
    expect(normalizeNotificationTime("18:45")).toBe("18:45");
    expect(dateAtNotificationTime("2026-10-07", "18:45")?.toISOString()).toBe("2026-10-07T18:45:00.000Z");
    expect(normalizeNotificationTime("25:00")).toBe("09:00");
  });
});
