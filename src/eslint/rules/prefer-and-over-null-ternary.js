/**
 * JSX 里 `条件 ? 节点 : null` 改成 `条件 && 节点`。
 * 数据位置仍要返回真正的 null（例如筛选值、查找结果），不在此规则范围内，
 * 因为 `&&` 在条件为 false 时得到的是 false，不是 null。
 * `.length` 改成 `> 0 &&`，避免 React 把数字 0 渲染出来。
 */

/** @param {import("estree").Node} node */
function isNullLiteral(node) {
  return node.type === "Literal" && node.value === null;
}

/** @param {import("estree").Node} node */
function isJsx(node) {
  return node.type === "JSXElement" || node.type === "JSXFragment";
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

/** @type {import("eslint").Rule.RuleModule} */
const preferAndOverNullTernary = {
  meta: {
    type: "suggestion",
    docs: {
      description: "JSX 条件结果为 null 时使用 &&，不用三元表达式。",
    },
    fixable: "code",
    schema: [],
    messages: {
      preferAnd: "JSX 里为 null 的分支改用 &&，不要写三元表达式。",
    },
  },
  create(context) {
    const { sourceCode } = context;

    return {
      ConditionalExpression(node) {
        if (!isNullLiteral(node.alternate) || !isJsx(node.consequent)) {
          return;
        }

        context.report({
          node,
          messageId: "preferAnd",
          fix(fixer) {
            let test = sourceCode.getText(node.test);
            if (needsParensAsAndLeft(node.test)) {
              test = `(${test})`;
            }

            if (isLengthAccess(node.test)) {
              test = `${test} > 0`;
            }

            const consequent = sourceCode.getText(node.consequent);
            const right = sourceCode.getText(node).includes("\n") ? `(${consequent})` : consequent;
            return fixer.replaceText(node, `${test} && ${right}`);
          },
        });
      },
    };
  },
};

export default preferAndOverNullTernary;
