import { spawnSync } from 'child_process';
import { gitCheck, gitCapture } from './git.js';
import { info, warn, success, error } from './ui.js';
import { confirm } from './prompt.js';

let stashCreated = false;

function restoreStash() {
  if (!stashCreated) return;
  stashCreated = false;
  info('Restoring stash...');
  const ok = spawnSync('git', ['stash', 'pop'], { stdio: 'inherit' }).status === 0;
  if (ok) success('Stash restored.');
  else warn("Could not restore stash. Run 'git stash pop' manually.");
}

process.on('exit', restoreStash);
process.on('SIGINT', () => process.exit(130));

export async function checkRepo() {
  if (!gitCheck('rev-parse', '--git-dir')) error('Not a git repository.');

  const root = gitCapture('rev-parse', '--show-toplevel');
  if (root?.startsWith('/mnt/')) {
    warn(`Repository on Windows filesystem (${root}).`);
    warn('Git is significantly slower in WSL via /mnt/. Consider moving to ~/...');
    process.stderr.write('\n');
  }

  const dirty = !gitCheck('diff', '--quiet') || !gitCheck('diff', '--cached', '--quiet');
  if (!dirty) return;

  warn('You have uncommitted changes.');
  const ok = await confirm('Stash and continue? (s/N): ');
  if (!ok) error('Operation cancelled.');

  const ts = new Date().toISOString().slice(0, 19).replace('T', '-').replace(/:/g, '');
  spawnSync('git', ['stash', 'push', '--include-untracked', '-m', `auto-stash-${ts}`], { stdio: 'inherit' });
  stashCreated = true;
  success('Stash created.');
}
