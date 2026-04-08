const { Command } = require('commander');
const pc = require('picocolors');
const { createEnvManager } = require('../index');
const { styles } = require('../utils/formatter');
const { selectScope } = require('../utils/interactive');

const deleteCmd = new Command('delete');
deleteCmd
  .description('Delete an environment variable')
  .argument('<key>', 'Variable name')
  .option('-s, --scope <scope>', 'Scope: shell, user, or system (interactive if not specified)')
  .action(async (key, options) => {
    const envman = createEnvManager();
    const scopes = envman.getScopes();

    let scope = options.scope;
    if (!scope) {
      console.log(pc.dim('\n  ───────────────────────────────────────────'));
      console.log(pc.cyan('  envman') + pc.dim(` — delete ${key}\n`));
      scope = await selectScope(scopes);
    }

    if (!scope || scope === 'cancel') {
      console.log(styles.muted('Aborted.'));
      return;
    }

    const result = await envman.delete(key, scope);

    if (result.success) {
      console.log(styles.success(`\n  ✓ ${result.message}\n`));
    } else {
      console.error(styles.error(`\n  ✗ ${result.message}\n`));
      process.exit(1);
    }
  });

module.exports = deleteCmd;
