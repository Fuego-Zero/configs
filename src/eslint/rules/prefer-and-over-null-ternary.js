/**
 * JSX 子节点里 `条件 ? 节点 : null` 改成 `条件 && 节点`，`条件 ? null : 节点` 改成 `!条件 && 节点`。
 * 只检查直接写在 JSX 子节点 `{...}` 里的三元表达式；赋值、函数参数、props、return 等位置
 * 拿到的是值，`&&` 在条件为假时得到 false / 0 / ""，不是 null，所以不在此规则范围内。
 * 条件可能是 0 这类会被渲染的值时只报错不修复，否则 `{count && <X />}` 会把 0 渲染出来。
 * `.jsx` 没有类型信息，只有比较、`!x` 这类语法上必为布尔的条件才修复。
 */

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const COMPARISON_OPERATORS = new Set(["==", "!=", "===", "!==", "<", "<=", ">", ">=", "in", "instanceof"]);
const INVERTED_EQUALITY = { "==": "!=", "!=": "==", "===": "!==", "!==": "===" };

/** @param {import("estree").Node} node */
function isNullLiteral(node) {
  return node.type === "Literal" && node.value === null;
}

/** @param {import("estree").Node} node */
function isJsx(node) {
  return node.type === "JSXElement" || node.type === "JSXFragment";
}

function isJsxChild(node) {
  const container = node.parent;

  return (
    container?.type === "JSXExpressionContainer" &&
    (container.parent?.type === "JSXElement" || container.parent?.type === "JSXFragment")
  );
}

/** @param {import("estree").Node} node */
function isLengthAccess(node) {
  return (
    node.type === "MemberExpression" &&
    !node.computed &&
    node.property.type === "Identifier" &&
    node.property.name === "length"
  );
}

/** `&&` 左侧优先级更低时必须加括号，否则 `||` / `??` 会把右侧吞进去。 */
function needsParensAsAndLeft(node) {
  if (node.type === "LogicalExpression") {
    return node.operator !== "&&";
  }

  return (
    node.type === "ConditionalExpression" ||
    node.type === "AssignmentExpression" ||
    node.type === "SequenceExpression" ||
    node.type === "ArrowFunctionExpression" ||
    node.type === "YieldExpression"
  );
}

/** `!` 的操作数只有这些不用加括号。 */
function isNegatableWithoutParens(node) {
  return (
    node.type === "Identifier" ||
    node.type === "Literal" ||
    node.type === "ThisExpression" ||
    node.type === "MemberExpression" ||
    node.type === "CallExpression" ||
    node.type === "ChainExpression" ||
    node.type === "UnaryExpression"
  );
}

function isBooleanSyntax(node) {
  if (node.type === "UnaryExpression") {
    return node.operator === "!";
  }

  if (node.type === "BinaryExpression") {
    return COMPARISON_OPERATORS.has(node.operator);
  }

  if (node.type === "LogicalExpression" && node.operator !== "??") {
    return isBooleanSyntax(node.left) && isBooleanSyntax(node.right);
  }

  return node.type === "Literal" && typeof node.value === "boolean";
}

/**
 * 假值只可能是 false / null / undefined 的类型，`&&` 短路后 React 都不渲染，和 null 等价。
 * 对象类型永远为真，可空对象（`User | null`）也安全；`{}` / `Object` 能装下 0，不算。
 */
function isRenderSafeType(type, checker, flags) {
  if (type.isUnion()) {
    return type.types.every(part => isRenderSafeType(part, checker, flags));
  }

  if (type.flags & flags.TypeParameter) {
    const constraint = checker.getBaseConstraintOfType(type);

    return Boolean(constraint) && constraint !== type && isRenderSafeType(constraint, checker, flags);
  }

  if (type.flags & (flags.BooleanLike | flags.Null | flags.Undefined | flags.Void | flags.NonPrimitive)) {
    return true;
  }

  if (type.flags & flags.Object) {
    const primitives = [
      checker.getNumberType(),
      checker.getStringType(),
      checker.getBigIntType(),
      checker.getESSymbolType(),
    ];

    if (primitives.some(primitive => checker.isTypeAssignableTo(primitive, type))) {
      return false;
    }

    if (type.getCallSignatures().length > 0 || type.getConstructSignatures().length > 0) {
      return true;
    }

    return checker.getPropertiesOfType(type).length > 0 && checker.typeToString(type) !== "Object";
  }

  return false;
}

function createConditionCheck(sourceCode) {
  const services = sourceCode.parserServices;

  if (!services?.program || !services.esTreeNodeToTSNodeMap) {
    return { isRenderSafe: isBooleanSyntax, isSafeLength: () => false };
  }

  const { TypeFlags } = require("typescript");
  const checker = services.program.getTypeChecker();

  function isRenderSafe(node) {
    if (isBooleanSyntax(node)) {
      return true;
    }

    const tsNode = services.esTreeNodeToTSNodeMap.get(node);

    return Boolean(tsNode) && isRenderSafeType(checker.getTypeAtLocation(tsNode), checker, TypeFlags);
  }

  function isLengthReceiver(type) {
    if (type.isUnion()) {
      return type.types.every(isLengthReceiver);
    }

    if (type.flags & TypeFlags.TypeParameter) {
      const constraint = checker.getBaseConstraintOfType(type);

      return Boolean(constraint) && constraint !== type && isLengthReceiver(constraint);
    }

    return Boolean(type.flags & TypeFlags.StringLike) || checker.isArrayType(type) || checker.isTupleType(type);
  }

  return {
    isRenderSafe,
    isSafeLength(node) {
      const tsNode = services.esTreeNodeToTSNodeMap.get(node.object);

      return Boolean(tsNode) && isLengthReceiver(checker.getTypeAtLocation(tsNode));
    },
  };
}

function hasDroppedComments(sourceCode, node, keptNodes) {
  return sourceCode
    .getCommentsInside(node)
    .some(comment => !keptNodes.some(kept => comment.range[0] >= kept.range[0] && comment.range[1] <= kept.range[1]));
}

/** @type {import("eslint").Rule.RuleModule} */
const preferAndOverNullTernary = {
  meta: {
    type: "suggestion",
    docs: {
      description: "JSX 子节点里条件渲染 null 时使用 &&，不用三元表达式。",
    },
    fixable: "code",
    schema: [],
    messages: {
      preferAnd: "JSX 里为 null 的分支改用 &&，不要写三元表达式。",
      preferAndUnsafeCondition:
        "JSX 里为 null 的分支改用 &&，不要写三元表达式。条件可能是数字等会被渲染出来的值，请先写成明确的条件（如 `count > 0`）再改用 &&，否则 0 会显示在页面上。",
    },
  },
  create(context) {
    const { sourceCode } = context;
    const { isRenderSafe, isSafeLength } = createConditionCheck(sourceCode);

    function negateTest(node) {
      const text = sourceCode.getText(node);

      if (node.type === "BinaryExpression" && node.operator in INVERTED_EQUALITY) {
        const operator = sourceCode.getFirstTokenBetween(node.left, node.right, token => token.value === node.operator);
        const { text: source } = sourceCode;

        return `${source.slice(node.range[0], operator.range[0])}${INVERTED_EQUALITY[node.operator]}${source.slice(operator.range[1], node.range[1])}`;
      }

      return isNegatableWithoutParens(node) ? `!${text}` : `!(${text})`;
    }

    function buildTest(node, negate) {
      const text = sourceCode.getText(node);

      if (negate) {
        return negateTest(node);
      }

      if (isLengthAccess(node) && isSafeLength(node)) {
        return `${text} > 0`;
      }

      if (isRenderSafe(node)) {
        return needsParensAsAndLeft(node) ? `(${text})` : text;
      }

      return null;
    }

    return {
      ConditionalExpression(node) {
        if (!isJsxChild(node)) {
          return;
        }

        let negate;
        let rendered;

        if (isNullLiteral(node.alternate) && isJsx(node.consequent)) {
          negate = false;
          rendered = node.consequent;
        } else if (isNullLiteral(node.consequent) && isJsx(node.alternate)) {
          negate = true;
          rendered = node.alternate;
        } else {
          return;
        }

        const test = buildTest(node.test, negate);

        if (test === null) {
          context.report({ node, messageId: "preferAndUnsafeCondition" });
          return;
        }

        context.report({
          node,
          messageId: "preferAnd",
          fix: hasDroppedComments(sourceCode, node, [node.test, rendered])
            ? null
            : fixer => {
                const jsx = sourceCode.getText(rendered);
                const right = sourceCode.getText(node).includes("\n") ? `(${jsx})` : jsx;

                return fixer.replaceText(node, `${test} && ${right}`);
              },
        });
      },
    };
  },
};

export default preferAndOverNullTernary;
