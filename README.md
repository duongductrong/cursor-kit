<h1 align="center">✦ Cursor Kit ✦</h1>

<p align="center">
  <img src="https://img.shields.io/npm/v/cursor-kit-cli?style=flat-square&color=00DC82" alt="npm version" />
  <img src="https://img.shields.io/npm/dm/cursor-kit-cli?style=flat-square&color=36E4DA" alt="npm downloads" />
  <img src="https://img.shields.io/github/license/duongductrong/cursor-kit?style=flat-square&color=0047E1" alt="license" />
</p>

<p align="center">
  <b>Supercharge your Cursor IDE with rules & commands</b><br/>
  <sub>A CLI toolkit to manage, share, and sync Cursor IDE configurations</sub>
</p>

<p align="center">
  <img src="./thumbnail.png" alt="Cursor Kit" width="768" />
</p>

## 🚀 Quick Start

```bash
# Install globally
npm install -g cursor-kit-cli

# Or use directly with npx
npx cursor-kit-cli init
```

## ✨ Features

- **📜 Commands** - Reusable prompt templates for common tasks
- **📋 Rules** - Project-specific AI behavior guidelines
- **🔄 Sync** - Keep configurations updated from the community
- **🎨 Beautiful CLI** - Delightful terminal experience

## 📦 Commands

### `init`

Initialize `.cursor/commands` and `.cursor/rules` in your project with curated templates.

```bash
cursor-kit init           # Initialize both commands and rules
cursor-kit init -c        # Only initialize commands
cursor-kit init -r        # Only initialize rules
cursor-kit init -f        # Force overwrite existing files
```

### `add`

Interactively create a new command or rule with a starter template.

```bash
cursor-kit add                    # Interactive mode
cursor-kit add -t command         # Add a command
cursor-kit add -t rule            # Add a rule
cursor-kit add -t command -n my-command  # Quick create
```

### `pull`

Fetch the latest updates from the cursor-kit repository.

```bash
cursor-kit pull           # Pull both commands and rules
cursor-kit pull -c        # Only pull commands
cursor-kit pull -r        # Only pull rules
cursor-kit pull -f        # Force overwrite without confirmation
```

### `list`

Display all available commands and rules in your project.

```bash
cursor-kit list           # List everything
cursor-kit list -c        # Only list commands
cursor-kit list -r        # Only list rules
cursor-kit list -v        # Verbose mode with file paths
```

### `remove`

Remove a command or rule from your project.

```bash
cursor-kit remove         # Interactive mode
cursor-kit remove -t command -n my-command   # Quick remove
cursor-kit remove -f      # Skip confirmation
```

## 📁 Directory Structure

After running `cursor-kit init`, your project will have:

```
your-project/
└── .cursor/
    ├── commands/           # Prompt templates
    │   ├── implementation.md
    │   ├── refactor.md
    │   ├── review.md
    │   ├── debug.md
    │   ├── explain.md
    │   └── test.md
    └── rules/              # AI behavior rules
        ├── typescript.mdc
        ├── react.mdc
        ├── testing.mdc
        ├── git.mdc
        ├── security.mdc
        └── performance.mdc
```

## 🎯 Included Templates

### Commands
| Command | Description |
|---------|-------------|
| `implementation` | Convert feature ideas into actionable plans |
| `refactor` | Improve code quality without changing behavior |
| `review` | Comprehensive code review checklist |
| `debug` | Systematic bug investigation |
| `explain` | Clear technical explanations |
| `test` | Generate comprehensive test suites |

### Rules
| Rule | Description |
|------|-------------|
| `typescript` | TypeScript best practices |
| `react` | React component patterns |
| `testing` | Testing standards |
| `git` | Commit and branching conventions |
| `security` | Security guidelines |
| `performance` | Performance optimization |

## 🛠️ Development

```bash
# Clone the repo
git clone https://github.com/duongductrong/cursor-kit.git
cd cursor-kit

# Install dependencies
npm install

# Build
npm run build

# Run locally
node dist/cli.mjs
```

## 📄 License

MIT © [duongductrong](https://github.com/duongductrong)

---

<p align="center">
  Made with ♥ for the Cursor community
</p>

