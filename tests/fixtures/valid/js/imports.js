import path from "node:path";

import { readConfig } from "../support/config.js";

export function configName(filePath) {
  return `${readConfig(filePath).name}:${path.basename(filePath)}`;
}
