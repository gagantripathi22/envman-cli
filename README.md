# envman

> Simple CLI tool to manage environment variables. Works on Linux, macOS, and Windows.

## Why?

Setting environment variables across different operating systems is confusing:
- **macOS**: Need to use `launchctl` for GUI apps, `export` for shell
- **Linux**: Different files for shell vs system-wide
- **Windows**: Registry, `setx`, session vs permanent

This tool gives you one simple interface to manage env vars on any OS.

## Install

**Install globally with npm:**
```bash
npm install -g envman-cli
```

**Or use without installing:**
```bash
npx envman-cli list
```

## Usage

```bash
# List all environment variables
envman list

# Filter by key name
envman list PATH

# Get a specific variable
envman get HOME

# Set a variable (interactive scope selection)
envman set MY_VAR my_value

# Set with specific scope
envman set MY_VAR my_value --scope user

# Delete a variable
envman delete MY_VAR

# Export to .env file
envman export

# Import from .env file
envman import .env
```

## Scope Options

**Linux:**
- `shell` - Current shell session only
- `user` - Your shell profile (~/.bashrc or ~/.zshrc)
- `system` - System-wide (/etc/environment, requires sudo)

**macOS:**
- `shell` - Current shell session only
- `gui` - GUI apps from Dock/Finder (requires logout)
- `user` - Your shell profile (~/.bashrc or ~/.zshrc)

**Windows:**
- `session` - Current CMD/PowerShell session only
- `user` - User environment variables
- `system` - System-wide (requires admin)

## Interactive Mode

```bash
envman list -i
```

Use arrow keys to navigate variables and choose actions.

## License

MIT
