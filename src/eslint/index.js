import globals from "globals";

import { ALL_CODE_FILES, coreConfig, REACT_FILES } from "./core.js";
import { prettierCompat } from "./prettier-compat.js";
import { createReactPluginLayers, createReactTeamLayer } from "./react-layers.js";

/**
 * 默认通用配置：同时开放 browser + Node globals，并在 JSX/TSX 上启用 React 规则。
 * 新项目更推荐显式选择 /eslint/react 或 /eslint/node。
 */
const universalGlobals = {
  name: "@fuego0/configs/universal-globals",
  files: ALL_CODE_FILES,
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node,
    },
  },
};

export default [
  ...coreConfig,
  universalGlobals,
  ...createReactPluginLayers({
    files: REACT_FILES,
    hooksFiles: ALL_CODE_FILES,
    withBrowserGlobals: false,
  }),
  ...prettierCompat,
  createReactTeamLayer({ files: REACT_FILES }),
];
