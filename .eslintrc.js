module.exports = {
  root: true,
  ignorePatterns: ['src/api/generated.ts'],
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended'
  ],
  parserOptions: {
    parser: '@typescript-eslint/parser'
  },
  overrides: [
    { files: ['*.ts', '*.vue'], rules: { 'no-undef': 'off' } }
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    "no-unused-vars": "off",
  }
}
