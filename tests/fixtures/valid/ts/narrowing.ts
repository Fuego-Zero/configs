export function formatValue(value: number | string) {
  if (typeof value === "number") {
    return value.toFixed(2);
  }

  return value.trim();
}
