import { describe, expect, it } from "vitest";
import { getProjectDateError } from "../lib/project-date";

describe("project dates", () => {
  it("accepts optional dates and a valid ordered range", () => {
    expect(getProjectDateError()).toBeNull();
    expect(getProjectDateError("2026-10-01", "2026-10-31")).toBeNull();
    expect(getProjectDateError("2026-10-31", "2026-10-31")).toBeNull();
  });

  it("rejects malformed dates and reversed ranges", () => {
    expect(getProjectDateError("2026-02-30", "2026-03-01")).toContain("start date");
    expect(getProjectDateError("2026-10-31", "2026-10-01")).toContain("on or after");
  });
});
