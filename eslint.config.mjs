import * as tseslint from 'typescript-eslint';
import * as tsParser from '@typescript-eslint/parser';

export default tseslint.config(
  {
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2021,
      sourceType: "module",
      parserOptions: {
        lib: ["ES2021"],
        projectService: true,
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "no-unused-vars": "off",
      "no-console": "warn",
      "no-debugger": "error",
      "no-duplicate-imports": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-member-accessibility": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "semi": ["error", "always"],
      "quotes": ["error", "single"],
      "comma-dangle": ["error", "always-multiline"],
      "eol-last": "error",
      "no-trailing-spaces": "error",
      "prefer-const": "error",
      "no-var": "error",
      "curly": ["error", "all"],
      "eqeqeq": ["error", "always"],
    },
  },
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "*.js",
      "*.d.ts",
    ]
  }
);