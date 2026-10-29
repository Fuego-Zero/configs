import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFile, mkdir, mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { setTimeout } from "node:timers/promises";

const registry = "https://npm.pkg.github.com/";
const repository = "Fuego-Zero/configs";
const packageName = "@fuego-zero/configs";
const root = process.cwd();
const sourceDir = path.join(root, ".release-package");
const targetDir = path.join(sourceDir, "github");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const pkg = JSON.parse(await readFile("package.json", "utf8"));
assert.equal(pkg.name, "@fuego0/configs");
if (process.env.GITHUB_REPOSITORY) {
  assert.equal(process.env.GITHUB_REPOSITORY, repository);
}

function runNpm(args, cwd = root) {
  return spawnSync(npm, args, { cwd, encoding: "utf8", shell: process.platform === "win32", windowsHide: true });
}

function unpack(tarball, directory) {
  const entries = execFileSync("tar", ["-tzf", tarball], { encoding: "utf8" }).trim().split(/\r?\n/);
  assert.ok(entries.every(entry => entry.startsWith("package/") && !entry.split("/").includes("..")));
  execFileSync("tar", ["-xzf", tarball, "-C", directory]);
}

async function onlyTarball(directory) {
  const files = (await readdir(directory)).filter(file => file.endsWith(".tgz"));
  assert.equal(files.length, 1, "Expected exactly one release tarball");

  return path.join(directory, files[0]);
}

async function payload(directory, prefix = "") {
  const result = {};
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const name = `${prefix}${entry.name}`;
    const location = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      Object.assign(result, await payload(location, `${name}/`));
    } else {
      assert.ok(entry.isFile(), "Package payload must contain only regular files");
      result[name] = await readFile(location);
    }
  }

  return result;
}

const mode = process.argv[2];
if (mode === "fetch") {
  assert.equal(process.env.REQUESTED_VERSION, pkg.version, "Backfill version must match main");
  const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(pkg.name)}/${pkg.version}`, {
    signal: AbortSignal.timeout(30000),
  });
  assert.ok(response.ok, `npm metadata returned ${response.status}`);
  const published = await response.json();
  assert.equal(published.name, pkg.name);
  assert.equal(published.version, pkg.version);
  const url = new URL(published.dist.tarball);
  assert.equal(url.origin, "https://registry.npmjs.org");
  const download = await fetch(url, { signal: AbortSignal.timeout(30000) });
  assert.ok(download.ok, `npm tarball returned ${download.status}`);
  const bytes = Buffer.from(await download.arrayBuffer());
  assert.equal(`sha512-${createHash("sha512").update(bytes).digest("base64")}`, published.dist.integrity);
  await mkdir(sourceDir, { recursive: true });
  await writeFile(path.join(sourceDir, `${pkg.name.replace("@", "").replace("/", "-")}-${pkg.version}.tgz`), bytes);
  if (process.env.GITHUB_OUTPUT) {
    await appendFile(
      process.env.GITHUB_OUTPUT,
      `version=${pkg.version}\ntag=${pkg.version.includes("-") ? "next" : "latest"}\n`
    );
  }
  console.log(`Downloaded and integrity-checked npm artifact: ${pkg.name}@${pkg.version}`);
} else if (mode === "prepare") {
  const original = path.join(sourceDir, `${pkg.name.replace("@", "").replace("/", "-")}-${pkg.version}.tgz`);
  const originalBytes = await readFile(original);
  const staging = await mkdtemp(path.join(os.tmpdir(), "configs-github-package-"));
  unpack(original, staging);
  const packageDir = path.join(staging, "package");
  const before = await payload(packageDir);
  const metadata = JSON.parse(before["package.json"]);
  assert.equal(metadata.name, pkg.name);
  assert.equal(metadata.version, pkg.version);
  metadata.name = packageName;
  metadata.repository = { type: "git", url: `git+https://github.com/${repository}.git` };
  metadata.publishConfig = { registry };
  await writeFile(path.join(packageDir, "package.json"), `${JSON.stringify(metadata, null, 2)}\n`);
  await mkdir(targetDir, { recursive: true });
  const packed = runNpm(["pack", "--ignore-scripts", "--json", "--pack-destination", targetDir], packageDir);
  assert.equal(packed.status, 0, packed.stderr);
  const tarball = path.join(targetDir, JSON.parse(packed.stdout)[0].filename);
  const verification = await mkdtemp(path.join(os.tmpdir(), "configs-github-check-"));
  unpack(tarball, verification);
  const after = await payload(path.join(verification, "package"));
  assert.deepEqual(Object.keys(after).sort(), Object.keys(before).sort());
  for (const name of Object.keys(before)) {
    if (name !== "package.json") {
      assert.deepEqual(after[name], before[name], `Payload changed: ${name}`);
    }
  }
  assert.deepEqual(JSON.parse(after["package.json"]), metadata);
  assert.deepEqual(await readFile(original), originalBytes, "Original npm artifact changed");
  console.log(`Verified derived artifact: ${tarball}`);
} else if (mode === "publish") {
  assert.equal(process.env.GITHUB_ACTIONS, "true", "Publishing is only supported in GitHub Actions");
  assert.equal(process.env.GITHUB_REPOSITORY, repository);
  assert.equal(process.env.EXPECTED_VERSION, pkg.version);
  assert.ok(process.env.NODE_AUTH_TOKEN, "GITHUB_TOKEN must be supplied by Actions");
  const tag = pkg.version.includes("-") ? "next" : "latest";
  assert.equal(process.env.RELEASE_TAG, tag);
  const tarball = await onlyTarball(targetDir);
  const staging = await mkdtemp(path.join(os.tmpdir(), "configs-github-publish-"));
  unpack(tarball, staging);
  const metadata = JSON.parse(await readFile(path.join(staging, "package/package.json"), "utf8"));
  assert.equal(metadata.name, packageName);
  assert.equal(metadata.version, pkg.version);
  assert.deepEqual(metadata.publishConfig, { registry });
  assert.equal(metadata.repository.url, `git+https://github.com/${repository}.git`);
  const integrity = `sha512-${createHash("sha512")
    .update(await readFile(tarball))
    .digest("base64")}`;
  const spec = `${packageName}@${pkg.version}`;
  const existing = runNpm(["view", spec, "--json", `--registry=${registry}`]);
  if (existing.status === 0) {
    assert.equal(JSON.parse(existing.stdout).dist.integrity, integrity, "Existing GitHub package differs");
  } else {
    assert.equal(JSON.parse(existing.stdout).error?.code, "E404", "Registry query failed; refusing to publish");
    const published = runNpm([
      "publish",
      tarball,
      "--ignore-scripts",
      "--provenance=false",
      "--tag",
      tag,
      `--registry=${registry}`,
    ]);
    assert.equal(published.status, 0, published.stderr);
  }
  let confirmed = runNpm(["view", spec, "--json", `--registry=${registry}`]);
  for (let attempt = 0; confirmed.status !== 0 && attempt < 12; attempt++) {
    assert.equal(JSON.parse(confirmed.stdout).error?.code, "E404", "Registry confirmation failed");
    await setTimeout(5000);
    confirmed = runNpm(["view", spec, "--json", `--registry=${registry}`]);
  }
  assert.equal(confirmed.status, 0, confirmed.stderr);
  assert.equal(JSON.parse(confirmed.stdout).dist.integrity, integrity);
  await writeFile(process.env.GITHUB_STEP_SUMMARY, `Verified GitHub Packages: ${spec}\n`, { flag: "a" });
} else {
  throw new Error("Expected fetch, prepare or publish");
}
