export function currentEnvironment() {
  return process.env.NODE_ENV ?? "development";
}
