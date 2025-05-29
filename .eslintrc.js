module.exports = {
  extends: 'next/core-web-vitals',
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    'react/no-unknown-property': 'off',
    'jsx-a11y/alt-text': 'off'
  },
  ignorePatterns: ['node_modules/']
} 