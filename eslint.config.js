import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage', 'playwright-report', 'test-results'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },

  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },

  /* ───────────────────────────────────────────────────────────────────────────
     Giữ `core/` thuần.

     Đây là chỗ DUY NHẤT ràng buộc "core/ không biết mình đang chạy trong trình
     duyệt" được kiểm bằng máy. Không có block này thì ràng buộc đó chỉ là văn
     bản trong architecture.md §3 và ADR-0003 — code vẫn chạy, test vẫn xanh,
     và lần đầu ai import Phaser vào core/ thì không ai biết.
     ─────────────────────────────────────────────────────────────────────────── */
  {
    files: ['src/core/**/*.ts'],
    languageOptions: { globals: {} },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['phaser', 'phaser/*'], message: 'core/ không được biết tới Phaser — ADR-0003.' },
            { group: ['react', 'react-dom', 'react/*'], message: 'core/ không được biết tới React — ADR-0003.' },
            { group: ['../game/*', '../ui/*', '../storage/*', '../bridge/*', '**/game/**', '**/ui/**', '**/storage/**', '**/bridge/**'],
              message: 'core/ chỉ được gọi data/ — architecture.md §3.' },
          ],
        },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'window', message: 'core/ phải chạy được trong Node — ADR-0003.' },
        { name: 'document', message: 'core/ phải chạy được trong Node — ADR-0003.' },
        { name: 'localStorage', message: 'core/ không đọc/ghi lưu trữ — architecture.md §3.' },
        { name: 'sessionStorage', message: 'core/ không đọc/ghi lưu trữ — architecture.md §3.' },
        { name: 'performance', message: 'core/ không đo thời gian thật; nó đếm tick.' },
      ],
      'no-restricted-properties': [
        'error',
        {
          object: 'Math',
          property: 'random',
          message: 'Dùng RNG có seed trong state (core/rng.ts) — invariants #3. Math.random làm test cân bằng thành ngẫu nhiên và lỗi không tái tạo được.',
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "NewExpression[callee.name='Date']",
          message: 'core/ không đọc thời gian thật; nó đếm tick — invariants #4.',
        },
        {
          selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
          message: 'core/ không đọc thời gian thật; nó đếm tick — invariants #4.',
        },
      ],
    },
  },

  /* i18n: không hardcode chuỗi hiển thị ngoài src/i18n/ — NFR-I18N-01. */
  {
    files: ['src/ui/**/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'Literal[value=/[À-ỹ]/]',
          message: 'Chuỗi hiển thị phải nằm trong src/i18n/ — NFR-I18N-01.',
        },
      ],
    },
  },

  {
    files: ['tests/**/*.ts', 'e2e/**/*.ts', 'scripts/**/*.mjs', '*.config.ts', 'eslint.config.js'],
    languageOptions: { globals: { ...globals.node } },
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
);
