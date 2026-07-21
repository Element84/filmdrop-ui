module.exports = {
  root: true,
  settings: {
    react: {
      version: 'detect'
    }
  },
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'standard',
    'prettier'
  ],
  overrides: [
    {
      files: ['**/*.test.[jt]s?(x)'],
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly'
      }
    },
    {
      // TS / d.ts files: use the TypeScript parser + recommended rules.
      files: ['src/**/*.{ts,d.ts}', 'examples/**/*.{ts,d.ts}'],
      parser: '@typescript-eslint/parser',
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended']
    },
    {
      // 3) Now we enable eslint-plugin-testing-library rules or preset only for matching testing files!
      files: ['**/src/?(*.)+test.[jt]s?(x)'],
      extends: ['plugin:testing-library/react']
    },
    {
      files: ['scripts/**/*.mjs', 'scripts/**/*.js'],
      env: {
        browser: false,
        node: true,
        es2021: true
      },
      rules: {
        'no-console': 'off'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['react'],
  rules: {}
}
