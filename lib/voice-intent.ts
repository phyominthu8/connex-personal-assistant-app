export type VoiceSearchFilter = "Today" | "Tomorrow" | "This Week" | "Overdue" | "Active" | "Completed" | "On Hold" | "Archived";

export type VoiceIntent =
  | { kind: "create-project"; title: string }
  | { kind: "create-task"; title: string }
  | { kind: "create-milestone"; title: string; projectName: string }
  | { kind: "search"; entity: "projects" | "milestones" | "tasks"; query: string; filter?: VoiceSearchFilter; projectName?: string }
  | { kind: "task"; text: string };

function cleanTitle(value: string) {
  return value.replace(/^[\s.,:;-]*/, "").replace(/[.!?]+$/, "").trim();
}

function extractNamedValue(value: string) {
  const normalized = value.replace(/^[\s.,:;-]*/, "").trim();
  return cleanTitle(normalized.replace(/^name\s*(?:is|=|:)?\s*/i, ""));
}

function normalizeSpaces(value: string) {
  return value.replace(/[,:;]+/g, " ").replace(/\s+/g, " ").trim();
}

function parseSearchFilter(value: string): VoiceSearchFilter | undefined {
  if (/\boverdue\b|\bpast due\b/i.test(value)) return "Overdue";
  if (/\b(?:today|due today)\b/i.test(value)) return "Today";
  if (/\b(?:tomorrow|due tomorrow)\b/i.test(value)) return "Tomorrow";
  if (/\b(?:this week|due this week)\b/i.test(value)) return "This Week";
  if (/\b(?:active|ongoing|in progress|open|unfinished)\b/i.test(value)) return "Active";
  if (/\b(?:completed|complete|done|finished)\b/i.test(value)) return "Completed";
  if (/\b(?:on hold|on_hold|paused|pause)\b/i.test(value)) return "On Hold";
  if (/\b(?:archived|archive)\b/i.test(value)) return "Archived";
  return undefined;
}

function removeSearchFilter(value: string) {
  return value
    .replace(/\boverdue\b|\bpast due\b/gi, " ")
    .replace(/\b(?:today|due today)\b/gi, " ")
    .replace(/\b(?:tomorrow|due tomorrow)\b/gi, " ")
    .replace(/\b(?:this week|due this week)\b/gi, " ")
    .replace(/\b(?:active|ongoing|in progress|open|unfinished)\b/gi, " ")
    .replace(/\b(?:completed|complete|done|finished)\b/gi, " ")
    .replace(/\b(?:on hold|on_hold|paused|pause)\b/gi, " ")
    .replace(/\b(?:archived|archive)\b/gi, " ");
}

function parseSearchCommand(value: string, entityMatch: RegExpMatchArray) {
  const entityWord = entityMatch[0];
  const entity: "projects" | "milestones" | "tasks" = entityWord.toLowerCase().startsWith("project") ? "projects" : entityWord.toLowerCase().startsWith("milestone") ? "milestones" : "tasks";
  let remainder = value.replace(entityWord, " ").replace(/\bto[- ]?dos?(?:\s+items?)?\b/gi, " ");
  let projectName: string | undefined;

  // Accept “in Project”, “in project Project”, “for the project Project”, and “under Project”.
  const projectMatch = remainder.match(/\b(?:in|for|under|from|within|related\s+to)\s+(?:the\s+)?(?:project\s+)?(.+?)(?=\s+(?:with|where|whose|due|started|status|that|and)\b|$)/i);
  if (projectMatch) {
    projectName = cleanTitle(normalizeSpaces(projectMatch[1]));
    remainder = remainder.replace(projectMatch[0], " ");
  }

  const filter = parseSearchFilter(remainder);
  const query = cleanTitle(normalizeSpaces(removeSearchFilter(remainder)
    .replace(/\b(?:my|me|all|the)\b/gi, " ")
    .replace(/\b(?:named|called|titled)\b/gi, " ")));
  return { kind: "search" as const, entity, query, filter, projectName: projectName || undefined };
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

  const searchMatch = text.match(/^(?:search|find|show|look\s+for|list)\s+([\s\S]*)$/i);
  const entityMatch = searchMatch?.[1].match(/\b(projects?|milestones?|tasks?|to[- ]?dos?)(?:\s+items?)?\b/i);
  if (searchMatch && entityMatch) {
    if (/to[- ]?dos?/i.test(entityMatch[0])) entityMatch[0] = "tasks";
    return parseSearchCommand(searchMatch[1], entityMatch);
  }

  return { kind: "task", text };
}
