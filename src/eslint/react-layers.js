import stylistic from "@stylistic/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import reactJsx from "eslint-plugin-react-jsx";
import reactX from "eslint-plugin-react-x";
import globals from "globals";

import { reactTeamRules } from "../rules/team.js";
import { ALL_CODE_FILES, REACT_FILES } from "./core.js";

const JSX_FILES = ["**/*.jsx"];
const TSX_FILES = ["**/*.tsx"];

function resolveHooksRecommended() {
  const recommended = reactHooks.configs?.flat?.recommended ?? reactHooks.configs?.recommended;

  if (!recommended) {
    throw new Error("eslint-plugin-react-hooks does not export a recommended flat config.");
  }

  return recommended;
}

function flattenPluginConfig(pluginConfig, name, files) {
  if (!pluginConfig) {
    throw new Error(`${name} is missing from the React lint plugin.`);
  }

  const configs = Array.isArray(pluginConfig) ? pluginConfig : [pluginConfig];

  return configs.map((config, index) => ({
    ...config,
    files,
    name: configs.length > 1 ? `${name}-${index}` : name,
  }));
}

export function createReactPluginLayers({
  files = REACT_FILES,
  hooksFiles = ALL_CODE_FILES,
  withBrowserGlobals = true,
} = {}) {
  const layers = [
    ...flattenPluginConfig(reactX.configs.recommended, "@fuego0/configs/react-core", JSX_FILES),
    ...flattenPluginConfig(reactX.configs["recommended-type-checked"], "@fuego0/configs/react-core-typed", TSX_FILES),
    ...flattenPluginConfig(reactJsx.configs.recommended, "@fuego0/configs/react-jsx", files),
  ];

  if (withBrowserGlobals) {
    layers.push({
      name: "@fuego0/configs/react-browser-globals",
      files: hooksFiles,
      languageOptions: {
        globals: {
          ...globals.browser,
        },
      },
    });
  }

  layers.push({
    ...resolveHooksRecommended(),
    name: "@fuego0/configs/react-hooks-recommended",
    files: hooksFiles,
  });

  // Keep official react-hooks as the hooks authority to avoid duplicate diagnostics.
  layers.push({
    name: "@fuego0/configs/react-hooks-dedupe",
    files: hooksFiles,
    rules: {
      "react-x/error-boundaries": "off",
      "react-x/exhaustive-deps": "off",
      "react-x/globals": "off",
      "react-x/immutability": "off",
      "react-x/purity": "off",
      "react-x/refs": "off",
      "react-x/rules-of-hooks": "off",
      "react-x/set-state-in-effect": "off",
      "react-x/set-state-in-render": "off",
      "react-x/static-components": "off",
      "react-x/unsupported-syntax": "off",
      "react-x/use-memo": "off",
    },
  });

  return layers;
}

export function createReactTeamLayer({ files = REACT_FILES } = {}) {
  return {
    name: "@fuego0/configs/react-team-rules",
    files,
    plugins: {
      "@stylistic": stylistic,
    },
    rules: reactTeamRules,
  };
}
