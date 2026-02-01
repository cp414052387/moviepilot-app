module.exports = {
  extends: ['expo', 'plugin:@typescript-eslint/recommended'],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  env: {
    jest: true,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'prettier/prettier': 'off',
    // Disable problematic rules
    'react-native/no-inline-styles': 'off',
    'import/namespace': 'off',
    'import/no-unresolved': 'off',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        moduleDirectory: ['node_modules', 'src'],
      },
    },
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/array-type': 'off',
        '@typescript-eslint/no-empty-object-type': 'off',
        '@typescript-eslint/no-wrapper-object-types': 'off',
      },
    },
  ],
};
