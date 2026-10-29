import path from "node:path";
import { fileURLToPath } from "node:url";

import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";

import rule from "../src/eslint/rules/prefer-and-over-null-ternary.js";

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const tester = new RuleTester({
  languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
});
const report = (code, output, messageId = "preferAnd") => ({ code, output, errors: [{ messageId }] });

tester.run("prefer-and-over-null-ternary (syntax)", rule, {
  valid: [
    "const x = ready ? <X /> : null;",
    "const x = <X prop={ready ? <Y /> : null} />;",
    "const x = <>{items.map(item => item ? <X /> : null)}</>;",
    "const x = <>{ready ? <X /> : <Y />}</>;",
  ],
  invalid: [
    report("const x = <>{a === b ? <X /> : null}</>;", "const x = <>{a === b && <X />}</>;"),
    report("const x = <>{a === b ? null : <X />}</>;", "const x = <>{a !== b && <X />}</>;"),
    report("const x = <>{a || b ? null : <X />}</>;", "const x = <>{!(a || b) && <X />}</>;"),
    report("const x = <>{!a || !b ? <X /> : null}</>;", "const x = <>{(!a || !b) && <X />}</>;"),
    report("const x = <>{count ? <X /> : null}</>;", null, "preferAndUnsafeCondition"),
    report("const x = <>{items.length ? <X /> : null}</>;", null, "preferAndUnsafeCondition"),
    report("const x = <>{ready ? <X /> : /* keep */ null}</>;", null, "preferAndUnsafeCondition"),
    report("const x = <>{!ready ? <X /> : /* keep */ null}</>;", null),
    report("const x = <>{!ready ? /* keep */ <X /> : null}</>;", null),
  ],
});

const typed = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { projectService: true, tsconfigRootDir: testsDir },
  },
});
const typedReport = (type, expression, replacement) => {
  const source = `declare const value: ${type}; const x = <>{${expression} ? <X /> : null}</>;`;

  return {
    filename: path.join(testsDir, "fixtures/fix/null-ternary-input.tsx"),
    ...report(
      source,
      replacement === null ? null : `declare const value: ${type}; const x = <>{${replacement} && <X />}</>;`,
      replacement === null ? "preferAndUnsafeCondition" : "preferAnd"
    ),
  };
};

typed.run("prefer-and-over-null-ternary (types)", rule, {
  valid: [],
  invalid: [
    typedReport("boolean", "value", "value"),
    typedReport("{ id: number } | null", "value", "value"),
    typedReport("(() => void) | undefined", "value", "value"),
    typedReport("number", "value", null),
    typedReport("string", "value", null),
    typedReport("any", "value", null),
    typedReport("unknown", "value", null),
    typedReport("{}", "value", null),
    typedReport("Object", "value", null),
    typedReport("{ toFixed(): string } | null", "value", null),
    typedReport("{ toString(): string }", "value", null),
    typedReport("{ length: number }", "value", null),
    typedReport("{ length: number }", "value.length", null),
    typedReport("{ length: string }", "value.length", null),
    typedReport("string[]", "value.length", "value.length > 0"),
    typedReport("readonly string[]", "value.length", "value.length > 0"),
    typedReport("readonly [string, string?]", "value.length", "value.length > 0"),
    typedReport("string | string[]", "value.length", "value.length > 0"),
    typedReport("string", "value.length", "value.length > 0"),
  ],
});

console.log("✓ null ternary rule syntax and type regressions passed");
