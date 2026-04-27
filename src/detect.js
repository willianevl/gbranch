import chalk from 'chalk';
import { gitCheck, gitCapture } from './git.js';
import { info, error } from './ui.js';

export function detectMain() {
  if (gitCheck('show-ref', '--verify', '--quiet', 'refs/remotes/origin/main')) return 'main';
  if (gitCheck('show-ref', '--verify', '--quiet', 'refs/remotes/origin/master')) return 'master';
  error("No 'main' or 'master' branch found on remote.");
}

export function detectDev() {
  if (gitCheck('show-ref', '--verify', '--quiet', 'refs/remotes/origin/development')) return 'development';
  if (gitCheck('show-ref', '--verify', '--quiet', 'refs/remotes/origin/develop')) return 'develop';
  return null;
}

export function resolveTypeName(type, name) {
  if (type && name) return { type, name };

  const current = gitCapture('branch', '--show-current');
  if (!current) error('Could not determine current branch.');

  const match = current.match(/^(feat|fix|hotfix|feature|bugfix)\/([^/]+)\/base/);
  if (!match) return null;

  info(`Branch auto-detected: ${chalk.cyan(`${match[1]}/${match[2]}`)}`);
  return { type: match[1], name: match[2] };
}
