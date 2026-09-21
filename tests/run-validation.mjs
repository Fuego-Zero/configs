import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createNodeLint, createReactLint, formatMessages, lintFor, relative } from "./lint-utils.mjs";

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(testsDir, "fixtures");

const nodeLint = createNodeLint();
const reactLint = createReactLint();

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFiles(entryPath)));
      continue;
    }

    if (/\.(?:c|m)?(?:j|t)sx?$/.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

async function assertClean(filePath) {
  const eslint = lintFor(filePath, nodeLint, reactLint);
  const [result] = await eslint.lintFiles([filePath]);

  assert.equal(result.errorCount, 0, `${relative(filePath)} should pass, but got:\n${formatMessages(result)}`);
}

async function assertRules(filePath, expectedRules) {
  const eslint = lintFor(filePath, nodeLint, reactLint);
  const [result] = await eslint.lintFiles([filePath]);
  const rules = new Set(result.messages.map(message => message.ruleId));

  for (const expectedRule of expectedRules) {
    assert.ok(
      rules.has(expectedRule),
      `${relative(filePath)} should report ${expectedRule}; actual rules: ${[...rules].join(", ") || "(none)"}`
    );
  }
}

const validFiles = await listFiles(path.join(fixturesDir, "valid"));

for (const filePath of validFiles) {
  await assertClean(filePath);
}

const invalidCases = [
  [
    "invalid/js/language.js",
    [
      "curly",
      "eqeqeq",
      "no-debugger",
      "no-empty",
      "no-plusplus",
      "no-unused-vars",
      "no-var",
      "object-shorthand",
      "prefer-const",
      "prefer-object-has-own",
      "prefer-object-spread",
      "prefer-template",
      "use-isnan",
    ],
  ],
  [
    "invalid/js/unicorn.js",
    [
      "unicorn/prefer-array-find",
      "unicorn/prefer-includes",
      "unicorn/prefer-node-protocol",
      "unicorn/prefer-string-starts-ends-with",
    ],
  ],
  [
    "invalid/js/best-practices.js",
    [
      "prefer-destructuring",
      "no-else-return",
      "no-nested-ternary",
      "radix",
      "no-alert",
      "default-case",
      "no-await-in-loop",
      "no-new-wrappers",
      "no-eval",
    ],
  ],
  [
    "invalid/import/import-rules.ts",
    [
      "import-x/first",
      "import-x/no-duplicates",
      "import-x/newline-after-import",
      "perfectionist/sort-imports",
      "perfectionist/sort-named-imports",
      "perfectionist/sort-named-exports",
      "@typescript-eslint/consistent-type-imports",
    ],
  ],
  [
    "invalid/import/import-correctness.ts",
    ["import-x/no-self-import", "import-x/no-useless-path-segments", "import-x/no-named-as-default"],
  ],
  ["invalid/cycle/a.ts", ["import-x/no-cycle"]],
  [
    "invalid/ts/typed-unsafe.ts",
    [
      "@typescript-eslint/no-explicit-any",
      "@typescript-eslint/no-unsafe-assignment",
      "@typescript-eslint/no-unsafe-member-access",
      "@typescript-eslint/no-unsafe-argument",
      "@typescript-eslint/no-unsafe-call",
      "@typescript-eslint/no-unsafe-return",
      "@typescript-eslint/no-unnecessary-type-assertion",
    ],
  ],
  [
    "invalid/ts/typed-promises.ts",
    [
      "@typescript-eslint/no-floating-promises",
      "@typescript-eslint/await-thenable",
      "@typescript-eslint/require-await",
      "@typescript-eslint/prefer-promise-reject-errors",
    ],
  ],
  [
    "invalid/ts/typescript-style.ts",
    [
      "perfectionist/sort-interfaces",
      "@typescript-eslint/array-type",
      "@typescript-eslint/no-inferrable-types",
      "@typescript-eslint/no-unused-vars",
      "@typescript-eslint/prefer-optional-chain",
      "@typescript-eslint/prefer-nullish-coalescing",
      "@typescript-eslint/no-wrapper-object-types",
    ],
  ],
  [
    "invalid/react/hooks.tsx",
    ["react-hooks/rules-of-hooks", "react-hooks/set-state-in-effect", "react-hooks/set-state-in-render"],
  ],
  [
    "invalid/react/jsx.tsx",
    [
      "perfectionist/sort-jsx-props",
      "@stylistic/jsx-self-closing-comp",
      "@typescript-eslint/no-misused-promises",
      "react-x/no-missing-key",
      "react-x/no-nested-component-definitions",
      "react-hooks/static-components",
    ],
  ],
];

for (const [relativePath, expectedRules] of invalidCases) {
  await assertRules(path.join(fixturesDir, relativePath), expectedRules);
}

console.log(
  `✓ validation fixtures passed: ${validFiles.length} clean files + ${invalidCases.length} grouped invalid files`
);
