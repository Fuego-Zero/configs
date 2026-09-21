import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ESLint } from "eslint";

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.dirname(testsDir);
const tmpDir = path.join(testsDir, ".tmp", "benchmark");

const nodeLint = new ESLint({
  cwd: rootDir,
  overrideConfigFile: path.join(testsDir, "eslint.node.config.js"),
});

const reactLint = new ESLint({
  cwd: rootDir,
  overrideConfigFile: path.join(testsDir, "eslint.react.config.js"),
});

await mkdir(tmpDir, { recursive: true });

const largeFile = path.join(tmpDir, "LargePage.tsx");
const lines = [
  'import { useMemo } from "react";',
  "",
  "interface Item {",
  "  id: number;",
  "  label: string;",
  "}",
  "",
];

for (let index = 0; index < 80; index += 1) {
  lines.push(
    `export function Item${index}({ item }: { item: Item }) {`,
    "  const label = useMemo(() => `${item.id}-${item.label}`, [item.id, item.label]);",
    "",
    "  return (",
    "    <article data-id={item.id}>",
    "      <h2>{label}</h2>",
    '      <button type="button" aria-label={label} onClick={() => undefined}>',
    "        {label}",
    "      </button>",
    "    </article>",
    "  );",
    "}",
    ""
  );
}

await writeFile(largeFile, `${lines.join("\n")}\n`);

async function measure(label, run, repeats) {
  const runs = [];

  for (let index = 0; index < repeats; index += 1) {
    const start = performance.now();
    await run();
    runs.push(performance.now() - start);
  }

  const [cold, ...warm] = runs;
  const warmAverage = warm.reduce((sum, value) => sum + value, 0) / warm.length;

  console.log(label);
  console.log(`  cold: ${cold.toFixed(1)} ms`);
  console.log(`  warm avg (${warm.length}): ${warmAverage.toFixed(1)} ms`);
  console.log(`  warm all: ${warm.map(value => value.toFixed(1)).join(", ")} ms`);

  return { cold, warm, warmAverage };
}

function runEslintTiming(filePath, configFile) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [path.join(rootDir, "node_modules/eslint/bin/eslint.js"), "--no-cache", filePath],
      {
        cwd: rootDir,
        env: {
          ...process.env,
          TIMING: "1",
          ESLINT_USE_FLAT_CONFIG: "true",
        },
      }
    );

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", chunk => {
      stdout += chunk;
    });
    child.stderr.on("data", chunk => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", () => {
      resolve({ stdout, stderr, combined: `${stdout}\n${stderr}` });
    });
  }).then(result => {
    // ESLint TIMING output is printed to stdout after linting.
    return result;
  });
}

console.log("Lint benchmark (machine-dependent; full official config, no rules disabled)");

const singleTs = path.join(testsDir, "fixtures/valid/ts/user-service.ts");
const singleTsx = path.join(testsDir, "fixtures/valid/react/UserPage.tsx");

await measure("1. single .ts", () => nodeLint.lintFiles([singleTs]), 11);
await measure("2. single .tsx", () => reactLint.lintFiles([singleTsx]), 11);
await measure("3. ~1000-line .tsx", () => reactLint.lintFiles([largeFile]), 11);
await measure(
  "4-5. valid JS/TS/Node",
  () => nodeLint.lintFiles(["tests/fixtures/valid/**/*.{js,mjs,cjs,ts,mts,cts}"]),
  11
);
await measure("4-5. valid JSX/TSX", () => reactLint.lintFiles(["tests/fixtures/valid/**/*.{jsx,tsx}"]), 11);

process.env.ESLINT_FLAG = "timing";
const timing = await new Promise((resolve, reject) => {
  const child = spawn(
    process.execPath,
    [
      path.join(rootDir, "node_modules/eslint/bin/eslint.js"),
      "--no-cache",
      "-c",
      path.join(testsDir, "eslint.react.config.js"),
      singleTsx,
    ],
    {
      cwd: rootDir,
      env: {
        ...process.env,
        TIMING: "all",
      },
    }
  );

  let output = "";
  child.stdout.on("data", chunk => {
    output += chunk;
  });
  child.stderr.on("data", chunk => {
    output += chunk;
  });
  child.on("error", reject);
  child.on("close", () => resolve(output));
});

console.log("\nTIMING=all for a single TSX file:\n");
console.log(timing.trim());
