const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');

const execPromise = util.promisify(exec);

class WindowsEnvManager {
  constructor() {}

  async list(filter = '') {
    const envVars = [];

    for (const [key, value] of Object.entries(process.env)) {
      if (!filter || key.toLowerCase().includes(filter.toLowerCase())) {
        envVars.push({ key, value });
      }
    }

    return envVars.sort((a, b) => a.key.localeCompare(b.key));
  }

  async get(key) {
    return { key, value: process.env[key] || '' };
  }

  async set(key, value, scope = 'user') {
    if (scope === 'session') {
      process.env[key] = value;
      return { success: true, message: `Set ${key}=${value} for current session only` };
    }

    if (scope === 'user') {
      try {
        await execPromise(`setx ${key} "${value}"`);
        process.env[key] = value;
        return { success: true, message: `Set ${key} for user (new CMD windows will have it)` };
      } catch (err) {
        return { success: false, message: `Failed: ${err.message}` };
      }
    }

    if (scope === 'system') {
      try {
        await execPromise(`setx ${key} "${value}" /M`);
        process.env[key] = value;
        return { success: true, message: `Set ${key} system-wide (requires admin)` };
      } catch (err) {
        return { success: false, message: `Failed: ${err.message}` };
      }
    }

    return { success: false, message: `Unknown scope: ${scope}` };
  }

  async delete(key, scope = 'user') {
    if (scope === 'session') {
      delete process.env[key];
      return { success: true, message: `Removed ${key} from current session` };
    }

    if (scope === 'user') {
      try {
        // Use reg delete for user environment variable
        await execPromise(`reg delete HKCU\\Environment /v ${key} /f`);
        delete process.env[key];
        return { success: true, message: `Removed ${key} from user environment` };
      } catch (err) {
        // Fallback: try to unset via setx with empty value
        try {
          await execPromise(`setx ${key} ""`);
          delete process.env[key];
          return { success: true, message: `Removed ${key}` };
        } catch {
          return { success: false, message: `Failed to delete ${key}` };
        }
      }
    }

    if (scope === 'system') {
      try {
        await execPromise(`reg delete HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment /v ${key} /f`);
        delete process.env[key];
        return { success: true, message: `Removed ${key} from system environment (requires admin)` };
      } catch (err) {
        return { success: false, message: `Failed: ${err.message}` };
      }
    }

    return { success: false, message: `Unknown scope: ${scope}` };
  }

  async export(file = '.env') {
    const content = Object.entries(process.env)
      .map(([key, value]) => `${key}="${value}"`)
      .join('\r\n');
    fs.writeFileSync(file, content);
    return { success: true, message: `Exported ${Object.keys(process.env).length} variables to ${file}` };
  }

  async import(file) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split(/\r?\n/);
      let count = 0;

      for (const line of lines) {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const [, key, value] = match;
          process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
          count++;
        }
      }

      return { success: true, message: `Imported ${count} variables from ${file}` };
    } catch (err) {
      return { success: false, message: `Failed to import: ${err.message}` };
    }
  }

  getScopes() {
    return [
      { value: 'session', name: 'Session', description: 'Current CMD/PowerShell session only' },
      { value: 'user', name: 'User', description: 'User environment variables (new windows)' },
      { value: 'system', name: 'System', description: 'System-wide (requires admin)' },
    ];
  }
}

module.exports = { WindowsEnvManager };
