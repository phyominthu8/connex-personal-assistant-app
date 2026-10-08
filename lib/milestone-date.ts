export function normalizeMilestoneReminder(value: string): { iso?: string; error?: string } {
  const text = value.trim();
  if (!text) return {};
  const timestamp = Date.parse(text);
  if (Number.isNaN(timestamp)) {
    return { error: "Use a valid date and time, for example 2026-10-20T09:00:00." };
  }
  return { iso: new Date(timestamp).toISOString() };
}
