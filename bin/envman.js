#!/usr/bin/env node

const { Command } = require('commander');
const pc = require('picocolors');
const { Select, Input } = require('enquirer');
const { createEnvManager } = require('../src/index');
const list = require('../src/commands/list');
const get = require('../src/commands/get');
const set = require('../src/commands/set');
const del = require('../src/commands/delete');
const exp = require('../src/commands/export');
const imp = require('../src/commands/import');

// Helper function for prompts with Back option
async function selectWithBack(choices, message = '') {
  choices.push({ value: '__back__', message: `  ${pc.gray('← Back')}` });
  const prompt = new Select({
    name: 'result',
    message,
    choices,
    styles: { selected: () => '', cursor: () => pc.cyan('▸ ') },
  });
  return await prompt.run();
}

async function showInteractiveMenu() {
  const envman = createEnvManager();

  while (true) {
    console.log('');
    console.log(pc.cyan('  ╔═══════════════════════════════════════════════╗'));
    console.log(pc.cyan('  ║') + pc.bold(pc.white('                envman CLI                      ')) + pc.cyan('║'));
    console.log(pc.cyan('  ╚═══════════════════════════════════════════════╝'));
    console.log('');

    const mainMenu = new Select({
      name: 'action',
      message: pc.dim('What would you like to do?'),
      choices: [
        {
          value: 'list',
          message: `  ${pc.green('📋 List')}         ${pc.dim('View all environment variables')}`,
        },
        {
          value: 'get',
          message: `  ${pc.blue('🔍 Get')}         ${pc.dim('Get a specific variable')}`,
        },
        {
          value: 'set',
          message: `  ${pc.yellow('➕ Set')}         ${pc.dim('Set a new variable')}`,
        },
        {
          value: 'delete',
          message: `  ${pc.red('🗑 Delete')}       ${pc.dim('Delete a variable')}`,
        },
        {
          value: 'export',
          message: `  ${pc.cyan('📤 Export')}       ${pc.dim('Export to .env file')}`,
        },
        {
          value: 'import',
          message: `  ${pc.cyan('📥 Import')}       ${pc.dim('Import from .env file')}`,
        },
        {
          value: 'quit',
          message: `  ${pc.gray('❌ Quit')}`,
        },
      ],
      styles: {
        selected: () => '',
        cursor: () => pc.cyan('▸ '),
      },
    });

    const action = await mainMenu.run();

    if (action === 'quit') {
      console.log(pc.dim('\n  Goodbye!\n'));
      break;
    }

    if (action === 'list') {
      await runListInteractive(envman);
    } else if (action === 'get') {
      await runGetInteractive(envman);
    } else if (action === 'set') {
      await runSetInteractive(envman);
    } else if (action === 'delete') {
      await runDeleteInteractive(envman);
    } else if (action === 'export') {
      await runExportInteractive(envman);
    } else if (action === 'import') {
      await runImportInteractive(envman);
    }
  }
}

async function runListInteractive(envman) {
  let envVars;
  try {
    envVars = await envman.list('');
  } catch (err) {
    console.error(pc.red(`\n  ✗ Error: ${err.message}\n`));
    return;
  }

  if (envVars.length === 0) {
    console.log(pc.dim('\n  No environment variables found\n'));
    return;
  }

  while (true) {
    console.log('');
    console.log(pc.green('  ─── Select a variable to view/edit ───'));
    console.log(pc.dim('  ↑↓ navigate • Enter select • q quit\n'));

    const choices = envVars.map((e) => ({
      value: e.key,
      message: `  ${pc.cyan(e.key.padEnd(30))}  ${pc.dim(e.value ? e.value.substring(0, 40) : '(empty)')}`,
    }));

    const selectedKey = await selectWithBack(choices, '');

    if (selectedKey === '__back__') {
      return;
    }

    const selected = envVars.find((e) => e.key === selectedKey);

    // Action selection loop
    while (true) {
      console.log(pc.dim('\n  ─── Choose action ───'));

      const action = await selectWithBack([
        {
          value: 'view',
          message: `  ${pc.green('View')}         ${pc.dim('view full value')}`,
        },
        {
          value: 'edit',
          message: `  ${pc.yellow('Edit')}         ${pc.dim('edit the value')}`,
        },
        {
          value: 'delete',
          message: `  ${pc.red('Delete')}        ${pc.dim('remove this variable')}`,
        },
      ], '');

      if (action === '__back__') {
        break; // Go back to variable selection
      }

      if (action === 'view') {
        console.log('');
        console.log(pc.green('  ─── Full Value ───'));
        console.log(`  ${pc.bold('Key:')}   ${pc.cyan(selected.key)}`);
        console.log(`  ${pc.bold('Value:')}`);
        console.log(`  ${pc.green(selected.value || '(empty)')}`);
        console.log('');

        await selectWithBack([], '');
      } else if (action === 'edit') {
        const newValue = await new Input({
          name: 'value',
          message: `${pc.cyan('New value:')}`,
          initial: selected.value || '',
        }).run();

        if (newValue === undefined) {
          continue; // User pressed escape, show actions again
        }

        const confirm = await selectWithBack([
          { value: 'yes', message: `  ${pc.green('✓ Confirm')}      ${pc.dim('save changes')}` },
          { value: 'no', message: `  ${pc.gray('✗ Cancel')}      ${pc.dim('discard changes')}` },
        ], '');

        if (confirm === '__back__') {
          continue;
        }

        if (confirm === 'yes') {
          process.env[selected.key] = newValue;
          console.log(pc.green(`\n  ✓ Updated ${selected.key}\n`));
        }
      } else if (action === 'delete') {
        const confirm = await selectWithBack([
          { value: 'yes', message: `  ${pc.red('✓ Delete')}      ${pc.dim('remove permanently')}` },
          { value: 'no', message: `  ${pc.gray('✗ Cancel')}      ${pc.dim('keep variable')}` },
        ], pc.dim(`Delete ${pc.red(selected.key)}?`));

        if (confirm === '__back__') {
          continue;
        }

        if (confirm === 'yes') {
          delete process.env[selected.key];
          console.log(pc.green(`\n  ✓ Deleted ${selected.key}\n`));
          envVars = await envman.list('');
        }
      }
    }
  }
}

async function runGetInteractive(envman) {
  while (true) {
    const key = await new Input({
      name: 'key',
      message: `${pc.cyan('Variable name:')}`,
    }).run();

    if (key === undefined) {
      return; // User pressed escape
    }

    if (!key) {
      const result = await selectWithBack([], pc.yellow('  ⚠ No variable name entered'));
      if (result === '__back__') return;
      continue;
    }

    const result = await envman.get(key);

    console.log('');
    if (result.value) {
      console.log(pc.green('  ─── Result ───'));
      console.log(`  ${pc.bold('Key:')}   ${pc.cyan(result.key)}`);
      console.log(`  ${pc.bold('Value:')} ${pc.green(result.value)}`);
    } else {
      console.log(pc.yellow(`\n  ⚠ Variable '${key}' is not set\n`));
    }
    console.log('');

    const cont = await selectWithBack([], '');
    if (cont === '__back__') {
      return;
    }
  }
}

async function runSetInteractive(envman) {
  while (true) {
    const key = await new Input({
      name: 'key',
      message: `${pc.cyan('Variable name:')}`,
    }).run();

    if (key === undefined) {
      return; // User pressed escape
    }

    if (!key) {
      const result = await selectWithBack([], pc.yellow('  ⚠ No variable name entered'));
      if (result === '__back__') return;
      continue;
    }

    const value = await new Input({
      name: 'value',
      message: `${pc.cyan('Variable value:')}`,
    }).run();

    if (value === undefined) {
      continue; // User pressed escape, ask again
    }

    const scopes = envman.getScopes();
    const scopeChoices = scopes.map((s) => ({
      value: s.value,
      message: `  ${pc.green(s.name)}  ${pc.dim(s.description)}`,
    }));

    console.log(pc.dim('\n  ─── Choose scope ───'));

    const scope = await selectWithBack(scopeChoices, '');

    if (scope === '__back__') {
      continue;
    }

    const setResult = await envman.set(key, value, scope);

    if (setResult.success) {
      console.log(pc.green(`\n  ✓ ${setResult.message}\n`));
    } else {
      console.error(pc.red(`\n  ✗ ${setResult.message}\n`));
    }

    const cont = await selectWithBack([], '');
    if (cont === '__back__') {
      return;
    }
  }
}

async function runDeleteInteractive(envman) {
  let envVars;
  try {
    envVars = await envman.list('');
  } catch (err) {
    console.error(pc.red(`\n  ✗ Error: ${err.message}\n`));
    return;
  }

  while (true) {
    const choices = envVars.map((e) => ({
      value: e.key,
      message: `  ${pc.red(e.key.padEnd(30))}  ${pc.dim(e.value ? e.value.substring(0, 40) : '(empty)')}`,
    }));

    console.log(pc.dim('\n  ─── Select variable to delete ───\n'));

    const selectedKey = await selectWithBack(choices, '');

    if (selectedKey === '__back__') {
      return;
    }

    const scopes = envman.getScopes();
    const scopeChoices = scopes.map((s) => ({
      value: s.value,
      message: `  ${pc.green(s.name)}  ${pc.dim(s.description)}`,
    }));

    console.log(pc.dim('\n  ─── Choose scope to delete from ───\n'));

    const scope = await selectWithBack(scopeChoices, '');

    if (scope === '__back__') {
      continue;
    }

    const deleteResult = await envman.delete(selectedKey, scope);

    if (deleteResult.success) {
      console.log(pc.green(`\n  ✓ ${deleteResult.message}\n`));
    } else {
      console.error(pc.red(`\n  ✗ ${deleteResult.message}\n`));
    }

    const cont = await selectWithBack([], '');
    if (cont === '__back__') {
      return;
    }
  }
}

async function runExportInteractive(envman) {
  while (true) {
    const file = await new Input({
      name: 'file',
      message: `${pc.cyan('Export file:')}`,
      initial: '.env',
    }).run();

    if (file === undefined) {
      return; // User pressed escape
    }

    const result = await envman.export(file);

    if (result.success) {
      console.log(pc.green(`\n  ✓ ${result.message}\n`));
    } else {
      console.error(pc.red(`\n  ✗ ${result.message}\n`));
    }

    const cont = await selectWithBack([], '');
    if (cont === '__back__') {
      return;
    }
  }
}

async function runImportInteractive(envman) {
  while (true) {
    const file = await new Input({
      name: 'file',
      message: `${pc.cyan('Import file:')}`,
      initial: '.env',
    }).run();

    if (file === undefined) {
      return; // User pressed escape
    }

    const result = await envman.import(file);

    if (result.success) {
      console.log(pc.green(`\n  ✓ ${result.message}\n`));
    } else {
      console.error(pc.red(`\n  ✗ ${result.message}\n`));
    }

    const cont = await selectWithBack([], '');
    if (cont === '__back__') {
      return;
    }
  }
}

const program = new Command();

program
  .name('envman')
  .version('1.0.0')
  .description(`${pc.cyan('envman')} ${pc.dim('—')} Manage environment variables\n${pc.dim('Works on Linux, macOS, and Windows')}`)
  .option('-i, --interactive', 'Force interactive mode')
  .option('--json', 'Output as JSON');

program.addCommand(list);
program.addCommand(get);
program.addCommand(set);
program.addCommand(del);
program.addCommand(exp);
program.addCommand(imp);

// Check if no arguments provided - run interactive mode
if (process.argv.length === 2) {
  showInteractiveMenu().catch((err) => {
    console.error(pc.red(`\n  ✗ Error: ${err.message}\n`));
    process.exit(1);
  });
} else {
  program.parse(process.argv);
}
