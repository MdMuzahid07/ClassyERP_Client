/**
 * precommit.mjs
 * Production-grade pre-commit runner.
 *
 * Philosophy (2026 best practice):
 *  - Pre-commit must be FAST (<10s) — only lint & format STAGED files
 *  - TypeScript type-checking (tsc --noEmit) belongs in CI/CD, not pre-commit
 *  - Use --no-verify for emergency commits: git commit --no-verify
 */

import chalk from 'chalk';
import { execSync } from 'child_process';

// ─── Helpers ────────────────────────────────────────────────────────────────

const DIVIDER = chalk.dim('─'.repeat(50));

function run(label, command) {
  const start = performance.now();
  process.stdout.write(`\n${chalk.bold.cyan('▶')} ${chalk.bold(label)}\n`);

  try {
    execSync(command, { stdio: 'inherit' });
    const ms = Math.round(performance.now() - start);
    console.log(`${chalk.green('✔')} ${chalk.dim(`passed in ${ms}ms`)}`);
  } catch {
    const ms = Math.round(performance.now() - start);
    console.error(`${chalk.red('✖')} ${chalk.red.bold(`${label} failed`)} ${chalk.dim(`(${ms}ms)`)}`);
    console.error(chalk.dim('  Tip: fix the issues above, or use git commit --no-verify to bypass'));
    process.exit(1);
  }
}

// ─── Pre-commit Pipeline ─────────────────────────────────────────────────────

const totalStart = performance.now();

console.log(`\n${chalk.bold.blue('🔍 Pre-commit checks')}`);
console.log(DIVIDER);
console.log(chalk.dim('  Only staged files will be checked (via lint-staged)'));

// Step 1: Lint + Format staged files only
run('Lint & Format (lint-staged)', 'npx lint-staged');

// ─── Done ────────────────────────────────────────────────────────────────────

const totalMs = Math.round(performance.now() - totalStart);
console.log(`\n${DIVIDER}`);
console.log(`${chalk.bold.green('✅ All checks passed!')} ${chalk.dim(`(${totalMs}ms total)`)}`);
console.log(chalk.dim('  Proceeding with commit...\n'));
