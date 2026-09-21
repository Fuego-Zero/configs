import globals from "globals";

import { ALL_CODE_FILES, coreConfig } from "./core.js";
import { prettierCompat } from "./prettier-compat.js";

const nodeGlobals = {
  name: "@fuego0/configs/node-globals",
  files: ALL_CODE_FILES,
  languageOptions: {
    globals: {
      ...globals.node,
    },
  },
};

export default [...coreConfig, nodeGlobals, ...prettierCompat];
