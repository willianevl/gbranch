import chalk from 'chalk';
import { resolveTypeName, detectDev } from '../detect.js';
import { checkRepo } from '../repo.js';
import { gitExec, gitCheck } from '../git.js';
import { warn, error, divider, success } from '../ui.js';
import { checkAndCreateMerge } from '../merge-ops.js';

const VALID_TYPES = new Set(['feat', 'fix', 'hotfix', 'feature', 'bugfix']);

export async function cmdMerge(type, name) {
  const resolved = resolveTypeName(type, name);
  if (!resolved) error('Usage: gbranch merge [type] [name]  (or run from within a <type>/<name>/base branch)');

  const { type: t, name: n } = resolved;
  if (!VALID_TYPES.has(t)) error(`Invalid type: '${t}'.`);

  const base = `${t}/${n}/base`;

  await checkRepo();
  gitExec('fetch', '--prune', 'origin');

  if (!gitCheck('show-ref', '--verify', '--quiet', `refs/remotes/origin/${base}`)) {
    error(`Branch '${base}' not found on remote.`);
  }

  process.stderr.write('\n');
  process.stderr.write(chalk.cyan('── Checking conflicts ────────────────────\n'));

  const devBranch = detectDev();
  if (devBranch) {
    await checkAndCreateMerge(base, devBranch, `${t}/${n}/base-merge-${devBranch}`);
  } else {
    warn("No 'development' or 'develop' branch found on remote. Skipping.");
  }
  await checkAndCreateMerge(base, 'staging', `${t}/${n}/base-merge-staging`);

  gitExec('checkout', base);

  process.stderr.write('\n');
  divider();
  success(`Merge complete! You are on: ${chalk.cyan(base)}`);
  divider();
}
