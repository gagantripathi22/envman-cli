const { Command } = require('commander');
const { createEnvManager } = require('../index');
const { printEnvVar, printJSON, styles } = require('../utils/formatter');

const getCmd = new Command('get');
getCmd
  .description('Get value of an environment variable')
  .argument('<key>', 'Variable name')
  .action(async (key) => {
    const options = getCmd.parent.opts();
    const json = options.json || false;

    const envman = createEnvManager();

    let result;
    try {
      result = await envman.get(key);
    } catch (err) {
      console.error(`${styles.error('Error:')} ${err.message}`);
      process.exit(1);
    }

    if (json) {
      printJSON(result);
    } else {
      if (!result.value) {
        console.log(styles.muted(`Variable '${key}' is not set or is empty`));
      } else {
        printEnvVar(result.key, result.value);
      }
    }
  });

module.exports = getCmd;
