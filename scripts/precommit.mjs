import chalk from 'chalk';
import { execSync } from 'child_process';

const steps = [
  { label: 'Step 1: Linting', command: 'npx lint-staged' },
  { label: 'Step 2: Type Checking', command: 'npx tsc --noEmit' },
  // { label: "Step 3: Build", command: "npm run build" },
];

console.log(chalk.cyan('\n🚀 Starting pre-commit checks'));
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

for (const step of steps) {
  console.log(`\n🔧 ${chalk.yellow(step.label)}`);
  try {
    execSync(step.command, { stdio: 'inherit' });
    console.log(chalk.green('✅ Passed!'));
  } catch {
    console.error(chalk.red(`❌ ${step.label} failed!`));
    process.exit(1);
  }
}

console.log(chalk.green("\n🎉 All checks passed! You're good to commit.\n"));
