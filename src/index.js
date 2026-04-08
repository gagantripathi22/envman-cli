const os = require('os');

let EnvManager;

switch (os.platform()) {
  case 'darwin':
    ({ DarwinEnvManager: EnvManager } = require('./platforms/darwin'));
    break;
  case 'win32':
    ({ WindowsEnvManager: EnvManager } = require('./platforms/windows'));
    break;
  default:
    ({ LinuxEnvManager: EnvManager } = require('./platforms/linux'));
}

function createEnvManager() {
  return new EnvManager();
}

module.exports = { createEnvManager, EnvManager };
