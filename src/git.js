import { spawnSync } from 'child_process';
import { error } from './ui.js';

export function gitCheck(...args) {
  return spawnSync('git', args, { stdio: 'pipe' }).status === 0;
}

export function gitCapture(...args) {
  const r = spawnSync('git', args, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  return r.status === 0 ? r.stdout.trim() : null;
}

export function gitExec(...args) {
  const r = spawnSync('git', args, { stdio: 'inherit' });
  if (r.status !== 0) error(`git ${args[0]} failed`);
}
