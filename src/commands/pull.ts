import { defineCommand } from "citty";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { downloadTemplate } from "giget";
import {
  ensureDir,
  getCommandsDir,
  getRulesDir,
  listFiles,
  getCursorDir,
} from "../utils/fs";
import { REPO_URL, REPO_REF } from "../utils/constants";
import { highlight, printDivider, printSuccess, printInfo } from "../utils/branding";

export const pullCommand = defineCommand({
  meta: {
    name: "pull",
    description: "Pull latest updates from cursor-kit repository",
  },
  args: {
    commands: {
      type: "boolean",
      alias: "c",
      description: "Only pull commands",
      default: false,
    },
    rules: {
      type: "boolean",
      alias: "r",
      description: "Only pull rules",
      default: false,
    },
    force: {
      type: "boolean",
      alias: "f",
      description: "Force overwrite without confirmation",
      default: false,
    },
  },
  async run({ args }) {
    const pullBoth = !args.commands && !args.rules;
    const shouldPullCommands = pullBoth || args.commands;
    const shouldPullRules = pullBoth || args.rules;

    p.intro(pc.bgCyan(pc.black(" cursor-kit pull ")));

    const commandsDir = getCommandsDir();
    const rulesDir = getRulesDir();

    const existingCommands = listFiles(commandsDir, ".md");
    const existingRules = listFiles(rulesDir, ".mdc");
    const hasExisting = existingCommands.length > 0 || existingRules.length > 0;

    if (hasExisting && !args.force) {
      printInfo("Current status:");
      if (existingCommands.length > 0) {
        console.log(pc.dim(`  Commands: ${existingCommands.length} files`));
      }
      if (existingRules.length > 0) {
        console.log(pc.dim(`  Rules: ${existingRules.length} files`));
      }
      console.log();

      const shouldContinue = await p.confirm({
        message: "This will merge with existing files. Continue?",
        initialValue: true,
      });

      if (p.isCancel(shouldContinue) || !shouldContinue) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }
    }

    const s = p.spinner();

    try {
      ensureDir(getCursorDir());

      if (shouldPullCommands) {
        s.start("Pulling commands...");
        await downloadTemplate(`${REPO_URL}/templates/commands#${REPO_REF}`, {
          dir: commandsDir,
          force: true,
        });
        s.stop("Commands updated");
      }

      if (shouldPullRules) {
        s.start("Pulling rules...");
        await downloadTemplate(`${REPO_URL}/templates/rules#${REPO_REF}`, {
          dir: rulesDir,
          force: true,
        });
        s.stop("Rules updated");
      }

      printDivider();
      console.log();

      const newCommands = listFiles(commandsDir, ".md");
      const newRules = listFiles(rulesDir, ".mdc");

      if (shouldPullCommands) {
        const added = newCommands.length - existingCommands.length;
        printSuccess(
          `Commands: ${highlight(newCommands.length.toString())} total` +
            (added > 0 ? pc.green(` (+${added} new)`) : "")
        );
      }

      if (shouldPullRules) {
        const added = newRules.length - existingRules.length;
        printSuccess(
          `Rules: ${highlight(newRules.length.toString())} total` +
            (added > 0 ? pc.green(` (+${added} new)`) : "")
        );
      }

      console.log();
      p.outro(pc.green("✨ Successfully pulled latest updates!"));
    } catch (error) {
      s.stop("Failed");
      p.cancel(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      process.exit(1);
    }
  },
});

