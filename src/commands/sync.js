import chalk from 'chalk';
import { resolveTypeName, detectDev } from '../detect.js';
import { checkRepo } from '../repo.js';
import { gitExec } from '../git.js';
import { info, success, error, divider } from '../ui.js';
import { syncMergeBranch } from '../merge-ops.js';

const VALID_TYPES = new Set(['feat', 'fix', 'hotfix', 'feature', 'bugfix']);

export async function cmdSync(type, name) {
  const resolved = resolveTypeName(type, name);
  if (!resolved) error('Usage: gbranch sync [type] [name]  (or run from within a <type>/<name>/base branch)');

  const { type: t, name: n } = resolved;
  if (!VALID_TYPES.has(t)) error(`Invalid type: '${t}'.`);

  const base = `${t}/${n}/base`;

  await checkRepo();

  info(`Updating ${base}...`);
  gitExec('fetch', '--prune', 'origin');
  gitExec('checkout', base);
  gitExec('pull', 'origin', base);
  gitExec('push', 'origin', base);
  success('Base updated.');

  process.stderr.write('\n');
  process.stderr.write(chalk.cyan('── Syncing merge branches ───────────────\n'));

  const devBranch = detectDev();
  if (devBranch) {
    await syncMergeBranch(base, `${t}/${n}/base-merge-${devBranch}`);
  }
  await syncMergeBranch(base, `${t}/${n}/base-merge-staging`);

  gitExec('checkout', base);

  process.stderr.write('\n');
  divider();
  success(`Sync complete! You are on: ${chalk.cyan(base)}`);
  divider();
}
