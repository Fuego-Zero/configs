export function loadCount(): Promise<number> {
  return Promise.resolve(1);
}

export async function printCount() {
  const count = await loadCount();

  return String(count);
}
