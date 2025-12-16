<p align="center">
  <img src="./thumbnail.png" alt="Cursor Kit" width="768" />
</p>

<h1 align="center">✦ Cursor Kit ✦</h1>

<p align="center">
  <b>Supercharge your AI IDE with rules & commands</b><br/>
  <sub>A CLI toolkit to manage, share, and sync Cursor IDE, GitHub Copilot, and Google AntiGravity configurations</sub>
</p>

<p align="center">
  <a style="text-decoration: none;" href="https://www.npmjs.com/package/cursor-kit-cli" target="_blank">
    <img src="https://img.shields.io/npm/v/cursor-kit-cli?style=flat-square&color=000000" alt="npm version" />
  </a>
  <a style="text-decoration: none;" href="https://www.npmjs.com/package/cursor-kit-cli" target="_blank">
    <img src="https://img.shields.io/npm/dm/cursor-kit-cli?style=flat-square&color=000000" alt="npm downloads" />
  </a>
  <!-- <img src="https://img.shields.io/github/license/duongductrong/cursor-kit?style=flat-square&color=0047E1" alt="license" /> -->
</p>

## 🚀 Quick Start

```bash
# Install globally
npm install -g cursor-kit-cli

# Or use directly with npx
npx cursor-kit-cli init
```

**CLI Aliases:** `cursor-kit`, `cursorkit`, or `ck`

```bash
# All of these work
cursor-kit init
cursorkit init
ck init
```

## ✨ Features

- **📜 Commands** - Reusable prompt templates for common tasks
- **📋 Rules** - Project-specific AI behavior guidelines
- **🎓 Skills** - Comprehensive guides with references for specialized domains
- **🔄 Sync** - Keep configurations updated from the community
- **🎯 Multi-Target** - Support for Cursor IDE, GitHub Copilot, and Google AntiGravity
- **🖥️ Multi-Instance** - Run multiple Cursor accounts simultaneously (macOS)
- **⚡ Instance Aliases** - Create shell commands to quickly open projects in specific instances
- **🎨 Beautiful CLI** - Delightful terminal experience

## 📦 Commands

### `init`

Initialize commands, rules, and skills in your project with curated templates. Supports Cursor IDE, GitHub Copilot, and Google AntiGravity.

```bash
cursor-kit init                       # Interactive: choose target IDE
cursor-kit init -t cursor             # Initialize for Cursor IDE (.cursor/)
cursor-kit init -t github-copilot     # Initialize for GitHub Copilot (.github/copilot-instructions/)
cursor-kit init -t google-antigravity # Initialize for Google AntiGravity (.agent/)
cursor-kit init -c                    # Only initialize commands
cursor-kit init -r                    # Only initialize rules
cursor-kit init -s                    # Only initialize skills
cursor-kit init -f                    # Force overwrite existing files
cursor-kit init -a                    # Install all templates without selection prompts
```

**Target options:**
- `cursor` (default) - Creates `.cursor/` directory structure for Cursor IDE
- `github-copilot` - Creates `.github/copilot-instructions.md` and related structure for GitHub Copilot
- `google-antigravity` - Creates `.agent/` directory with rules, workflows, and skills for Google AntiGravity

### `add`

Interactively create a new command, rule, or skill with a starter template. Supports targeting different AI IDEs.

```bash
cursor-kit add                              # Interactive mode (prompts for target)
cursor-kit add --target cursor              # Add to Cursor IDE
cursor-kit add --target github-copilot      # Add to GitHub Copilot
cursor-kit add --target google-antigravity  # Add to Google AntiGravity
cursor-kit add -t command                   # Add a command
cursor-kit add -t rule                      # Add a rule
cursor-kit add -t skill                     # Add a skill
cursor-kit add -t command -n my-command     # Quick create
cursor-kit add --target cursor -t rule -n my-rule  # Full example
```

### `pull`

Fetch the latest updates from the cursor-kit repository. Supports targeting different AI IDEs.

```bash
cursor-kit pull                         # Interactive mode (prompts for target)
cursor-kit pull -t cursor               # Pull to Cursor IDE
cursor-kit pull -t github-copilot       # Pull to GitHub Copilot
cursor-kit pull -t google-antigravity   # Pull to Google AntiGravity
cursor-kit pull -c                      # Only pull commands
cursor-kit pull -r                      # Only pull rules
cursor-kit pull -s                      # Only pull skills
cursor-kit pull -f                      # Force overwrite without confirmation
cursor-kit pull -t cursor -r -f         # Pull rules to Cursor with force
```

### `list`

Display all available commands, rules, and skills in your project.

```bash
cursor-kit list           # List everything
cursor-kit list -c        # Only list commands
cursor-kit list -r        # Only list rules
cursor-kit list -s        # Only list skills
cursor-kit list -v        # Verbose mode with file paths
```

### `remove`

Remove a command, rule, or skill from your project. Supports targeting different AI IDEs.

```bash
cursor-kit remove                        # Interactive mode (prompts for target)
cursor-kit remove --target cursor        # Remove from Cursor IDE
cursor-kit remove --target github-copilot       # Remove from GitHub Copilot
cursor-kit remove --target google-antigravity   # Remove from Google AntiGravity
cursor-kit remove -t command -n my-command      # Quick remove
cursor-kit remove -f                     # Skip confirmation
cursor-kit remove --target cursor -t rule -n my-rule -f  # Full example
```

### `instance`

Manage multiple Cursor IDE instances for multi-account login. **macOS only.**

This command allows you to create separate Cursor instances, each with its own identity (bundle ID) and data directory. Perfect for users who need to work with multiple Cursor accounts simultaneously.

```bash
cursor-kit instance                                  # Interactive mode
cursor-kit instance -l                               # List existing instances
cursor-kit instance -a create -n "Cursor Work"       # Create instance
cursor-kit instance -a alias -n "Cursor Work"        # Add/update alias for instance
cursor-kit instance -a reinstall -n "Cursor Work"    # Reinstall instance (fix after updates)
cursor-kit instance -a remove -n "Cursor Work"       # Remove instance
```

**How it works:**

- Creates a copy of Cursor.app in `~/Applications/`
- Assigns a unique bundle identifier (e.g., `com.cursor.cursorwork`)
- Creates a separate data directory in `~/Library/Application Support/`
- Re-signs the app with an ad-hoc signature
- Each instance can be logged into with a different Cursor account
- Reinstall refreshes the instance with the latest Cursor version while preserving your data

**Shell Aliases:**

When creating an instance, you can set up a shell alias to quickly open directories in that instance (similar to the `cursor` command):

```bash
# Create instance with interactive alias setup
cursor-kit instance -a create -n "Cursor Work"
# You'll be prompted: "Would you like to create a shell alias?"

# Create instance with alias in one command
cursor-kit instance -a create -n "Cursor Work" -A cursor-work

# Specify alias storage location
cursor-kit instance -a create -n "Cursor Work" -A cursor-work --aliasLocation shell-config
cursor-kit instance -a create -n "Cursor Work" -A cursor-work --aliasLocation home-bin
cursor-kit instance -a create -n "Cursor Work" -A cursor-work --aliasLocation usr-local-bin

# Skip alias creation prompt
cursor-kit instance -a create -n "Cursor Work" --skipAlias
```

**Managing aliases for existing instances:**

Use the `alias` action to add, update, or remove aliases for instances that already exist:

```bash
# Interactive alias management
cursor-kit instance -a alias
# Select an instance, then choose to add/update/remove alias

# Add or update alias for a specific instance
cursor-kit instance -a alias -n "Cursor Work"

# Directly specify the alias name
cursor-kit instance -a alias -n "Cursor Work" -A cursor-work

# Specify alias name and storage location
cursor-kit instance -a alias -n "Cursor Work" -A cursor-work --aliasLocation home-bin
```

**Alias storage locations:**

| Location | Path | Description |
|----------|------|-------------|
| `shell-config` | `~/.zshrc` or `~/.bashrc` | Adds a shell function (restart terminal or `source` to activate) |
| `home-bin` | `~/bin/` | Creates an executable script (add `~/bin` to PATH if needed) |
| `usr-local-bin` | `/usr/local/bin/` | Creates a system-wide executable (may require sudo) |

**Using aliases:**

After creating an alias, you can open directories in your Cursor instance:

```bash
# Open current directory
cursor-work .

# Open a specific project
cursor-work ~/projects/my-app

# The alias works just like the original 'cursor' command
```

**Example workflow:**

```bash
# Create an instance for work projects with alias
cursor-kit instance -a create -n "Cursor Enterprise"
# When prompted, set alias to "cursor-work"

# Create another for personal use
cursor-kit instance -a create -n "Cursor Personal" -A cursor-personal

# List all your instances (shows associated aliases)
cursor-kit instance --list
# Output:
# ● Cursor Enterprise (alias: cursor-work)
#   └─ ~/Applications/Cursor Enterprise.app
# ● Cursor Personal (alias: cursor-personal)
#   └─ ~/Applications/Cursor Personal.app

# Use the aliases to open projects
cursor-work ~/work/project-a
cursor-personal ~/personal/side-project

# Add alias to an instance that doesn't have one
cursor-kit instance -a alias -n "Cursor Enterprise" -A cursor-enterprise

# Update an existing alias (change name or storage location)
cursor-kit instance -a alias -n "Cursor Enterprise"
# Select "Update alias" to change the alias name

# Fix an instance after Cursor update (preserves your data and alias)
cursor-kit instance -a reinstall -n "Cursor Enterprise"

# Remove an instance (will prompt to remove associated alias)
cursor-kit instance -a remove -n "Cursor Personal"
```

## 📁 Directory Structure

After running `cursor-kit init`, your project will have different structures depending on the target:

### Cursor IDE (default)

```
your-project/
└── .cursor/
    ├── commands/              # Prompt templates (.md)
    │   ├── docs.md
    │   ├── explain.md
    │   ├── fix.md
    │   ├── implement.md
    │   ├── refactor.md
    │   ├── review.md
    │   └── test.md
    ├── rules/                 # AI behavior rules (.mdc)
    │   ├── coding-style.mdc
    │   ├── git.mdc
    │   └── toc.mdc
    └── skills/                # Comprehensive guides with references
        ├── aesthetic/
        │   ├── SKILL.mdc
        │   ├── assets/
        │   └── references/
        ├── backend-development/
        │   ├── SKILL.mdc
        │   └── references/
        ├── frontend-design/
        │   ├── SKILL.mdc
        │   └── references/
        ├── frontend-development/
        │   ├── SKILL.mdc
        │   └── resources/
        ├── problem-solving/
        │   ├── SKILL.mdc
        │   └── references/
        ├── research/
        │   └── SKILL.mdc
        ├── sequential-thinking/
        │   ├── SKILL.mdc
        │   ├── references/
        │   └── scripts/
        └── ui-styling/
            ├── SKILL.mdc
            └── references/
```

### GitHub Copilot

```
your-project/
└── .github/
    ├── copilot-instructions.md    # Main instructions file
    └── copilot-instructions/      # Organized instructions
        ├── commands/              # Prompt templates (.md)
        │   ├── docs.md
        │   ├── explain.md
        │   ├── fix.md
        │   ├── implement.md
        │   ├── refactor.md
        │   ├── review.md
        │   └── test.md
        ├── rules/                 # AI behavior rules (.md)
        │   ├── coding-style.md
        │   ├── git.md
        │   └── toc.md
        └── skills/                # Comprehensive guides with references
            ├── aesthetic/
            │   ├── SKILL.md
            │   ├── assets/
            │   └── references/
            ├── backend-development/
            │   ├── SKILL.md
            │   └── references/
            └── ... (other skills)
```

### Google AntiGravity

```
your-project/
└── .agent/
    ├── workflows/                 # Workflow templates (.md)
    │   ├── docs.md
    │   ├── explain.md
    │   ├── fix.md
    │   ├── implement.md
    │   ├── refactor.md
    │   ├── review.md
    │   └── test.md
    ├── rules/                     # AI behavior rules (.md)
    │   ├── coding-style.md
    │   ├── git.md
    │   └── toc.md
    └── skills/                    # Comprehensive guides with references
        ├── aesthetic/
        │   ├── SKILL.md
        │   ├── assets/
        │   └── references/
        ├── backend-development/
        │   ├── SKILL.md
        │   └── references/
        └── ... (other skills)
```

## 🎯 Included Templates

### Commands

| Command     | Description                                    |
| ----------- | ---------------------------------------------- |
| `docs`      | Create or update documentation                 |
| `explain`   | Clear technical explanations                   |
| `fix`       | Diagnose and fix bugs with root cause analysis |
| `implement` | Convert feature ideas into actionable plans    |
| `refactor`  | Improve code quality without changing behavior |
| `review`    | Comprehensive code review checklist            |
| `test`      | Generate comprehensive test suites             |

### Rules

| Rule           | Description                                |
| -------------- | ------------------------------------------ |
| `coding-style` | Core coding conventions and best practices |
| `git`          | Commit and branching conventions           |
| `toc`          | Table of contents for rule selection      |

### Skills

| Skill                  | Description                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `aesthetic`            | Visual design principles, storytelling, and micro-interactions for distinctive interfaces |
| `backend-development`  | API design, architecture, authentication, security, and DevOps patterns           |
| `frontend-design`      | Create distinctive, production-grade interfaces with bold aesthetics (avoid generic AI slop) |
| `frontend-development` | React/TypeScript patterns: Suspense, lazy loading, TanStack Query/Router, MUI v7, file organization |
| `problem-solving`      | Techniques for complexity spirals, innovation blocks, meta-patterns, and scale testing |
| `research`             | Systematic research methodology for technical solutions with report generation     |
| `sequential-thinking`  | Structured problem-solving with revision, branching, and hypothesis verification   |
| `ui-styling`           | shadcn/ui components, Tailwind CSS utilities, theming, accessibility, and canvas-based visual design |

## 🛠️ Development

```bash
# Clone the repo
git clone https://github.com/duongductrong/cursor-kit.git
cd cursor-kit

# Install dependencies
pnpm install

# Build
pnpm build

# Run locally
node dist/cli.js

# Development mode (watch)
pnpm dev
```

### Requirements

- Node.js >= 18.0.0

## 📄 License

MIT © [duongductrong](https://github.com/duongductrong)

---

<p align="center">
  Made with ♥ for the Cursor community
</p>
