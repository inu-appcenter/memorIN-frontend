const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');
const i18next = require('eslint-plugin-i18next');
const i18nJson = require('eslint-plugin-i18n-json');
const i18nLocalRules = require('./tools/i18n-local-rules');

// expo lint는 내부적으로 --cache를 붙여 실행하는데, ESLint가 캐시 키를 만들려고
// 설정을 직렬화할 때 processor에 meta가 없으면 죽는다. 플러그인이 제공하는
// processor에는 meta가 없어서 여기서 감싸준다.
const jsonProcessor = {
  meta: { name: 'i18n-json/.json', version: '4.0.1' },
  ...i18nJson.processors['.json'],
};

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*', '.expo/*'],
  },
  {
    files: ['src/shared/api/client.ts', 'src/shared/lib/i18n.ts'],
    rules: {
      'import/no-named-as-default-member': 'off',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { i18next, 'i18n-local': i18nLocalRules },
    rules: {
      // words.exclude가 "한글이 한 글자도 없는 문자열"을 통째로 건너뛰게 한다.
      // 덕분에 className / testID / variant / API 경로 / 스타일 값 같은
      // 비-텍스트 리터럴은 오탐 없이 통과하고, 한국어만 정확히 걸린다.
      'i18next/no-literal-string': [
        'error',
        { mode: 'all', words: { exclude: ['[^가-힣]*'] } },
      ],
      'i18n-local/no-hardcoded-message-arg': 'error',
    },
  },
  {
    // ko/en 리소스의 키 집합이 어긋나면 잡는다.
    // (tsc만으로는 부족 — ko가 타입 원본이라 en에서 키가 빠져도 통과한다)
    files: ['src/shared/locales/**/*.json'],
    plugins: { 'i18n-json': i18nJson },
    processor: jsonProcessor,
    rules: {
      'i18n-json/identical-keys': [
        'error',
        { filePath: require.resolve('./src/shared/locales/ko/common.json') },
      ],
    },
  },
]);
