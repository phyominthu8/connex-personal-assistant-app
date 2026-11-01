export type VoiceIntent =
  | { kind: "create-project"; title: string }
  | { kind: "create-task"; title: string }
  | { kind: "create-milestone"; title: string; projectName: string }
  | { kind: "search"; entity: "projects" | "milestones" | "tasks"; query: string; filter?: "Today" | "Tomorrow" | "This Week" | "Overdue" | "Active" | "Completed" | "On Hold" | "Archived"; projectName?: string }
  | { kind: "task"; text: string };

function cleanTitle(value: string) {
  return value.replace(/^[\s.,:;-]*/, "").replace(/[.!?]+$/, "").trim();
}

function extractNamedValue(value: string) {
  const normalized = value.replace(/^[\s.,:;-]*/, "").trim();
  return cleanTitle(normalized.replace(/^name\s*(?:is|=|:)?\s*/i, ""));
}

export function parseVoiceIntent(input: string): VoiceIntent {
  const text = input.trim();
  const projectMatch = text.match(/^(?:make|create|add)\s+(?:a\s+)?new\s+project\b([\s\S]*)$/i);
  if (projectMatch) return { kind: "create-project", title: extractNamedValue(projectMatch[1]) };

  const milestoneMatch = text.match(/^(?:make|create|add)\s+(?:a\s+)?new\s+milestone\b([\s\S]*)$/i);
  if (milestoneMatch) {
    const remainder = milestoneMatch[1].replace(/^[\s.,:;-]*/, "");
    const projectSplit = remainder.match(/^(?:in|for|under)\s+(.+?)\s*(?:[,:;-]|\s+name\s*(?:is|=)?\s+)/i);
    if (projectSplit) {
      const projectName = cleanTitle(projectSplit[1]);
      const title = extractNamedValue(remainder.slice(projectSplit[0].length));
      return { kind: "create-milestone", title, projectName };
    }
    return { kind: "create-milestone", title: extractNamedValue(remainder), projectName: "" };
  }

  const taskMatch = text.match(/^(?:make|create|add)\s+(?:a\s+)?new\s+task\b([\s\S]*)$/i);
  if (taskMatch) return { kind: "create-task", title: extractNamedValue(taskMatch[1]) };

  const searchMatch = text.match(/^(?:search|find|show|look\s+for)\s+([\s\S]*)$/i);
  const entityMatch = searchMatch?.[1].match(/\b(projects?|milestones?|tasks?)\b/i);
  if (searchMatch && entityMatch) {
    const entity = entityMatch[1].toLowerCase().startsWith("project") ? "projects" : entityMatch[1].toLowerCase().startsWith("milestone") ? "milestones" : "tasks";
    const remainder = searchMatch[1].replace(entityMatch[0], "").trim();
    const filter = /\boverdue\b/i.test(remainder) ? "Overdue" : /\b(?:today|due today)\b/i.test(remainder) ? "Today" : /\b(?:tomorrow|due tomorrow)\b/i.test(remainder) ? "Tomorrow" : /\b(?:this week|due this week)\b/i.test(remainder) ? "This Week" : /\b(?:active|ongoing|in progress)\b/i.test(remainder) ? "Active" : /\bcompleted?\b/i.test(remainder) ? "Completed" : /\b(?:on hold|on_hold|paused)\b/i.test(remainder) ? "On Hold" : /\barchived?\b/i.test(remainder) ? "Archived" : undefined;
    const projectMatch = remainder.match(/\b(?:in|for|under)\s+(?:the\s+)?project\s+([^,]+?)(?:\s+(?:with|due|started|status)\b|$)/i);
    const projectName = projectMatch ? cleanTitle(projectMatch[1]) : undefined;
    const query = projectName || cleanTitle(remainder.replace(/\boverdue\b|\btoday\b|\btomorrow\b|\bthis week\b|\bactive\b|\bongoing\b|\bin progress\b|\bcompleted?\b|\bon hold\b|\bon_hold\b|\bpaused\b|\barchived?\b|\bdue\b|\bstarted\b|\bstatus\b/gi, ""));
    return { kind: "search", entity, query, filter, projectName };
  }

  return { kind: "task", text };
}
