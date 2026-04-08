const pc = require('picocolors');
const { Select, Input } = require('enquirer');

async function interactiveSelectEnvVar(envVars) {
  if (envVars.length === 0) {
    console.log(pc.gray('No environment variables found'));
    return null;
  }

  while (true) {
    console.log(pc.dim('\n  ───────────────────────────────────────────'));
    console.log(pc.cyan('  envman') + pc.dim(' — select an environment variable'));
    console.log(pc.dim('  ───────────────────────────────────────────\n'));
    console.log(pc.dim('  ↑↓ navigate • Enter select • q quit\n'));

    const choices = envVars.map((e, i) => ({
      value: i,
      message: `  ${pc.cyan(e.key.padEnd(30))}  ${pc.dim(e.value ? e.value.substring(0, 40) : '(empty)')}`,
    }));

    const selectedPrompt = new Select({
      name: 'envvar',
      message: '',
      choices,
      initial: 0,
      showAlerts: false,
      styles: {
        selected: () => '',
        cursor: () => pc.cyan('▸ '),
      },
    });

    let selectedIndex;
    try {
      selectedIndex = await selectedPrompt.run();
    } catch (err) {
      console.log(pc.gray('\n  Cancelled\n'));
      return null;
    }

    if (selectedIndex === undefined) {
      console.log(pc.gray('\n  Cancelled\n'));
      return null;
    }

    const selected = envVars[selectedIndex];

    while (true) {
      console.log(pc.dim('\n  ───────────────────────────────────────────'));
      console.log(pc.cyan('  envman') + pc.dim(' — choose action\n'));
      console.log(`  ${pc.bold(selected.key)}`);
      console.log(`  ${pc.dim(selected.value || '(empty)')}`);
      console.log(pc.dim('  ───────────────────────────────────────────\n'));

      const actionPrompt = new Select({
        name: 'action',
        message: '',
        choices: [
          { value: 'view', message: `  ${pc.green('View')}         ${pc.dim('view full value')}` },
          { value: 'edit', message: `  ${pc.yellow('Edit')}         ${pc.dim('edit the value')}` },
          { value: 'delete', message: `  ${pc.red('Delete')}        ${pc.dim('remove this variable')}` },
          { value: 'back', message: `  ${pc.gray('Back')}          ${pc.dim('select different variable')}` },
        ],
        initial: 0,
        showAlerts: false,
        styles: {
          selected: () => '',
          cursor: () => pc.cyan('▸ '),
        },
      });

      let action;
      try {
        action = await actionPrompt.run();
      } catch (err) {
        console.log(pc.gray('\n  Cancelled\n'));
        return null;
      }

      if (action === 'back') {
        break;
      }

      if (action === 'view') {
        console.log(pc.dim('\n  ───────────────────────────────────────────'));
        console.log(pc.cyan('  envman') + pc.dim(' — full value\n'));
        console.log(`  ${pc.bold('Key:')}   ${pc.cyan(selected.key)}`);
        console.log(`  ${pc.bold('Value:')}`);
        console.log(`  ${pc.green(selected.value || '(empty)')}`);
        console.log(pc.dim('  ───────────────────────────────────────────\n'));

        const continuePrompt = new Select({
          name: 'cont',
          message: '',
          choices: [
            { value: 'back', message: `  ${pc.gray('← Back')}` },
          ],
          showAlerts: false,
          styles: {
            selected: () => '',
            cursor: () => pc.cyan('▸ '),
          },
        });
        await continuePrompt.run();
        continue;
      }

      if (action === 'edit') {
        const inputPrompt = new Input({
          name: 'value',
          message: 'Enter new value:',
          initial: selected.value || '',
        });
        const newValue = await inputPrompt.run();
        return { action: 'edit', key: selected.key, value: newValue };
      }

      if (action === 'delete') {
        return { action: 'delete', key: selected.key };
      }
    }
  }
}

async function selectScope(scopes) {
  console.log(pc.dim('\n  ───────────────────────────────────────────'));
  console.log(pc.cyan('  envman') + pc.dim(' — choose scope\n'));

  const choices = scopes.map(s => ({
    value: s.value,
    message: `  ${s.name}  ${pc.dim(s.description)}`,
  }));

  const prompt = new Select({
    name: 'scope',
    message: '',
    choices,
    initial: 0,
    showAlerts: false,
    styles: {
      selected: () => '',
      cursor: () => pc.cyan('▸ '),
    },
  });

  return await prompt.run();
}

module.exports = { interactiveSelectEnvVar, selectScope };
