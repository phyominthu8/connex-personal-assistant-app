export type VoiceIntent =
  | { kind: "project"; title: string }
  | { kind: "task"; text: string };

export function parseVoiceIntent(input: string): VoiceIntent {
  const text = input.trim();
  const projectMatch = text.match(/^(?:make|create|add)\s+(?:a\s+)?new\s+project\b([\s\S]*)$/i);
  if (projectMatch) {
    const title = projectMatch[1]
      .replace(/^[\s.,:;-]*/, "")
      .replace(/^name\s*(?:is|=|:)?\s*/i, "")
      .replace(/[.!?]+$/, "")
      .trim();
    return { kind: "project", title };
  }
  return { kind: "task", text };
}
