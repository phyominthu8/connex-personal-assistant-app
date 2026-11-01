import { describe, expect, it } from "vitest";
import { parseVoiceIntent } from "../lib/voice-intent";

describe("voice intent parsing", () => {
  it("recognizes project creation commands and extracts the project name", () => {
    expect(parseVoiceIntent("Make new project. Name is Project02.")).toEqual({ kind: "project", title: "Project02" });
    expect(parseVoiceIntent("Create a new project: Website refresh")).toEqual({ kind: "project", title: "Website refresh" });
  });

  it("keeps ordinary commands on the task path", () => {
    expect(parseVoiceIntent("Add dentist appointment tomorrow")).toEqual({ kind: "task", text: "Add dentist appointment tomorrow" });
  });
});
