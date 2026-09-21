import fs from "node:fs/promises";
import path from "node:path";

export async function readJson(filePath) {
  const content = await fs.readFile(filePath, "utf8");

  return JSON.parse(content);
}

export function fileName(filePath) {
  return path.basename(filePath);
}
