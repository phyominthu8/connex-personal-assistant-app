export function projectDeadlineDate(endDate?: string): Date | null {
  if (!endDate) return null;
  const date = new Date(`${endDate}T09:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}
