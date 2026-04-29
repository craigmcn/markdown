import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import prettierConfig from 'eslint-config-prettier';

export default defineConfig([
  globalIgnores(['**/node_modules']),
  js.configs.recommended,
  typescriptEslint.configs['flat/eslint-recommended'],
  ...typescriptEslint.configs['flat/recommended'],
  prettierConfig,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },

    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true },
      ],
    },
  },
]);
