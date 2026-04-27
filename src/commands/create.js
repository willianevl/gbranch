import chalk from 'chalk';
import { detectMain } from '../detect.js';
import { checkRepo } from '../repo.js';
import { gitExec, gitCheck } from '../git.js';
import { info, success, error, divider } from '../ui.js';

const VALID_TYPES = new Set(['feat', 'fix', 'hotfix', 'feature', 'bugfix']);

export async function cmdCreate(type, name) {
  if (!VALID_TYPES.has(type)) error(`Invalid type: '${type}'. Use: feat, fix, hotfix, feature, bugfix`);

  const base = `${type}/${name}/base`;
  const mainBranch = detectMain();

  await checkRepo();

  info(`Main branch detected: ${mainBranch}`);
  process.stderr.write('\n');

  info(`Updating ${mainBranch}...`);
  gitExec('fetch', '--prune', 'origin');
  gitExec('checkout', mainBranch);
  gitExec('pull', 'origin', mainBranch);

  if (gitCheck('show-ref', '--verify', '--quiet', `refs/heads/${base}`)) {
    error(`Branch '${base}' already exists.`);
  }

  info(`Creating ${base}...`);
  gitExec('checkout', '-b', base);
  gitExec('push', '-u', 'origin', base);

  process.stderr.write('\n');
  divider();
  success(`Done! You are on: ${chalk.cyan(base)}`);
  divider();
}
