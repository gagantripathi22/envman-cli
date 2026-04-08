#!/usr/bin/env node

const { Command } = require('commander');
const pc = require('picocolors');
const list = require('../src/commands/list');
const get = require('../src/commands/get');
const set = require('../src/commands/set');
const del = require('../src/commands/delete');
const exp = require('../src/commands/export');
const imp = require('../src/commands/import');

const program = new Command();

program
  .name('envman')
  .version('1.0.0')
  .description(`${pc.cyan('envman')} ${pc.dim('—')} Manage environment variables easily\n${pc.dim('Works on Linux, macOS, and Windows')}`)
  .option('-i, --interactive', 'Interactive mode with arrow keys')
  .option('--json', 'Output as JSON');

program.addCommand(list);
program.addCommand(get);
program.addCommand(set);
program.addCommand(del);
program.addCommand(exp);
program.addCommand(imp);

program.parse(process.argv);
