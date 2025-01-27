const globals = require('globals');
const js = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');

module.exports = {
  files: ['**/*.{js,jsx,ts,tsx}'],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      ecmaFeatures: {
        jsx: true
      },
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    globals: {
      ...globals.browser,
      ...globals.es2020
    }
  },
  plugins: {
    '@typescript-eslint': tseslint,
    'react': reactPlugin,
    'react-hooks': reactHooksPlugin
  },
  rules: {
    ...js.configs.recommended.rules,
    ...tseslint.configs['recommended'].rules,
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': ['warn', {
      allowShortCircuit: true,
      allowTernary: true
    }]
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
