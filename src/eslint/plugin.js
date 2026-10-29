import preferAndOverNullTernary from "./rules/prefer-and-over-null-ternary.js";

export const fuegoPlugin = {
  meta: {
    name: "@fuego0",
  },
  rules: {
    "prefer-and-over-null-ternary": preferAndOverNullTernary,
  },
};
