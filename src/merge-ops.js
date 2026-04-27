import { spawnSync } from 'child_process';
import { gitCheck, gitExec } from './git.js';
import { info, success, warn, error } from './ui.js';
import { waitEnter } from './prompt.js';

export function hasConflict(source, target) {
  const r = spawnSync('git', ['merge-tree', '--write-tree', `origin/${source}`, `origin/${target}`], { stdio: 'pipe' });
  return r.status !== 0;
}

async function waitConflictResolution() {
  process.stderr.write('\n');
  warn('Conflicts detected in the following files:');
  const r = spawnSync('git', ['diff', '--name-only', '--diff-filter=U'], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  r.stdout.trim().split('\n').filter(Boolean).forEach(f => process.stderr.write(`     ❌ ${f}\n`));
  process.stderr.write('\n  Resolve conflicts, save the files and press ENTER to continue.\n');
  process.stderr.write('  To cancel, press Ctrl+C.\n\n');
  await waitEnter('  Press ENTER when ready... ');

  const still = spawnSync('git', ['diff', '--name-only', '--diff-filter=U'], { encoding: 'utf8', stdio: 'pipe' });
  if (still.stdout.trim()) error('There are still unresolved conflicts.');
}

export async function safeMerge(sourceBranch, commitMessage) {
  const r = spawnSync('git', ['merge', `origin/${sourceBranch}`, '--no-ff', '-m', commitMessage], { stdio: 'inherit' });
  if (r.status !== 0) {
    await waitConflictResolution();
    spawnSync('git', ['add', '.'], { stdio: 'inherit' });
    spawnSync('git', ['merge', '--continue', '--no-edit'], { stdio: 'inherit' });
  }
}

export async function createMergeBranch(base, target, mergeBranch) {
  if (gitCheck('show-ref', '--verify', '--quiet', `refs/remotes/origin/${mergeBranch}`) ||
      gitCheck('show-ref', '--verify', '--quiet', `refs/heads/${mergeBranch}`)) {
    info(`${mergeBranch} already exists. Use 'sync' to update it.`);
    return;
  }

  info(`Creating ${mergeBranch} from ${target}...`);
  gitExec('checkout', `origin/${target}`, '-b', mergeBranch);
  gitExec('push', '-u', 'origin', mergeBranch);

  info(`Merging ${base} into ${mergeBranch}...`);
  await safeMerge(base, `merge: ${base} into ${mergeBranch}`);
  gitExec('push', 'origin', mergeBranch);
  success(`Merge complete: ${mergeBranch}`);
}

export async function checkAndCreateMerge(base, targetEnv, mergeBranch) {
  if (!gitCheck('show-ref', '--verify', '--quiet', `refs/remotes/origin/${targetEnv}`)) {
    warn(`Branch '${targetEnv}' not found on remote. Skipping.`);
    return;
  }

  if (hasConflict(base, targetEnv)) {
    warn(`Conflict detected with ${targetEnv}!`);
    await createMergeBranch(base, targetEnv, mergeBranch);
  } else {
    success(`No conflicts with ${targetEnv}. Merge branch not needed.`);
  }
}

export async function syncMergeBranch(base, mergeBranch) {
  if (!gitCheck('show-ref', '--verify', '--quiet', `refs/remotes/origin/${mergeBranch}`)) {
    info(`Branch ${mergeBranch} does not exist. Skipping.`);
    return;
  }

  info(`Found: ${mergeBranch}. Syncing...`);
  gitExec('checkout', mergeBranch);
  gitExec('pull', 'origin', mergeBranch);
  await safeMerge(base, `merge: sync ${base} into ${mergeBranch}`);
  gitExec('push', 'origin', mergeBranch);
  success(`Synced: ${mergeBranch}`);
}
