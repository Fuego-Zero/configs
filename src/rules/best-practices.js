/**
 * Airbnb 樱桃采：正确性与低噪音习惯规则。
 * 有 @typescript-eslint 对应项的 core 规则只放 javascriptBestPracticeRules，避免盖掉 typed preset。
 */
export const bestPracticeRules = {
  "array-callback-return": ["error", { allowImplicit: true }],
  "default-case": ["error", { commentPattern: "^no default$" }],
  "default-case-last": "error",
  "grouped-accessor-pairs": ["error", "getBeforeSet"],
  "guard-for-in": "error",
  "new-cap": [
    "error",
    {
      capIsNew: false,
      newIsCap: true,
    },
  ],
  "no-alert": "error",
  "no-await-in-loop": "error",
  "no-caller": "error",
  "no-constructor-return": "error",
  "no-else-return": "error",
  "no-eval": "error",
  "no-extend-native": "error",
  "no-extra-bind": "error",
  "no-extra-label": "error",
  "no-iterator": "error",
  "no-labels": "error",
  "no-lone-blocks": "error",
  "no-lonely-if": "error",
  "no-multi-assign": "error",
  "no-multi-str": "error",
  "no-nested-ternary": "error",
  "no-new": "error",
  "no-new-func": "error",
  "no-new-wrappers": "error",
  "no-octal-escape": "error",
  "no-proto": "error",
  "no-return-assign": ["error", "except-parens"],
  "no-script-url": "error",
  "no-self-compare": "error",
  "no-sequences": "error",
  "no-template-curly-in-string": "error",
  "no-unneeded-ternary": ["error", { defaultAssignment: false }],
  "no-unreachable-loop": "error",
  "no-useless-computed-key": "error",
  "no-useless-concat": "error",
  "no-useless-rename": "error",
  "no-useless-return": "error",
  "one-var": ["error", "never"],
  "operator-assignment": ["error", "always"],
  "prefer-destructuring": [
    "error",
    {
      AssignmentExpression: {
        array: true,
        object: false,
      },
      VariableDeclarator: {
        array: false,
        object: true,
      },
    },
    {
      enforceForRenamedProperties: false,
    },
  ],
  "prefer-exponentiation-operator": "error",
  "prefer-numeric-literals": "error",
  "prefer-spread": "error",
  radix: "error",
  "symbol-description": "error",
  yoda: "error",
};

export const javascriptBestPracticeRules = {
  "default-param-last": "error",
  "dot-notation": "error",
  "no-array-constructor": "error",
  "no-empty-function": "error",
  "no-implied-eval": "error",
  "no-loop-func": "error",
  "no-unused-expressions": "error",
  "no-use-before-define": [
    "error",
    {
      classes: true,
      functions: false,
      variables: true,
    },
  ],
  "no-useless-constructor": "error",
};
