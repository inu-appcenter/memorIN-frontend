const WATCHED_CALLS = {
  Alert: ['alert'],
  toast: ['success', 'error'],
};

// Alert.alert(), toast.success/error()의 인자에 들어간 하드코딩 문자열을 잡는다.
// i18next/no-literal-string은 템플릿 리터럴 검사를 켜면 `/api/posts/${id}` 같은
// URL까지 오탐하기 때문에 꺼둔다. 대신 메시지성 함수에 한해 이 룰이 템플릿
// 리터럴까지 검사한다.
module.exports = {
  rules: {
    'no-hardcoded-message-arg': {
      meta: {
        type: 'problem',
        docs: { description: 'Alert/toast 인자에 하드코딩된 문자열 금지' },
        schema: [],
        messages: {
          hardcoded: 'i18n 번역 키(t 함수)를 사용해야 합니다.',
        },
      },
      create(context) {
        return {
          CallExpression(node) {
            const { callee } = node;
            if (callee.type !== 'MemberExpression') return;
            if (callee.object.type !== 'Identifier') return;
            if (callee.property.type !== 'Identifier') return;

            const methods = WATCHED_CALLS[callee.object.name];
            if (!methods || !methods.includes(callee.property.name)) return;

            node.arguments.forEach((arg) => {
              if (arg.type === 'Literal' && typeof arg.value === 'string') {
                context.report({ node: arg, messageId: 'hardcoded' });
              }
              if (
                arg.type === 'TemplateLiteral' &&
                arg.quasis.some((quasi) => quasi.value.raw.trim())
              ) {
                context.report({ node: arg, messageId: 'hardcoded' });
              }
            });
          },
        };
      },
    },
  },
};
