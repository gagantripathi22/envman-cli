const { Command } = require('commander');
const { createEnvManager } = require('../index');
const { styles } = require('../utils/formatter');

const importCmd = new Command('import');
importCmd
  .description('Import environment variables from a file')
  .argument('<file>', 'File to import (.env format)')
  .action(async (file) => {
    const envman = createEnvManager();

    const result = await envman.import(file);

    if (result.success) {
      console.log(styles.success(`\n  ✓ ${result.message}\n`));
    } else {
      console.error(styles.error(`\n  ✗ ${result.message}\n`));
      process.exit(1);
    }
  });

module.exports = importCmd;
