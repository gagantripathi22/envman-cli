# envman

> Manage environment variables without the headache. Works on Linux, macOS, and Windows.

## The Problem

Every OS has its own way of handling environment variables. macOS makes you jump through hoops with `launchctl`. Linux has a dozen places to choose from. Windows has the registry. It's a mess.

envman gives you one tool that just works.

## Quick Start

Just run `envman` and pick what you want to do. Arrow keys, enter to select, no commands needed.

```bash
npm install -g envman-cli
envman
```

## What You Can Do

**Interactive Mode** (just type `envman`)
- Pick from a menu with arrow keys
- View, set, delete, export, import
- Always know where your vars are going

**Commands** (if you prefer)
```bash
envman list              # see all variables
envman list PATH         # filter by name
envman get HOME          # get one variable
envman set MY_VAR hello  # set something new
envman delete MY_VAR     # remove a variable
envman export             # save to .env file
envman import .env       # load from .env file
```

## Scope Support

Where do you want to save it?

| OS | Scope | What it does |
|----|-------|--------------|
| macOS | shell | Current terminal session |
| macOS | gui | Apps from Dock/Finder (need to logout for it to take effect) |
| macOS | user | Your shell profile (~/.zshrc or ~/.bashrc) |
| Linux | shell | Current terminal session |
| Linux | user | Your shell profile |
| Linux | system | Everyone (/etc/environment, needs sudo) |
| Windows | session | Current CMD/PowerShell only |
| Windows | user | Your user environment (new windows get it) |
| Windows | system | All users (needs admin) |

## Why This Exists

I got tired of:
- Google searching "how to set environment variable macOS terminal"
- Editing config files and not knowing which one to use
- Variables working in terminal but not in my IDE
- `launchctl` documentation that makes no sense

So I built this. Use arrow keys, pick your scope, done.
