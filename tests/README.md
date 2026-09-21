# 测试夹具

这些文件用来验证共享配置，不是业务示例。

- `valid/`：应当全部通过
- `invalid/`：同类型规则合并，打开即可看到红线（见 `invalid/README.md`）
- `fix/`：保存后观察自动修复
- `format/`：Prettier 格式对照

`npm test` 会跑 validation + autofix。故意违规的文件不进 `npm run lint`，也不进 npm 包。
