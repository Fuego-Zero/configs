import fs from "node:fs";
import path from "node:path";

import { readConfig } from "../support/config.js";
import { buildUser } from "./objects.js";

export function describeConfig(filePath) {
  const config = readConfig(filePath);

  return `${config.name}:${path.basename(filePath)}:${fs.existsSync(filePath) ? "yes" : "no"}:${buildUser(1, "Ada").name}`;
}
