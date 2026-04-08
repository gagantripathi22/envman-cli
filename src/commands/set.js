const { Command } = require('commander');
const pc = require('picocolors');
const { createEnvManager } = require('../index');
const { styles } = require('../utils/formatter');
const { selectScope } = require('../utils/interactive');

const setCmd = new Command('set');
setCmd
  .description('Set an environment variable')
  .argument('<key>', 'Variable name')
  .argument('[value]', 'Variable value (if not provided, will prompt)')
  .option('-s, --scope <scope>', 'Scope: shell, user, or system (interactive if not specified)')
  .action(async (key, value, options) => {
    const envman = createEnvManager();
    const scopes = envman.getScopes();

    // If no value provided, prompt for it
    if (value === undefined) {
      const { Input } = require('enquirer');
      const input = new Input({
        name: 'value',
        message: `Enter value for ${key}:`,
      });
      value = await input.run();
    }

    if (value === undefined || value === '') {
      console.log(styles.muted('No value provided. Aborted.'));
      return;
    }

    let scope = options.scope;
    if (!scope) {
      console.log(pc.dim('\n  ───────────────────────────────────────────'));
      console.log(pc.cyan('  envman') + pc.dim(` — set ${key}\n`));
      scope = await selectScope(scopes);
    }

    if (!scope || scope === 'cancel') {
      console.log(styles.muted('Aborted.'));
      return;
    }

    const result = await envman.set(key, value, scope);

    if (result.success) {
      console.log(styles.success(`\n  ✓ ${result.message}\n`));
    } else {
      console.error(styles.error(`\n  ✗ ${result.message}\n`));
      process.exit(1);
    }
  });

module.exports = setCmd;
