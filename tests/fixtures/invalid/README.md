# 故意违规范例

同类型规则放在同一个文件里。打开后看红色波浪线，悬停可看到 rule id。

如果刚改过 `src/eslint` 或 `src/rules` 却没有红线：命令面板执行 **ESLint: Restart ESLint Server**，再重新打开文件。编辑器里的 ESLint 服务会缓存已加载的配置，不会在每次改共享规则时自动热更新。

| 打开这个 | 能看到的规则类型 |
| --- | --- |
| `js/language.js` | 语言习惯：`var`、未使用变量、`curly`、`eqeqeq`、`debugger` 等 |
| `js/unicorn.js` | 现代 API：`find`、`includes`、`startsWith`、`node:` 协议 |
| `js/best-practices.js` | Airbnb 樱桃采：解构、else-return、嵌套三元、radix、alert、default-case、await-in-loop、new wrappers、eval |
| `import/import-rules.ts` | import 必须顶部、禁止重复、import 块后空行、分组排序、named import/export 排序、inline type import |
| `import/import-correctness.ts` | import 正确性：自引用、无用路径段、named-as-default（warn） |
| `cycle/a.ts` | 循环依赖。可以顺便打开 `cycle/b.ts` |
| `ts/typed-unsafe.ts` | Typed Lint：`any`、unsafe assignment/call/argument/return/member、多余断言 |
| `ts/typed-promises.ts` | Typed Lint：floating promise、await 非 thenable、async 无 await、`Promise.reject` 非 Error |
| `ts/typescript-style.ts` | TS 风格：`string[]`、可推断类型、optional chain、`??`、interface 排序、未使用变量 |
| `react/hooks.tsx` | Hooks：条件调用、effect 里 setState、render 里 setState |
| `react/jsx.tsx` | JSX：props 排序、组件自闭合、misused promise、list key、组件嵌套定义 |

`valid/` 里的文件应当没有这些红线。
