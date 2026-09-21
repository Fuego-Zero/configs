export function isApiPath(value) {
  return value.startsWith("/api/");
}

export function isJsonFile(value) {
  return value.endsWith(".json");
}
