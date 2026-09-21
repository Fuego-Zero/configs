import base from "./eslint/base.js";
import eslint from "./eslint/index.js";
import node from "./eslint/node.js";
import react from "./eslint/react.js";
import prettier from "./prettier.js";

// reactTSX 保留为迁移别名；新项目建议使用 react。
const reactTSX = react;

export { base, eslint, node, prettier, react, reactTSX };

export default {
  base,
  eslint,
  node,
  prettier,
  react,
  reactTSX,
};
