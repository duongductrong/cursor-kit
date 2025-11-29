import { defineCommand } from "citty";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { downloadTemplate } from "giget";
import {
  ensureDir,
  getCursorDir,
  getCommandsDir,
  getRulesDir,
  dirExists,
  listFiles,
} from "../utils/fs";
import { REPO_URL, REPO_REF } from "../utils/constants";
import { highlight, printDivider, printSuccess } from "../utils/branding";

export const initCommand = defineCommand({
  meta: {
    name: "init",
    description:
      "Initialize .cursor/commands and .cursor/rules in your project",
  },
  args: {
    force: {
      type: "boolean",
      alias: "f",
      description: "Overwrite existing files",
      default: false,
    },
    commands: {
      type: "boolean",
      alias: "c",
      description: "Only initialize commands",
      default: false,
    },
    rules: {
      type: "boolean",
      alias: "r",
      description: "Only initialize rules",
      default: false,
    },
  },
  async run({ args }) {
    const cwd = process.cwd();
    const cursorDir = getCursorDir(cwd);
    const commandsDir = getCommandsDir(cwd);
    const rulesDir = getRulesDir(cwd);

    const initBoth = !args.commands && !args.rules;
    const shouldInitCommands = initBoth || args.commands;
    const shouldInitRules = initBoth || args.rules;

    p.intro(pc.bgCyan(pc.black(" cursor-kit init ")));

    const commandsExist =
      dirExists(commandsDir) && listFiles(commandsDir).length > 0;
    const rulesExist = dirExists(rulesDir) && listFiles(rulesDir).length > 0;

    if ((commandsExist || rulesExist) && !args.force) {
      const existingItems: string[] = [];
      if (commandsExist) existingItems.push("commands");
      if (rulesExist) existingItems.push("rules");

      const shouldContinue = await p.confirm({
        message: `Existing ${existingItems.join(" and ")} found. Overwrite?`,
        initialValue: false,
      });

      if (p.isCancel(shouldContinue) || !shouldContinue) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }
    }

    const s = p.spinner();

    try {
      ensureDir(cursorDir);

      if (shouldInitCommands) {
        s.start("Fetching commands templates...");
        await downloadTemplate(`${REPO_URL}/templates/commands#${REPO_REF}`, {
          dir: commandsDir,
          force: true,
        });
        s.stop("Commands initialized");
      }

      if (shouldInitRules) {
        s.start("Fetching rules templates...");
        await downloadTemplate(`${REPO_URL}/templates/rules#${REPO_REF}`, {
          dir: rulesDir,
          force: true,
        });
        s.stop("Rules initialized");
      }

      printDivider();
      console.log();

      const commandFiles = listFiles(commandsDir, ".md");
      const ruleFiles = listFiles(rulesDir, ".mdc");

      if (shouldInitCommands && commandFiles.length > 0) {
        printSuccess(
          `Commands: ${highlight(commandFiles.length.toString())} templates`
        );
        commandFiles.forEach((f) => {
          console.log(pc.dim(`   └─ ${f}`));
        });
      }

      if (shouldInitRules && ruleFiles.length > 0) {
        printSuccess(
          `Rules: ${highlight(ruleFiles.length.toString())} templates`
        );
        ruleFiles.forEach((f) => {
          console.log(pc.dim(`   └─ ${f}`));
        });
      }

      console.log();
      p.outro(pc.green("✨ Cursor Kit initialized successfully!"));
    } catch (error) {
      s.stop("Failed");
      p.cancel(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      process.exit(1);
    }
  },
});
