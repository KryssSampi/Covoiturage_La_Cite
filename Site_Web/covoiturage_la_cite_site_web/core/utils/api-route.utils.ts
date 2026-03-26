export function generatePrefixedId(prefix: string, date = new Date()): string {
  const year = date.getFullYear();
  const rand = String(Math.floor(10000 + Math.random() * 90000)).padStart(5, '0');
  return `${prefix}-${year}-${rand}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function sortByDateDesc<T>(
  items: T[],
  readDate: (item: T) => string | undefined | null,
): T[] {
  return [...items].sort((left, right) => {
    const leftTime = new Date(readDate(left) ?? '').getTime();
    const rightTime = new Date(readDate(right) ?? '').getTime();
    return rightTime - leftTime;
  });
}
