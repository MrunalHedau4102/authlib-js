import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['src/**/*.ts'],
    ignores: ['node_modules', 'dist', '**/*.test.ts', 'coverage', 'src/**/*.test.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: '2020',
        sourceType: 'module',
        tsconfigRootDir: process.cwd(),
        project: ['./tsconfig.json']
      },
      globals: {
        console: 'readonly',
        process: 'readonly'
      }
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'off'
    }
  },
  {
    files: ['src/**/*.ts'],
    ignores: ['src/**/*.test.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: '2020',
        sourceType: 'module'
      }
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': 'off'
    }
  }
];
