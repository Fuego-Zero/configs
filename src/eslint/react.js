import globals from "globals";

import { ALL_CODE_FILES, coreConfig, REACT_FILES } from "./core.js";
import { prettierCompat } from "./prettier-compat.js";
import { createReactPluginLayers, createReactTeamLayer } from "./react-layers.js";

const reactBrowserGlobals = {
  name: "@fuego0/configs/react-browser-only-globals",
  files: ALL_CODE_FILES,
  languageOptions: {
    globals: {
      ...globals.browser,
    },
  },
};

export default [
  ...coreConfig,
  reactBrowserGlobals,
  ...createReactPluginLayers({
    files: REACT_FILES,
    hooksFiles: ALL_CODE_FILES,
    withBrowserGlobals: false,
  }),
  ...prettierCompat,
  createReactTeamLayer({ files: REACT_FILES }),
];
