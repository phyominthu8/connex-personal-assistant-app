import { describe, expect, it } from "vitest";
import { sortSearchResultsByDueDate } from "../lib/voice-search";

describe("voice search due-date sorting", () => {
  const results = [
    { id: "late", title: "Late", dueDate: "2026-11-20" },
    { id: "none", title: "No date" },
    { id: "soon", title: "Soon", dueDate: "2026-11-03" },
  ];

  it("puts dated results soonest first and undated results last", () => {
    expect(sortSearchResultsByDueDate(results).map((result) => result.id)).toEqual(["soon", "late", "none"]);
  });

  it("supports latest first while keeping undated results last", () => {
    expect(sortSearchResultsByDueDate(results, false).map((result) => result.id)).toEqual(["late", "soon", "none"]);
  });
});
