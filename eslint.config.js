// eslint.config.js
// Production-grade ESLint Flat Config for React + Vite + TypeScript (July 2026)
//
// Rule philosophy:
//  - Type-aware linting (recommended-type-checked + stylistic-type-checked)
//    catches bugs at lint time that TypeScript compiler alone misses
//  - No formatting rules — Prettier owns formatting, ESLint owns code quality
//  - Strict but pragmatic: warnings on things teams grow into, errors on critical issues

import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig([
  // ─── Global Ignores ────────────────────────────────────────────────────────
  globalIgnores([
    'dist',
    'dist-ssr',
    'node_modules',
    'coverage',
    'build',
    '*.config.js',       // Exclude vite.config, lint-staged.config, etc.
    '*.config.ts',
    'scripts/**',        // Exclude pre-commit node scripts
    'public/**',
  ]),

  // ─── Base JS Rules ────────────────────────────────────────────────────────
  js.configs.recommended,

  // ─── TypeScript: Type-Aware Linting ───────────────────────────────────────
  // recommended-type-checked catches runtime bugs (floating promises, unsafe casts)
  // stylistic-type-checked enforces consistent TypeScript idioms
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // ─── Main Source Rules ────────────────────────────────────────────────────
  {
    files: ['**/*.{ts,tsx}'],

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2023,
      },
      parserOptions: {
        // projectService: modern, fast type-aware linting (replaces project: tsconfig path)
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },

    extends: [
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    rules: {
      // ── TypeScript ────────────────────────────────────────────────────────

      // Disallow explicit `any` — warn (not error) to avoid blocking early dev
      '@typescript-eslint/no-explicit-any': 'warn',

      // Enforce `import type` for type-only imports (smaller bundles, clearer intent)
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      // Enforce `export type` for type-only exports
      '@typescript-eslint/consistent-type-exports': [
        'error',
        { fixMixedExportsWithInlineTypeSpecifier: true },
      ],

      // Disallow floating promises — critical for async safety
      '@typescript-eslint/no-floating-promises': 'error',

      // Enforce awaiting of thenable values
      '@typescript-eslint/await-thenable': 'error',

      // Disallow unnecessary type assertions (`x as string` when x is already string)
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',

      // Disallow non-null assertions `!` — use proper null checks instead
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // Unused vars: allow underscore-prefixed params (_event, _props etc.)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // Prefer nullish coalescing `??` over `||` for nullable values
      '@typescript-eslint/prefer-nullish-coalescing': [
        'error',
        { ignorePrimitives: { boolean: true } },
      ],

      // Prefer optional chaining `?.` over `&&` chains
      '@typescript-eslint/prefer-optional-chain': 'error',

      // No misused promises (e.g., passing async fn to onClick without handling)
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } }, // Allow async event handlers in JSX
      ],

      // ── General Code Quality ──────────────────────────────────────────────

      // No console.log in production (use console.warn/error only)
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],

      // Disallow debugger statements
      'no-debugger': 'error',

      // Disallow duplicate imports
      'no-duplicate-imports': 'error',

      // Prefer const over let when variable is never reassigned
      'prefer-const': 'error',

      // ── React / React Hooks ────────────────────────────────────────────────

      // react-hooks/rules-of-hooks and react-hooks/exhaustive-deps
      // come from reactHooks.configs.flat.recommended (already applied above)

      // react-refresh — already applied via reactRefresh.configs.vite
    },
  },

  // ─── Prettier Integration (must be last — disables conflicting rules) ─────
  eslintConfigPrettier,
]);
