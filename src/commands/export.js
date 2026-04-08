const { Command } = require('commander');
const { createEnvManager } = require('../index');
const { styles } = require('../utils/formatter');

const exportCmd = new Command('export');
exportCmd
  .description('Export environment variables to a file')
  .argument('[file]', 'Output file (default: .env)')
  .action(async (file) => {
    const outputFile = file || '.env';
    const envman = createEnvManager();

    const result = await envman.export(outputFile);

    if (result.success) {
      console.log(styles.success(`\n  ✓ ${result.message}\n`));
    } else {
      console.error(styles.error(`\n  ✗ ${result.message}\n`));
      process.exit(1);
    }
  });

module.exports = exportCmd;
