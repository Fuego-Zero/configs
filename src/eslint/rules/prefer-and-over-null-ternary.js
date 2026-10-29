/**
 * JSX 子节点里 `条件 ? 节点 : null` 改成 `条件 && 节点`，`条件 ? null : 节点` 改成 `!条件 && 节点`。
 * 只检查直接写在 JSX 子节点 `{...}` 里的三元表达式；赋值、函数参数、props、return 等位置
 * 拿到的是值，`&&` 在条件为假时得到 false / 0 / ""，不是 null，所以不在此规则范围内。
 * 条件不能确定是布尔值时只报错不修复，否则 `{count && <X />}` 会把 0 渲染出来。
 */

const COMPARISON_OPERATORS = new Set(["==", "!=", "===", "!==", "<", "<=", ">", ">=", "in", "instanceof"]);
/** React 对这些值都不渲染，`&&` 短路得到它们和 null 等价。 */
const RENDER_SAFE_TYPE_NAMES = new Set(["boolean", "true", "false", "null", "undefined"]);

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

function isRenderSafeType(type, checker) {
  if (type.isUnion()) {
    return type.types.every(part => isRenderSafeType(part, checker));
  }

  return RENDER_SAFE_TYPE_NAMES.has(checker.typeToString(type));
}

function createBooleanCheck(sourceCode) {
  const services = sourceCode.parserServices;

  if (!services?.program || !services.esTreeNodeToTSNodeMap) {
    return isBooleanSyntax;
  }

  const checker = services.program.getTypeChecker();

  return node => {
    if (isBooleanSyntax(node)) {
      return true;
    }

    const tsNode = services.esTreeNodeToTSNodeMap.get(node);

    return Boolean(tsNode) && isRenderSafeType(checker.getTypeAtLocation(tsNode), checker);
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
      preferAndNonBoolean:
        "JSX 里为 null 的分支改用 &&，不要写三元表达式。条件不是布尔值，请先写成明确的布尔条件（如 `count > 0`），否则会把 0 或空字符串渲染出来。",
    },
  },
  create(context) {
    const { sourceCode } = context;
    const isBoolean = createBooleanCheck(sourceCode);

    function buildTest(node, negate) {
      const text = sourceCode.getText(node);

      if (negate) {
        return isNegatableWithoutParens(node) ? `!${text}` : `!(${text})`;
      }

      if (isLengthAccess(node)) {
        return `${text} > 0`;
      }

      if (isBoolean(node)) {
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
          context.report({ node, messageId: "preferAndNonBoolean" });
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
