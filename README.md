<p align="center">
  <img src="./thumbnail.png" alt="Cursor Kit" width="768" />
</p>

<h1 align="center">✦ Cursor Kit ✦</h1>

<p align="center">
  <b>Supercharge your Cursor IDE with rules & commands</b><br/>
  <sub>A CLI toolkit to manage, share, and sync Cursor IDE configurations</sub>
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
- **🖥️ Multi-Instance** - Run multiple Cursor accounts simultaneously (macOS)
- **🎨 Beautiful CLI** - Delightful terminal experience

## 📦 Commands

### `init`

Initialize `.cursor/commands`, `.cursor/rules`, and `.cursor/skills` in your project with curated templates.

```bash
cursor-kit init           # Initialize commands, rules, and skills
cursor-kit init -c        # Only initialize commands
cursor-kit init -r        # Only initialize rules
cursor-kit init -s        # Only initialize skills
cursor-kit init -f        # Force overwrite existing files
cursor-kit init -a        # Install all templates without selection prompts
```

### `add`

Interactively create a new command, rule, or skill with a starter template.

```bash
cursor-kit add                    # Interactive mode
cursor-kit add -t command         # Add a command
cursor-kit add -t rule            # Add a rule
cursor-kit add -t skill           # Add a skill
cursor-kit add -t command -n my-command  # Quick create
```

### `pull`

Fetch the latest updates from the cursor-kit repository.

```bash
cursor-kit pull           # Pull commands, rules, and skills
cursor-kit pull -c        # Only pull commands
cursor-kit pull -r        # Only pull rules
cursor-kit pull -s        # Only pull skills
cursor-kit pull -f        # Force overwrite without confirmation
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

Remove a command, rule, or skill from your project.

```bash
cursor-kit remove         # Interactive mode
cursor-kit remove -t command -n my-command   # Quick remove
cursor-kit remove -f      # Skip confirmation
```

### `instance`

Manage multiple Cursor IDE instances for multi-account login. **macOS only.**

This command allows you to create separate Cursor instances, each with its own identity (bundle ID) and data directory. Perfect for users who need to work with multiple Cursor accounts simultaneously.

```bash
cursor-kit instance                                  # Interactive mode
cursor-kit instance -l                               # List existing instances
cursor-kit instance -a create -n "Cursor Work"       # Create instance
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

**Example workflow:**

```bash
# Create an instance for work projects
cursor-kit instance -a create -n "Cursor Enterprise"

# Create another for personal use
cursor-kit instance -a create -n "Cursor Personal"

# List all your instances
cursor-kit instance --list

# Fix an instance after Cursor update (preserves your data)
cursor-kit instance -a reinstall -n "Cursor Enterprise"

# Remove an instance when no longer needed
cursor-kit instance -a remove -n "Cursor Personal"
```

## 📁 Directory Structure

After running `cursor-kit init`, your project will have:

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
