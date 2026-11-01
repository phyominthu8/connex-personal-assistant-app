import { describe, expect, it } from "vitest";
import { CONNEX_COLOR_VALUES, DEFAULT_MILESTONE_COLOR, DEFAULT_PROJECT_COLOR, DEFAULT_TASK_COLOR, inheritedEntityColor } from "../lib/entity-colors";

describe("entity colors", () => {
  it("provides a stable palette for all editable entities", () => {
    expect(CONNEX_COLOR_VALUES).toHaveLength(9);
    expect(new Set(CONNEX_COLOR_VALUES).size).toBe(CONNEX_COLOR_VALUES.length);
    expect(CONNEX_COLOR_VALUES).toContain(DEFAULT_TASK_COLOR);
    expect(CONNEX_COLOR_VALUES).toContain(DEFAULT_PROJECT_COLOR);
    expect(CONNEX_COLOR_VALUES).toContain(DEFAULT_MILESTONE_COLOR);
  });

  it("inherits the project color while preserving a fallback for personal items", () => {
    expect(inheritedEntityColor("#E11D48", DEFAULT_TASK_COLOR)).toBe("#E11D48");
    expect(inheritedEntityColor(undefined, DEFAULT_TASK_COLOR)).toBe(DEFAULT_TASK_COLOR);
  });
});
