import config from "./src/eslint/index.js";

// 改 src/eslint 或 src/rules 后，命令面板执行 “ESLint: Restart ESLint Server”，
// 否则编辑器会继续用已缓存的 Flat Config，范例文件看起来像没有红线。
export default [
  {
    name: "@fuego0/configs/repository-ignores",
    ignores: ["examples/**", "tmp-consumer/**"],
  },
  ...config,
];
