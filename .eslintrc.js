module.exports = {
  settings: {
    react: {
      version: 'detect'
    }
  },
  env: {
    browser: true,
    es2021: true,
    jest: true
  },
  extends: ['plugin:react/recommended', 'standard', 'prettier'],
  overrides: [
    {
      // 3) Now we enable eslint-plugin-testing-library rules or preset only for matching testing files!
      files: ['**/src/?(*.)+test.[jt]s?(x)'],
      extends: ['plugin:testing-library/react']
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['react'],
  rules: {}
}
