// lint-staged.config.js
// Runs on staged files only — fast, production-grade pre-commit quality gate.
// Docs: https://github.com/lint-staged/lint-staged

export default {
  // TypeScript & React — lint + format
  '**/*.{ts,tsx}': [
    // ESLint: auto-fix fixable issues on staged files
    'eslint --fix --max-warnings=0',
    // Prettier: enforce consistent formatting
    'prettier --write',
  ],

  // Styles, data, docs — format only
  '**/*.{css,json,md,html}': ['prettier --write'],
};
