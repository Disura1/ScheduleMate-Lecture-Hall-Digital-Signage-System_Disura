export const CARDS_PER_PAGE = 6;

export function paginate<T>(items: T[], page: number): T[] {
  return items.slice(page * CARDS_PER_PAGE, page * CARDS_PER_PAGE + CARDS_PER_PAGE);
}

export function pageCount(itemCount: number): number {
  return Math.max(1, Math.ceil(itemCount / CARDS_PER_PAGE));
}