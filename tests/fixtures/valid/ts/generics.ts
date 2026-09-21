export function first<T>(items: readonly T[]): T | undefined {
  return items[0];
}

export function mapById<T extends { id: string }>(items: readonly T[]) {
  return new Map(items.map(item => [item.id, item]));
}
