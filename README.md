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

| 入口                           | 用途                                              |
| ------------------------------ | ------------------------------------------------- |
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
- **逻辑段落空行**：代码块结束后，与下一条语句之间至少空一行（[Airbnb §19.7](https://github.com/airbnb/javascript#whitespace--after-blocks)）。使用 `@stylistic/padding-line-between-statements`，支持 ESLint 自动修复；`if/else` 和 `try/catch/finally` 各按一条完整语句处理，单语句分支仍须使用大括号。
- **Import**：必须在文件顶部（directive 例外）；禁止重复；块结束后空一行；循环依赖检查（跳过 `node_modules`）。排序只由 Perfectionist 负责。
- **JSX**：props 顺序 `key/ref` → boolean shorthand → 普通 → `aria-*`/`data-*` → `onXxx`；空组件自闭合（HTML 标签不强制）。JSX 子节点 `{...}` 里的 `条件 ? 节点 : null` 改成 `条件 && 节点`，`条件 ? null : 节点` 改成 `!条件 && 节点`（相等判断直接取反，如 `a !== b &&`）；类型明确为字符串、数组或元组的 `.length` 会改成 `.length > 0 &&`。条件是布尔值、可空对象（如 `User | null`）或可选函数时自动修复；可能是数字、字符串的结构类型、自定义 `.length`，或没有类型信息的条件时只报错不修复，避免改变渲染结果。赋值、函数参数、props、`return` 等位置拿到的是值，不检查。规则名 `@fuego0/prefer-and-over-null-ternary`，可在覆盖层关闭。
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

## 发版

版本号写在要合并的 PR 里，同时改 `package.json` 和 `package-lock.json`。本仓库内的 PR 合并进 `main` 后，只有版本号相对该 PR 的 base 提交发生变化，[Release 工作流](.github/workflows/release.yml) 才会：

1. 跑 `npm run verify`，将验收实际安装的 tgz 保存为工作流产物
2. 在独立任务中通过 OIDC 发布同一个 tgz，不重新打包、不安装项目依赖、不执行包脚本；检查 npm 上的完整性是否一致
3. 在仓库 Releases 新增指向该次合并提交的 `vX.Y.Z`，正式版标成 Latest，预发布版使用 npm 的 next 标签并创建 GitHub prerelease

版本没变、PR 未合并或直接 push main 均不发布。校验失败则不发 npm，也不建 Release。同版本已存在时仅接受完全相同的 tgz，否则停止。

第一次发版前，在 npm 上给 `@fuego0/configs` 添加 Trusted Publisher，字段必须和仓库完全一致：

- Organization or user：`Fuego-Zero`
- Repository：`configs`
- Workflow filename：`release.yml`（只写文件名）
- Environment：留空
- 允许直接 `npm publish`。只开 staged publish 时，这个工作流发不出版

不需要把 npm token 放进 GitHub Secrets。

### GitHub Packages

同一发布流程额外发布 `@fuego-zero/configs` 到 `https://npm.pkg.github.com/`，并通过包内 `repository` 字段关联 `Fuego-Zero/configs`。scope 使用仓库所有者的小写名称；npmjs.com 继续使用 `@fuego0/configs`，仓库的 package.json 和版本号不会被改写。

工作流从已验收的 npm tgz 派生 GitHub Packages tgz，仅改包内的 name、repository 和 publishConfig，逐文件核对其余内容完全一致，然后用 React/Node 消费者安装验收。两个仓库分别上传、下载自己的已验收产物。GitHub Packages 任务在 npm 发布和 GitHub Release 成功后运行，重复运行时检查相同版本的完整性。

GitHub Packages 使用独立任务的 `packages: write` 权限，认证仅通过该步骤的 `NODE_AUTH_TOKEN: ${{ github.token }}` 读取 Actions 自动生成的 GITHUB_TOKEN，不需要长期 token 或新增 Secret。npmjs.com 的 OIDC 任务不接收这个环境变量。

GitHub Packages 新包默认私有，包的可见性由 GitHub Packages 管理；工作流不会自动调整可见性。此流程仍只在 PR 合并 main 且版本变化时运行，仅合并 CI 配置不会补发已经发布的 1.2.0。

补发当前 main 的已发布版本时，在 main 上手动运行 `Backfill GitHub Packages` 并填写版本号。该入口下载 npmjs.com 现有 tgz 并校验 SHA-512，派生、验收后仅发布 GitHub Packages，不重新发布 npmjs.com，也不创建或改动 GitHub Release。

## License

MIT
