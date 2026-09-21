import eslintConfigPrettier from "eslint-config-prettier/flat";

/**
 * Prettier owns wrapping, quotes, indentation, trailing spaces, and
 * blank lines at the start/end of blocks.
 *
 * Re-enable only structural rules that eslint-config-prettier turns off
 * but the team still wants as errors. Do not re-enable `padded-blocks` or
 * `no-trailing-spaces` — those duplicate Prettier and can fight it.
 */
export const prettierCompat = [
  eslintConfigPrettier,
  {
    name: "@fuego0/configs/prettier-exceptions",
    rules: {
      curly: ["error", "all"],
    },
  },
];
