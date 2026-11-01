import { describe, expect, it } from "vitest";
import { parseVoiceIntent } from "../lib/voice-intent";

describe("voice intent parsing", () => {
  it("recognizes project creation commands and extracts the project name", () => {
    expect(parseVoiceIntent("Make new project. Name is Project02.")).toEqual({ kind: "create-project", title: "Project02" });
    expect(parseVoiceIntent("Create a new project: Website refresh")).toEqual({ kind: "create-project", title: "Website refresh" });
  });

  it("recognizes milestone creation and filtered searches", () => {
    expect(parseVoiceIntent("Create a new milestone in Project02: Launch website")).toEqual({ kind: "create-milestone", title: "Launch website", projectName: "Project02" });
    expect(parseVoiceIntent("Find overdue tasks in project Project02")).toMatchObject({ kind: "search", entity: "tasks", filter: "Overdue", projectName: "Project02" });
    expect(parseVoiceIntent("Find overdue milestones")).toMatchObject({ kind: "search", entity: "milestones", filter: "Overdue" });
    expect(parseVoiceIntent("Find overdue projects")).toMatchObject({ kind: "search", entity: "projects", filter: "Overdue" });
    expect(parseVoiceIntent("Find ongoing tasks")).toMatchObject({ kind: "search", entity: "tasks", filter: "Active" });
    expect(parseVoiceIntent("Show active projects")).toMatchObject({ kind: "search", entity: "projects", filter: "Active" });
    expect(parseVoiceIntent("Find completed milestones")).toMatchObject({ kind: "search", entity: "milestones", filter: "Completed" });
  });

  it("keeps ordinary commands on the task path", () => {
    expect(parseVoiceIntent("Add dentist appointment tomorrow")).toEqual({ kind: "task", text: "Add dentist appointment tomorrow" });
  });
});
