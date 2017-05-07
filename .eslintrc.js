module.exports = {
  extends: 'standard',
  plugins: ['standard', 'promise', 'jest'],
  rules: {
    'comma-dangle': [2, 'always-multiline'],
    'space-before-function-paren': [2, 'never'],
  },
  env: {
    'jest/globals': true,
  },
}
