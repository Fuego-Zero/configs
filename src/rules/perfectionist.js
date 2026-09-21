/**
 * Perfectionist 只负责“结构顺序”，不负责换行/引号/缩进等 Prettier 职责。
 * 这是唯一的 import / named export / JSX props 排序权威。
 */
export const perfectionistRules = {
  "perfectionist/sort-imports": [
    "error",
    {
      groups: [
        ["type-builtin", "value-builtin"],
        ["type-external", "value-external"],
        [
          "type-tsconfig-path",
          "value-tsconfig-path",
          "type-subpath",
          "value-subpath",
          "type-internal",
          "value-internal",
        ],
        ["type-parent", "value-parent", "type-sibling", "value-sibling", "type-index", "value-index"],
      ],
      ignoreCase: true,
      internalPattern: ["^~/.+", "^@/.+", "^#.+"],
      newlinesBetween: 1,
      newlinesInside: 0,
      order: "asc",
      sortSideEffects: false,
      tsconfig: {
        rootDir: ".",
      },
      type: "natural",
    },
  ],

  "perfectionist/sort-named-imports": [
    "error",
    {
      ignoreCase: true,
      order: "asc",
      type: "natural",
    },
  ],

  "perfectionist/sort-named-exports": [
    "error",
    {
      ignoreCase: true,
      order: "asc",
      type: "natural",
    },
  ],

  "perfectionist/sort-interfaces": [
    "error",
    {
      ignoreCase: true,
      order: "asc",
      type: "natural",
    },
  ],

  "perfectionist/sort-jsx-props": [
    "error",
    {
      customGroups: [
        {
          elementNamePattern: "^(key|ref)$",
          groupName: "reserved",
        },
        {
          elementNamePattern: "^(aria-|data-)",
          groupName: "metadata",
        },
        {
          elementNamePattern: "^on[A-Z]",
          groupName: "callback",
        },
      ],
      groups: ["reserved", "shorthand-prop", "unknown", "metadata", "callback"],
      ignoreCase: true,
      newlinesBetween: 0,
      newlinesInside: 0,
      order: "asc",
      type: "natural",
    },
  ],
};
