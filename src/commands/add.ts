import * as p from "@clack/prompts";
import { defineCommand } from "citty";
import { join } from "node:path";
import pc from "picocolors";
import { highlight } from "../utils/branding";
import {
  dirExists,
  ensureDir,
  fileExists,
  getCommandsDir,
  getRulesDir,
  getSkillsDir,
  writeFile,
} from "../utils/fs";

type ItemType = "command" | "rule" | "skill";

const COMMAND_TEMPLATE = `You are a helpful assistant. Describe what this command does.

## Instructions
- Step 1: ...
- Step 2: ...

## Rules
- Be concise
- Focus on the task

START: Wait for user input.
`;

const RULE_TEMPLATE = `---
description: Describe when this rule should apply
globs: 
alwaysApply: false
---

# Rule Title

Describe the rule behavior here.

## Guidelines
- Guideline 1
- Guideline 2
`;

const SKILL_TEMPLATE = `---
description: Describe when this skill should be activated
globs:
alwaysApply: false
---

# Skill Name

Brief description of what this skill enables.

## Core Capabilities

- Capability 1
- Capability 2

## When to Use

Use this skill when:
- Condition 1
- Condition 2

## References

For detailed guidance, see the references folder:
- [Reference 1](./references/example.md) - Description
`;

const SKILL_REFERENCE_TEMPLATE = `# Reference Title

Detailed reference content goes here.

## Section 1

Content...

## Section 2

Content...
`;

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export const addCommand = defineCommand({
  meta: {
    name: "add",
    description: "Add a new command, rule, or skill",
  },
  args: {
    type: {
      type: "string",
      alias: "t",
      description: "Type: 'command', 'rule', or 'skill'",
    },
    name: {
      type: "string",
      alias: "n",
      description: "Name of the command, rule, or skill",
    },
  },
  async run({ args }) {
    p.intro(pc.bgCyan(pc.black(" cursor-kit add ")));

    let itemType: ItemType;
    let itemName: string;

    if (args.type && ["command", "rule", "skill"].includes(args.type)) {
      itemType = args.type as ItemType;
    } else {
      const typeResult = await p.select({
        message: "What do you want to add?",
        options: [
          {
            value: "command",
            label: "Command",
            hint: "A reusable prompt template",
          },
          {
            value: "rule",
            label: "Rule",
            hint: "Project-specific AI behavior rules",
          },
          {
            value: "skill",
            label: "Skill",
            hint: "Comprehensive guide with references",
          },
        ],
      });

      if (p.isCancel(typeResult)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }

      itemType = typeResult as ItemType;
    }

    if (args.name) {
      itemName = args.name;
    } else {
      const nameResult = await p.text({
        message: `Enter ${itemType} name:`,
        placeholder: itemType === "command" ? "my-command" : itemType === "rule" ? "my-rule" : "my-skill",
        validate: (value) => {
          if (!value.trim()) return "Name is required";
          if (value.length < 2) return "Name must be at least 2 characters";
          return undefined;
        },
      });

      if (p.isCancel(nameResult)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }

      itemName = nameResult;
    }

    const slug = generateSlug(itemName);
    const isCommand = itemType === "command";
    // const isRule = itemType === "rule";
    const isSkill = itemType === "skill";

    let targetPath: string;
    let displayPath: string;

    if (isSkill) {
      const skillsDir = getSkillsDir();
      targetPath = join(skillsDir, slug);
      displayPath = targetPath;
    } else {
      const targetDir = isCommand ? getCommandsDir() : getRulesDir();
      const extension = isCommand ? ".md" : ".mdc";
      targetPath = join(targetDir, `${slug}${extension}`);
      displayPath = targetPath;
    }

    if (isSkill ? dirExists(targetPath) : fileExists(targetPath)) {
      const shouldOverwrite = await p.confirm({
        message: `${highlight(isSkill ? slug : slug + (isCommand ? ".md" : ".mdc"))} already exists. Overwrite?`,
        initialValue: false,
      });

      if (p.isCancel(shouldOverwrite) || !shouldOverwrite) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }
    }

    const s = p.spinner();
    s.start(`Creating ${itemType}...`);

    try {
      if (isSkill) {
        ensureDir(targetPath);
        ensureDir(join(targetPath, "references"));
        writeFile(join(targetPath, "SKILL.mdc"), SKILL_TEMPLATE);
        writeFile(join(targetPath, "references", "example.md"), SKILL_REFERENCE_TEMPLATE);
      } else {
        const targetDir = isCommand ? getCommandsDir() : getRulesDir();
        ensureDir(targetDir);
        const template = isCommand ? COMMAND_TEMPLATE : RULE_TEMPLATE;
        writeFile(targetPath, template);
      }

      s.stop(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} created`);

      console.log();
      if (isSkill) {
        console.log(pc.dim("  Directory: ") + highlight(displayPath));
        console.log(pc.dim("  Main file: ") + highlight(join(displayPath, "SKILL.mdc")));
      } else {
        console.log(pc.dim("  File: ") + highlight(displayPath));
      }
      console.log();

      p.outro(
        pc.green(`✨ ${itemType.charAt(0).toUpperCase() + itemType.slice(1)} created! Edit the file to customize it.`)
      );
    } catch (error) {
      s.stop("Failed");
      p.cancel(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      process.exit(1);
    }
  },
});
