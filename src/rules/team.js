/**
 * 团队规则只放“明确认可、不会与 Prettier 抢职责”的规则。
 * 第三方 recommended 负责基础正确性；这里负责团队长期习惯与补充约束。
 */
export const teamRules = {
  "class-methods-use-this": "off",
  "consistent-return": "off",
  curly: ["error", "all"],
  eqeqeq: ["error", "always", { null: "ignore" }],
  "max-classes-per-file": "off",
  "no-confusing-arrow": "off",
  "no-console": "off",
  "no-empty": ["error", { allowEmptyCatch: true }],
  "no-param-reassign": "off",
  "no-plusplus": ["error", { allowForLoopAfterthoughts: true }],
  "no-underscore-dangle": "off",
  "no-var": "error",
  "object-shorthand": ["error", "always"],
  "prefer-const": "error",
  "prefer-object-has-own": "error",
  "prefer-object-spread": "error",
  "prefer-rest-params": "error",
  "prefer-template": "error",
};

export const typescriptTeamRules = {
  // 使用 inline type import，避免与“同模块只允许一个 import”产生 autofix 竞争。
  "@typescript-eslint/consistent-type-imports": [
    "error",
    {
      disallowTypeAnnotations: true,
      fixStyle: "inline-type-imports",
      prefer: "type-imports",
    },
  ],

  "@typescript-eslint/default-param-last": "error",
  "@typescript-eslint/no-loop-func": "error",
  "@typescript-eslint/no-use-before-define": [
    "error",
    {
      classes: true,
      enums: true,
      functions: false,
      typedefs: true,
      variables: true,
    },
  ],
  "@typescript-eslint/no-useless-constructor": "error",

  // 延续旧包团队习惯：不强制命名规则、不禁止 shadow。
  "@typescript-eslint/naming-convention": "off",
  "@typescript-eslint/no-shadow": "off",
};

export const reactTeamRules = {
  "@stylistic/jsx-self-closing-comp": [
    "error",
    {
      component: true,
      html: false,
    },
  ],
};
