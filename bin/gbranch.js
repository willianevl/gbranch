#!/usr/bin/env node
import { program } from 'commander';
import { createRequire } from 'module';
import { cmdCreate } from '../src/commands/create.js';
import { cmdMerge } from '../src/commands/merge.js';
import { cmdSync } from '../src/commands/sync.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

program
  .name('gbranch')
  .description('Git branch manager with conflict detection and merge branch automation')
  .version(version);

program
  .command('create <type> <name>')
  .description('Create a new base branch from main/master')
  .action(cmdCreate);

program
  .command('merge [type] [name]')
  .description('Create merge branches for dev/staging environments (auto-detects current branch)')
  .action(cmdMerge);

program
  .command('sync [type] [name]')
  .description('Sync existing merge branches with the base (auto-detects current branch)')
  .action(cmdSync);

await program.parseAsync();
