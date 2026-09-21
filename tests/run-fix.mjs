import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as prettier from "prettier";

import prettierConfig from "../src/prettier.js";
import { createNodeLint, createReactLint, relative } from "./lint-utils.mjs";

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(testsDir, "fixtures");

const nodeFixLint = createNodeLint({ fix: true });
const reactFixLint = createReactLint({ fix: true });
const nodeSecondPass = createNodeLint({ fix: true });
const reactSecondPass = createReactLint({ fix: true });

function normalize(text) {
  return text.replaceAll("\r\n", "\n");
}

function lintForFix(filePath) {
  return /\.(?:jsx|tsx)$/.test(filePath) ? reactFixLint : nodeFixLint;
}

function lintForSecondPass(filePath) {
  return /\.(?:jsx|tsx)$/.test(filePath) ? reactSecondPass : nodeSecondPass;
}

async function lintFix(filePath, source) {
  const [result] = await lintForFix(filePath).lintText(source, { filePath });
  return result.output ?? source;
}

async function format(filePath, source) {
  return prettier.format(source, {
    ...prettierConfig,
    filepath: filePath,
  });
}

async function assertFix(inputPath, expectedPath) {
  const input = normalize(await readFile(inputPath, "utf8"));
  const expected = normalize(await readFile(expectedPath, "utf8"));
  const lintFixed = await lintFix(inputPath, input);
  const formatted = await format(inputPath, lintFixed);

  assert.equal(formatted, expected, `${relative(inputPath)} did not fix to the expected output.`);

  const secondLint = await lintFix(inputPath, formatted);
  const secondFormatted = await format(inputPath, secondLint);

  assert.equal(secondFormatted, formatted, `${relative(inputPath)} changed after a second fix pass.`);
}

async function assertPrettier(inputPath, expectedPath) {
  const input = await readFile(inputPath, "utf8");
  const expected = await readFile(expectedPath, "utf8");
  const actual = await format(inputPath, input);

  assert.equal(actual, expected, `${relative(inputPath)} did not format to the expected output.`);
}

await assertFix(path.join(fixturesDir, "fix/imports-input.ts"), path.join(fixturesDir, "fix/imports-expected.ts"));
await assertFix(path.join(fixturesDir, "fix/jsx-input.tsx"), path.join(fixturesDir, "fix/jsx-expected.tsx"));
await assertFix(path.join(fixturesDir, "fix/spread-input.tsx"), path.join(fixturesDir, "fix/spread-expected.tsx"));
await assertFix(
  path.join(fixturesDir, "fix/side-effects-input.js"),
  path.join(fixturesDir, "fix/side-effects-expected.js")
);

await assertPrettier(
  path.join(fixturesDir, "format/prettier-input.ts"),
  path.join(fixturesDir, "format/prettier-expected.ts")
);

const sideEffectPath = path.join(fixturesDir, "valid/js/side-effects.js");
const sideEffectBefore = normalize(await readFile(sideEffectPath, "utf8"));
const sideEffectFixed = await lintFix(sideEffectPath, sideEffectBefore);
const sideEffectFormatted = await format(sideEffectPath, sideEffectFixed);
assert.equal(sideEffectFormatted, sideEffectBefore, "side-effect imports were reordered or rewritten.");

const spreadPath = path.join(fixturesDir, "valid/react/SpreadOverride.tsx");
const spreadBefore = normalize(await readFile(spreadPath, "utf8"));
const spreadFixed = await lintFix(spreadPath, spreadBefore);
const spreadFormatted = await format(spreadPath, spreadFixed);
assert.equal(spreadFormatted, spreadBefore, "spread props were reordered unsafely.");

const tempDir = await mkdtemp(path.join(os.tmpdir(), "fuego-fix-"));
const original = await readFile(path.join(fixturesDir, "fix/jsx-input.tsx"), "utf8");
const firstPassFiles = await reactFixLint.lintText(original, {
  filePath: path.join(fixturesDir, "fix/jsx-input.tsx"),
});
const firstOutput = firstPassFiles[0]?.output ?? original;
const secondPassFiles = await reactSecondPass.lintText(firstOutput, {
  filePath: path.join(fixturesDir, "fix/jsx-input.tsx"),
});

assert.equal(
  secondPassFiles[0]?.output,
  undefined,
  "Second ESLint --fix pass still produced a diff; possible circular fixes."
);

await writeFile(path.join(tempDir, "idempotent.tsx"), firstOutput, "utf8");

console.log("✓ autofix + prettier + idempotence tests passed");
