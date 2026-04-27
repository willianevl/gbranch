import chalk from 'chalk';

export const info    = (msg) => process.stderr.write(chalk.cyan(`ℹ  ${msg}\n`));
export const success = (msg) => process.stderr.write(chalk.green(`✅ ${msg}\n`));
export const warn    = (msg) => process.stderr.write(chalk.yellow(`⚠  ${msg}\n`));
export const divider = ()    => process.stderr.write(chalk.green('─────────────────────────────────────────\n'));

export function error(msg) {
  process.stderr.write(chalk.red(`❌ ${msg}\n`));
  process.exit(1);
}
