import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import importPlugin, { createNodeResolver } from "eslint-plugin-import-x";
import perfectionist from "eslint-plugin-perfectionist";
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";
import { configs as typescriptEslintConfigs } from "typescript-eslint";

import { bestPracticeRules, javascriptBestPracticeRules } from "../rules/best-practices.js";
import { perfectionistRules } from "../rules/perfectionist.js";
import { teamRules, typescriptTeamRules } from "../rules/team.js";
import { unicornRules } from "../rules/unicorn.js";

export const ALL_CODE_FILES = ["**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}"];
export const JS_FILES = ["**/*.{js,mjs,cjs,jsx}"];
export const TS_FILES = ["**/*.{ts,mts,cts,tsx}"];
export const REACT_FILES = ["**/*.{jsx,tsx}"];

const typedRecommended = typescriptEslintConfigs.recommendedTypeChecked.map(config => ({
  ...config,
  files: TS_FILES,
}));

const typedStylistic = typescriptEslintConfigs.stylisticTypeChecked.map(config => ({
  ...config,
  files: TS_FILES,
}));

export const coreConfig = [
  {
    name: "@fuego0/configs/ignores",
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/.next/**",
      "**/.cache/**",
      "**/.turbo/**",
      "**/tmp-consumer/**",
      "**/*.min.js",
    ],
  },

  {
    ...js.configs.recommended,
    name: "@fuego0/configs/javascript-recommended",
    files: ALL_CODE_FILES,
  },

  ...typedRecommended,
  ...typedStylistic,

  {
    name: "@fuego0/configs/language",
    files: ALL_CODE_FILES,
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.builtin,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      sourceType: "module",
    },
  },

  {
    name: "@fuego0/configs/commonjs",
    files: ["**/*.cjs", "**/*.cts"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      sourceType: "commonjs",
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },

  {
    name: "@fuego0/configs/typescript-project-service",
    files: TS_FILES,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd(),
      },
    },
  },

  {
    name: "@fuego0/configs/plugins-and-team-rules",
    files: ALL_CODE_FILES,
    plugins: {
      "@stylistic": stylistic,
      "import-x": importPlugin,
      perfectionist,
      unicorn,
    },
    settings: {
      "import-x/extensions": [".js", ".mjs", ".cjs", ".jsx", ".ts", ".mts", ".cts", ".tsx"],
      "import-x/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx", ".mts", ".cts"],
      },
      "import-x/resolver-next": [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
        }),
        createNodeResolver(),
      ],
    },
    rules: {
      ...teamRules,
      ...bestPracticeRules,
      ...unicornRules,
      ...perfectionistRules,

      // Import 必须集中在模块顶部。directive（如 "use client"）可位于 import 前。
      "import-x/first": "error",

      // Import 块结束后必须空一行。Prettier 不会插入这一行，Perfectionist 只管组与组之间。
      "import-x/newline-after-import": ["error", { count: 1 }],

      // 同模块禁止重复 import；prefer-inline 与 consistent-type-imports 的 inline type 对齐，避免循环 fix。
      "no-duplicate-imports": "off",
      "import-x/no-duplicates": [
        "error",
        {
          "prefer-inline": true,
        },
      ],

      // 保留循环依赖检查，但跳过 node_modules，避免旧 Airbnb 无限外部扫描。
      "import-x/no-cycle": [
        "error",
        {
          ignoreExternal: true,
        },
      ],

      "import-x/no-absolute-path": "error",
      "import-x/no-amd": "error",
      "import-x/no-dynamic-require": "error",
      "import-x/no-empty-named-blocks": "error",
      "import-x/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: [
            "**/*.{test,spec}.*",
            "**/tests/**",
            "**/test/**",
            "**/__tests__/**",
            "**/*.{config,setup}.{js,cjs,mjs,ts,cts,mts}",
          ],
        },
      ],
      "import-x/no-import-module-exports": "error",
      "import-x/no-mutable-exports": "error",
      "import-x/no-named-as-default": "warn",
      "import-x/no-named-as-default-member": "warn",
      "import-x/no-self-import": "error",
      "import-x/no-useless-path-segments": "error",
      "import-x/no-webpack-loader-syntax": "error",
    },
  },

  {
    name: "@fuego0/configs/javascript-best-practices",
    files: JS_FILES,
    rules: javascriptBestPracticeRules,
  },

  {
    name: "@fuego0/configs/typescript-team-rules",
    files: TS_FILES,
    rules: {
      ...typescriptTeamRules,
    },
  },
];
