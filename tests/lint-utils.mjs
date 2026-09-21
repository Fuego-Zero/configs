import path from "node:path";
import { fileURLToPath } from "node:url";

import { ESLint } from "eslint";

const testsDir = path.dirname(fileURLToPath(import.meta.url));
export const rootDir = path.dirname(testsDir);

export const nodeConfigFile = path.join(testsDir, "eslint.node.config.js");
export const reactConfigFile = path.join(testsDir, "eslint.react.config.js");

export function createNodeLint(overrides = {}) {
  return new ESLint({
    cwd: rootDir,
    overrideConfigFile: nodeConfigFile,
    ...overrides,
  });
}

export function createReactLint(overrides = {}) {
  return new ESLint({
    cwd: rootDir,
    overrideConfigFile: reactConfigFile,
    ...overrides,
  });
}

export function relative(filePath) {
  return path.relative(rootDir, filePath).replaceAll("\\", "/");
}

export function isReactFile(filePath) {
  return /\.(?:jsx|tsx)$/.test(filePath);
}

export function lintFor(filePath, nodeLint, reactLint) {
  return isReactFile(filePath) ? reactLint : nodeLint;
}

export function formatMessages(result) {
  return result.messages.map(message => `  ${message.ruleId}: ${message.message}`).join("\n");
}
