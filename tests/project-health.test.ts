import { describe, expect, it } from "vitest";
import { getProjectHealth } from "../lib/project-health";

describe("project health", () => {
  const today = new Date("2026-09-02T00:00:00Z");
  it("marks completed and on-hold projects explicitly", () => {
    expect(getProjectHealth("completed", 1, undefined, today)).toBe("complete");
    expect(getProjectHealth("on_hold", 0.3, "2026-09-30", today)).toBe("on-hold");
  });
  it("marks projects at risk near an incomplete deadline", () => {
    expect(getProjectHealth("active", 0.2, "2026-09-06", today)).toBe("at-risk");
    expect(getProjectHealth("active", 0.9, "2026-09-06", today)).toBe("on-track");
  });
  it("handles missing and expired deadlines", () => {
    expect(getProjectHealth("active", 0, undefined, today)).toBe("no-date");
    expect(getProjectHealth("active", 0.4, "2026-08-31", today)).toBe("at-risk");
  });
});
