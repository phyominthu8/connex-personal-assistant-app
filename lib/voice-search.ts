export type VoiceSearchResult = {
  id: string;
  title: string;
  dueDate?: string;
};

export function sortSearchResultsByDueDate<T extends VoiceSearchResult>(results: T[], ascending = true): T[] {
  return [...results].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    const comparison = a.dueDate.localeCompare(b.dueDate);
    return ascending ? comparison : -comparison;
  });
}
