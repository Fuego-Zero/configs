import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const testsDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.dirname(testsDir);
const pkg = JSON.parse(await readFile(path.join(rootDir, "package.json"), "utf8"));
const tarballName = `${pkg.name.replace("@", "").replace("/", "-")}-${pkg.version}.tgz`;
const tarballPath = path.join(rootDir, tarballName);
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

async function run(command, args, cwd, { allowFailure = false } = {}) {
  try {
    return await execFileAsync(command, args, {
      cwd,
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
      shell: true,
      windowsHide: true,
    });
  } catch (error) {
    if (allowFailure && typeof error.stdout === "string") {
      return error;
    }

    throw error;
  }
}

function listPackedFiles(packJson) {
  const payload = JSON.parse(packJson);
  const entries = Array.isArray(payload) ? payload : [payload];
  return (entries[0]?.files ?? []).map(file => String(file.path ?? file).replaceAll("\\", "/"));
}

const dryRun = await run(npmCommand, ["pack", "--dry-run", "--json"], rootDir);
const fileList = listPackedFiles(dryRun.stdout);

assert.ok(
  fileList.some(file => file.startsWith("src/")),
  "npm pack --dry-run should include src/"
);
assert.equal(
  fileList.some(file => file.startsWith("tests/")),
  false,
  "npm pack --dry-run must not include tests/"
);
assert.equal(
  fileList.some(file => file.includes("fixtures/")),
  false,
  "npm pack --dry-run must not include fixtures/"
);
assert.ok(fileList.includes("src/eslint/react.js"), "exports target src/eslint/react.js must exist in the tarball");
assert.ok(fileList.includes("src/eslint/node.js"), "exports target src/eslint/node.js must exist in the tarball");
assert.ok(fileList.includes("src/prettier.js"), "exports target src/prettier.js must exist in the tarball");
assert.ok(fileList.includes("LICENSE"), "npm pack must include LICENSE");
assert.ok(fileList.includes("README.md"), "npm pack must include README.md");

await run(npmCommand, ["pack"], rootDir);

const consumerRoot = path.join(rootDir, "tmp-consumer");
await rm(consumerRoot, { force: true, recursive: true });

async function writeConsumerProject(name, files) {
  const projectDir = path.join(consumerRoot, name);
  await mkdir(path.join(projectDir, "src"), { recursive: true });

  for (const [relativePath, contents] of Object.entries(files)) {
    const filePath = path.join(projectDir, relativePath);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, contents);
  }

  return projectDir;
}

const sharedDevDeps = {
  "@fuego0/configs": `file:${tarballPath.replaceAll("\\", "/")}`,
  eslint: "^10.11.0",
  prettier: "^3.9.0",
  typescript: "~5.9.3",
};

const reactDir = await writeConsumerProject("react", {
  "package.json": `${JSON.stringify(
    {
      name: "tmp-consumer-react",
      private: true,
      type: "module",
      devDependencies: {
        ...sharedDevDeps,
        "@types/react": "^19.0.0",
        react: "^19.0.0",
      },
    },
    null,
    2
  )}\n`,
  "eslint.config.js": `export { default } from "@fuego0/configs/eslint/react";\n`,
  "prettier.config.js": `export { default } from "@fuego0/configs/prettier";\n`,
  "tsconfig.json": `${JSON.stringify(
    {
      compilerOptions: {
        jsx: "react-jsx",
        module: "NodeNext",
        moduleResolution: "NodeNext",
        noEmit: true,
        strict: true,
        target: "ES2022",
      },
      include: ["src/**/*.ts", "src/**/*.tsx"],
    },
    null,
    2
  )}\n`,
  "src/App.tsx": `import { useMemo } from "react";

export function App() {
  const label = useMemo(() => "ok", []);

  return (
    <button type="button" aria-label={label} onClick={() => undefined}>
      {label}
    </button>
  );
}
`,
  "src/bad-typed.ts": `export function leak(): void {
  Promise.resolve();
}
`,
});

const nodeDir = await writeConsumerProject("node", {
  "package.json": `${JSON.stringify(
    {
      name: "tmp-consumer-node",
      private: true,
      type: "module",
      devDependencies: sharedDevDeps,
    },
    null,
    2
  )}\n`,
  "eslint.config.js": `export { default } from "@fuego0/configs/eslint/node";\n`,
  "tsconfig.json": `${JSON.stringify(
    {
      compilerOptions: {
        module: "NodeNext",
        moduleResolution: "NodeNext",
        noEmit: true,
        strict: true,
        target: "ES2022",
      },
      include: ["src/**/*.ts"],
    },
    null,
    2
  )}\n`,
  "src/server.ts": `import path from "node:path";

export function extension(filePath: string): string {
  return path.extname(filePath);
}
`,
  "src/bad-typed.ts": `export function leak(): void {
  Promise.resolve();
}
`,
});

await run(npmCommand, ["install"], reactDir);
await run(npmCommand, ["install"], nodeDir);

const reactGood = await run(npmCommand, ["exec", "--yes", "--", "eslint", "src/App.tsx"], reactDir);
const nodeGood = await run(npmCommand, ["exec", "--yes", "--", "eslint", "src/server.ts"], nodeDir);

assert.doesNotMatch(reactGood.stderr, /\berror\b/i, reactGood.stderr);
assert.doesNotMatch(nodeGood.stderr, /\berror\b/i, nodeGood.stderr);

const reactBad = await run(
  npmCommand,
  ["exec", "--yes", "--", "eslint", "--format", "json", "src/bad-typed.ts"],
  reactDir,
  {
    allowFailure: true,
  }
);
const nodeBad = await run(
  npmCommand,
  ["exec", "--yes", "--", "eslint", "--format", "json", "src/bad-typed.ts"],
  nodeDir,
  {
    allowFailure: true,
  }
);

function ruleIdsFromJson(stdout) {
  const text = String(stdout ?? "").trim();
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  const results = JSON.parse(start >= 0 && end >= start ? text.slice(start, end + 1) : "[]");
  return new Set((results[0]?.messages ?? []).map(message => message.ruleId));
}

assert.ok(
  ruleIdsFromJson(reactBad.stdout).has("@typescript-eslint/no-floating-promises"),
  "consumer React Typed Lint should report no-floating-promises"
);
assert.ok(
  ruleIdsFromJson(nodeBad.stdout).has("@typescript-eslint/no-floating-promises"),
  "consumer Node Typed Lint should report no-floating-promises"
);

console.log(`✓ npm pack + tmp-consumer installation passed (${tarballName})`);
