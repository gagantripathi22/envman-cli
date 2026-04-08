const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const os = require('os');
const path = require('path');

const execPromise = util.promisify(exec);

class LinuxEnvManager {
  constructor() {
    this.homeDir = os.homedir();
    this.shell = process.env.SHELL || 'bash';
    this.shellName = path.basename(this.shell);
    this.profileFile = this.shellName.includes('zsh')
      ? path.join(this.homeDir, '.zshrc')
      : path.join(this.homeDir, '.bashrc');
  }

  async list(filter = '') {
    const envVars = [];
    const env = process.env;

    for (const [key, value] of Object.entries(env)) {
      if (!filter || key.toLowerCase().includes(filter.toLowerCase())) {
        envVars.push({ key, value });
      }
    }

    return envVars.sort((a, b) => a.key.localeCompare(b.key));
  }

  async get(key) {
    return { key, value: process.env[key] || '' };
  }

  async set(key, value, scope = 'shell') {
    if (scope === 'shell') {
      process.env[key] = value;
      return { success: true, message: `Set ${key}=${value} for current shell only` };
    }

    if (scope === 'user') {
      const exportLine = `export ${key}="${value}"\n`;
      fs.appendFileSync(this.profileFile, exportLine);
      process.env[key] = value;
      return { success: true, message: `Added to ${this.profileFile}. Run 'source ${this.profileFile}' to apply.` };
    }

    if (scope === 'system') {
      const systemFile = '/etc/environment';
      try {
        const exportLine = `${key}="${value}"\n`;
        fs.appendFileSync(systemFile, exportLine);
        process.env[key] = value;
        return { success: true, message: `Added to ${systemFile}` };
      } catch (err) {
        return { success: false, message: `Failed to write to ${systemFile}. Try running with sudo.` };
      }
    }

    return { success: false, message: `Unknown scope: ${scope}` };
  }

  async delete(key, scope = 'user') {
    if (scope === 'shell') {
      delete process.env[key];
      return { success: true, message: `Removed ${key} from current shell` };
    }

    if (scope === 'user') {
      try {
        let content = fs.readFileSync(this.profileFile, 'utf8');
        const regex = new RegExp(`export\\s+${key}=.*\\n`, 'g');
        content = content.replace(regex, '');
        fs.writeFileSync(this.profileFile, content);
        delete process.env[key];
        return { success: true, message: `Removed from ${this.profileFile}. Run 'source ${this.profileFile}' to apply.` };
      } catch (err) {
        return { success: false, message: `Failed to update ${this.profileFile}` };
      }
    }

    if (scope === 'system') {
      const systemFile = '/etc/environment';
      try {
        let content = fs.readFileSync(systemFile, 'utf8');
        const regex = new RegExp(`${key}=.*\\n`, 'g');
        content = content.replace(regex, '');
        fs.writeFileSync(systemFile, content);
        delete process.env[key];
        return { success: true, message: `Removed from ${systemFile}` };
      } catch (err) {
        return { success: false, message: `Failed to update ${systemFile}. Try running with sudo.` };
      }
    }

    return { success: false, message: `Unknown scope: ${scope}` };
  }

  async export(file = '.env') {
    const content = Object.entries(process.env)
      .map(([key, value]) => `${key}="${value}"`)
      .join('\n');
    fs.writeFileSync(file, content);
    return { success: true, message: `Exported ${Object.keys(process.env).length} variables to ${file}` };
  }

  async import(file) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
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
      { value: 'shell', name: 'Shell', description: 'Current shell session only' },
      { value: 'user', name: 'User', description: `~/.${this.shellName}rc` },
      { value: 'system', name: 'System', description: '/etc/environment (requires sudo)' },
    ];
  }
}

module.exports = { LinuxEnvManager };
