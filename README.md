# @fuego0/configs

个人用的 ESLint Flat Config + Prettier 预设。覆盖 JavaScript / TypeScript / React / Node，默认开完整 Typed Lint。

输入时看红线，保存时 Prettier 格式化 + ESLint 安全 autofix。ESLint 里不跑 Prettier。

## 要求

- Node.js >= 22.13
- ESLint 10.4 – 10.x
- Prettier 3
- TypeScript 5.x（TS/TSX 项目，`< 6.1`）

不要用 `--force` / `--legacy-peer-deps`。插件已经打在本包 dependencies 里。

## 安装

```bash
npm i -D @fuego0/configs eslint prettier typescript
```

## 使用

React / TS：

```js
// eslint.config.js
export { default } from "@fuego0/configs/eslint/react";
```

```js
// prettier.config.js
export { default } from "@fuego0/configs/prettier";
```

项目需要自己的 `tsconfig.json`。Typed Lint 通过 `projectService` 自动发现它。

纯 Node：

```js
export { default } from "@fuego0/configs/eslint/node";
```

只注入 Node globals，不会带上 Browser globals。

既有浏览器又有 Node 的兼容入口：

```js
export { default } from "@fuego0/configs/eslint";
```

新项目优先显式选 `eslint/react` 或 `eslint/node`。

| 入口                          | 用途                                              |
| ----------------------------- | ------------------------------------------------- |
| `@fuego0/configs/eslint/react` | React + Typed Lint                                |
| `@fuego0/configs/eslint/node`  | Node + Typed Lint                                 |
| `@fuego0/configs/eslint`       | browser + Node globals，并在 JSX/TSX 上启用 React |
| `@fuego0/configs/eslint/base`  | 语言核心，不含环境 globals / React                |
| `@fuego0/configs/prettier`     | Prettier 配置                                     |
| `@fuego0/configs/react`        | `eslint/react` 别名                               |
| `@fuego0/configs/node`         | `eslint/node` 别名                                |

从 `@fuego-sdk/configs@0.9` 迁过来：把依赖名改成 `@fuego0/configs`，配置改成上面的 Flat Config 入口。旧的 `reactTSX` 导出仍指向 React 配置。

## 编辑器

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.format.enable": false,
  "eslint.run": "onType",
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"]
}
```

不要用宽泛的 `source.fixAll`。改过本包 `src/` 之后，命令面板执行 **ESLint: Restart ESLint Server**。

## 行为摘要

- **Typed Lint**：`recommendedTypeChecked` + `stylisticTypeChecked`，`projectService: true`。floating promise、unsafe `any`、misused promises 等在编辑器里就会报。
- **Import**：必须在文件顶部（directive 例外）；禁止重复；块结束后空一行；循环依赖检查（跳过 `node_modules`）。排序只由 Perfectionist 负责。
- **JSX**：props 顺序 `key/ref` → boolean shorthand → 普通 → `aria-*`/`data-*` → `onXxx`；空组件自闭合（HTML 标签不强制）。
- **Prettier**：`printWidth` 120，双引号，`semi`，`trailingComma: "es5"`，`arrowParens: "avoid"`，`endOfLine: "lf"`。

覆盖层写在共享配置之后：

```js
import config from "@fuego0/configs/eslint/react";

export default [
  ...config,
  {
    rules: {
      "no-console": "error",
    },
  },
];
```

## 开发

```bash
npm test
npm run lint
npm run format:check
npm run verify
```

故意违规的夹具在 `tests/fixtures/invalid/`，不进 npm 包。

## License

MIT
