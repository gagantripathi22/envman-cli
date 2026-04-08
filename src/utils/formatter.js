const pc = require('picocolors');

const styles = {
  title: (t) => pc.cyan(pc.bold(t)),
  header: (t) => pc.dim(pc.white(t)),
  success: (t) => pc.green(t),
  error: (t) => pc.red(t),
  warning: (t) => pc.yellow(t),
  info: (t) => pc.blue(t),
  muted: (t) => pc.gray(t),
  bold: (t) => pc.bold(t),
  key: (t) => pc.cyan(t),
  value: (t) => pc.green(t),
};

function printEnvVars(envVars, filter = '') {
  if (envVars.length === 0) {
    console.log(styles.muted('No environment variables found'));
    return;
  }

  console.log('');
  console.log(`  ${styles.header('KEY')}                                           ${styles.header('VALUE')}`);
  console.log(pc.dim('  ' + '─'.repeat(70)));

  for (const { key, value } of envVars) {
    const displayKey = styles.key(key.padEnd(50));
    const displayValue = value ? styles.value(value.substring(0, 60)) : styles.muted('(empty)');
    console.log(`  ${displayKey}  ${displayValue}`);
  }
  console.log('');
}

function printEnvVar(key, value) {
  console.log('');
  console.log(`  ${styles.bold('Key:')}   ${styles.key(key)}`);
  console.log(`  ${styles.bold('Value:')} ${styles.value(value || '(empty)')}`);
  console.log('');
}

function printJSON(data) {
  console.log(JSON.stringify(data, null, 2));
}

module.exports = { styles, printEnvVars, printEnvVar, printJSON };
