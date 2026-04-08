const { Command } = require('commander');
const { createEnvManager } = require('../index');
const { printEnvVars, printJSON, styles } = require('../utils/formatter');
const { interactiveSelectEnvVar } = require('../utils/interactive');

const listCmd = new Command('list');
listCmd
  .description('List environment variables')
  .argument('[filter]', 'Filter variables by key name')
  .action(async (filter) => {
    const options = listCmd.parent.opts();
    const interactive = options.interactive || false;
    const json = options.json || false;

    const envman = createEnvManager();

    let envVars;
    try {
      envVars = await envman.list(filter || '');
    } catch (err) {
      console.error(`${styles.error('Error:')} ${err.message}`);
      process.exit(1);
    }

    if (envVars.length === 0) {
      console.log(styles.muted('No environment variables found'));
      return;
    }

    if (json) {
      printJSON(envVars);
      return;
    }

    if (interactive) {
      const result = await interactiveSelectEnvVar(envVars);
      if (!result) return;

      if (result.action === 'edit') {
        const setCmd = require('./set');
        // Re-invoke set logic
        const setResult = await envman.set(result.key, result.value, 'shell');
        if (setResult.success) {
          console.log(styles.success(`\n  ✓ Updated ${result.key}\n`));
        } else {
          console.error(styles.error(`\n  ✗ ${setResult.message}\n`));
        }
        return;
      }

      if (result.action === 'delete') {
        const deleteCmd = require('./delete');
        const deleteResult = await envman.delete(result.key, 'shell');
        if (deleteResult.success) {
          console.log(styles.success(`\n  ✓ Deleted ${result.key}\n`));
        } else {
          console.error(styles.error(`\n  ✗ ${deleteResult.message}\n`));
        }
        return;
      }
      return;
    }

    printEnvVars(envVars, filter);
  });

module.exports = listCmd;
