import { defineCommand } from "citty";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { join } from "node:path";
import {
  ensureDir,
  getCursorDir,
  getCommandsDir,
  getRulesDir,
  getSkillsDir,
  getConflictingFiles,
  getConflictingDirs,
  writeFile,
} from "../utils/fs";
import { highlight, printDivider, printSuccess } from "../utils/branding";
import {
  fetchTemplateManifest,
  fetchMultipleTemplates,
  getTemplateLabel,
  getSkillLabel,
  copyLocalSkill,
  type TemplateManifest,
  type TemplateType,
} from "../utils/templates";
import { type InstructionTarget } from "../types/init";
import {
  checkCopilotConflicts,
  installCopilotInstructions,
} from "../utils/copilot";

type ConflictStrategy = "overwrite" | "merge" | "cancel";

interface InitResult {
  added: string[];
  skipped: string[];
}

async function promptTargetSelection(): Promise<InstructionTarget | symbol> {
  return await p.select({
    message: "Which AI IDE are you using?",
    options: [
      {
        value: "cursor" as const,
        label: "Cursor",
        hint: "Generate .cursor/ directory structure",
      },
      {
        value: "github-copilot" as const,
        label: "GitHub Copilot",
        hint: "Generate .github/copilot-instructions.md",
      },
    ],
    initialValue: "cursor",
  });
}

async function handleCopilotInstallation(
  cwd: string,
  manifest: TemplateManifest,
  args: {
    all?: boolean;
    commands?: boolean;
    rules?: boolean;
    skills?: boolean;
    force?: boolean;
  },
  shouldInitCommands: boolean,
  shouldInitRules: boolean,
  shouldInitSkills: boolean
): Promise<void> {
  const s = p.spinner();

  const canProceed = await checkCopilotConflicts(cwd, args.force ?? false);
  if (!canProceed) {
    p.cancel("Operation cancelled");
    process.exit(0);
  }

  let selectedCommands: string[] = [];
  let selectedRules: string[] = [];
  let selectedSkills: string[] = [];

  if (shouldInitCommands) {
    if (args.all) {
      selectedCommands = manifest.commands;
    } else {
      const selection = await selectTemplates("commands", manifest.commands);
      if (p.isCancel(selection)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }
      selectedCommands = selection;
    }
  }

  if (shouldInitRules) {
    if (args.all) {
      selectedRules = manifest.rules;
    } else {
      const selection = await selectTemplates("rules", manifest.rules);
      if (p.isCancel(selection)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }
      selectedRules = selection;
    }
  }

  if (shouldInitSkills) {
    if (args.all) {
      selectedSkills = manifest.skills;
    } else {
      const selection = await selectTemplates("skills", manifest.skills);
      if (p.isCancel(selection)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }
      selectedSkills = selection;
    }
  }

  if (
    selectedCommands.length === 0 &&
    selectedRules.length === 0 &&
    selectedSkills.length === 0
  ) {
    p.cancel("No templates selected");
    process.exit(0);
  }

  try {
    s.start("Installing GitHub Copilot instructions...");
    const result = await installCopilotInstructions(
      cwd,
      selectedCommands,
      selectedRules,
      selectedSkills
    );
    s.stop("GitHub Copilot instructions installed");

    printDivider();
    console.log();

    if (result.commands.length > 0) {
      printSuccess(`Commands: ${highlight(result.commands.length.toString())} added`);
      for (const cmd of result.commands) {
        console.log(pc.dim(`   └─ ${pc.green("+")} ${cmd}`));
      }
    }

    if (result.rules.length > 0) {
      printSuccess(`Rules: ${highlight(result.rules.length.toString())} added`);
      for (const rule of result.rules) {
        console.log(pc.dim(`   └─ ${pc.green("+")} ${rule}`));
      }
    }

    if (result.skills.length > 0) {
      printSuccess(`Skills: ${highlight(result.skills.length.toString())} added`);
      for (const skill of result.skills) {
        console.log(pc.dim(`   └─ ${pc.green("+")} ${skill}`));
      }
    }

    console.log();
    p.outro(pc.green("✨ GitHub Copilot instructions created successfully!"));
  } catch (error) {
    s.stop("Failed");
    p.cancel(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    process.exit(1);
  }
}

async function selectTemplates(
  type: TemplateType,
  availableTemplates: string[]
): Promise<string[] | symbol> {
  const labelFn = type === "skills" ? getSkillLabel : getTemplateLabel;

  const selectionMode = await p.select({
    message: `How would you like to add ${type}?`,
    options: [
      {
        value: "all",
        label: `Add all ${availableTemplates.length} ${type}`,
        hint: "Install everything",
      },
      {
        value: "select",
        label: "Select specific items",
        hint: "Choose which ones to install",
      },
    ],
  });

  if (p.isCancel(selectionMode)) return selectionMode;

  if (selectionMode === "all") {
    return availableTemplates;
  }

  const selectedTemplates = await p.multiselect({
    message: `Select ${type} to add:`,
    options: availableTemplates.map((template) => ({
      value: template,
      label: labelFn(template),
      hint: template,
    })),
    required: true,
  });

  return selectedTemplates as string[] | symbol;
}

async function handleConflicts(
  type: TemplateType,
  conflictingFiles: string[]
): Promise<ConflictStrategy | symbol> {
  console.log();
  console.log(
    pc.yellow(`⚠ ${conflictingFiles.length} existing ${type} found:`)
  );
  for (const file of conflictingFiles) {
    console.log(pc.dim(`   └─ ${file}`));
  }
  console.log();

  const strategy = await p.select({
    message: "How would you like to handle conflicts?",
    options: [
      {
        value: "overwrite" as ConflictStrategy,
        label: "Overwrite existing files",
        hint: "Replace all conflicting files",
      },
      {
        value: "merge" as ConflictStrategy,
        label: "Merge (keep existing, add new only)",
        hint: "Skip files that already exist",
      },
      {
        value: "cancel" as ConflictStrategy,
        label: "Cancel",
        hint: "Abort the operation",
      },
    ],
  });

  return strategy as ConflictStrategy | symbol;
}

async function installTemplates(
  type: TemplateType,
  targetDir: string,
  selectedTemplates: string[],
  conflictStrategy: ConflictStrategy
): Promise<InitResult> {
  const result: InitResult = { added: [], skipped: [] };
  const conflictingFiles = getConflictingFiles(targetDir, selectedTemplates);

  let templatesToInstall: string[];

  if (conflictStrategy === "merge") {
    templatesToInstall = selectedTemplates.filter(
      (t) => !conflictingFiles.includes(t)
    );
    result.skipped = conflictingFiles.filter((f) =>
      selectedTemplates.includes(f)
    );
  } else {
    templatesToInstall = selectedTemplates;
  }

  if (templatesToInstall.length === 0) {
    return result;
  }

  const templates = await fetchMultipleTemplates(type, templatesToInstall);

  ensureDir(targetDir);

  for (const [filename, content] of templates) {
    const filePath = join(targetDir, filename);
    writeFile(filePath, content);
    result.added.push(filename);
  }

  return result;
}

async function installSkills(
  targetDir: string,
  selectedSkills: string[],
  conflictStrategy: ConflictStrategy
): Promise<InitResult> {
  const result: InitResult = { added: [], skipped: [] };
  const conflictingDirs = getConflictingDirs(targetDir, selectedSkills);

  let skillsToInstall: string[];

  if (conflictStrategy === "merge") {
    skillsToInstall = selectedSkills.filter(
      (s) => !conflictingDirs.includes(s)
    );
    result.skipped = conflictingDirs.filter((d) =>
      selectedSkills.includes(d)
    );
  } else {
    skillsToInstall = selectedSkills;
  }

  if (skillsToInstall.length === 0) {
    return result;
  }

  ensureDir(targetDir);

  for (const skillName of skillsToInstall) {
    const success = copyLocalSkill(skillName, targetDir);
    if (success) {
      result.added.push(skillName);
    }
  }

  return result;
}

export const initCommand = defineCommand({
  meta: {
    name: "init",
    description:
      "Initialize .cursor/commands, .cursor/rules, and .cursor/skills in your project",
  },
  args: {
    force: {
      type: "boolean",
      alias: "f",
      description: "Overwrite existing files without prompting",
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
    skills: {
      type: "boolean",
      alias: "s",
      description: "Only initialize skills",
      default: false,
    },
    all: {
      type: "boolean",
      alias: "a",
      description: "Install all templates without selection prompts",
      default: false,
    },
    target: {
      type: "string",
      alias: "t",
      description: "Target AI IDE: 'cursor' or 'github-copilot'",
      default: undefined,
    },
  },
  async run({ args }) {
    const cwd = process.cwd();
    const cursorDir = getCursorDir(cwd);
    const commandsDir = getCommandsDir(cwd);
    const rulesDir = getRulesDir(cwd);
    const skillsDir = getSkillsDir(cwd);

    const initAll = !args.commands && !args.rules && !args.skills;
    const shouldInitCommands = initAll || args.commands;
    const shouldInitRules = initAll || args.rules;
    const shouldInitSkills = initAll || args.skills;

    p.intro(pc.bgCyan(pc.black(" cursor-kit init ")));

    let target: InstructionTarget;
    if (args.target === "github-copilot" || args.target === "cursor") {
      target = args.target;
    } else {
      const selection = await promptTargetSelection();
      if (p.isCancel(selection)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }
      target = selection;
    }

    const s = p.spinner();

    let manifest: TemplateManifest;

    try {
      s.start("Fetching template manifest...");
      manifest = await fetchTemplateManifest();
      s.stop("Template manifest loaded");
    } catch (error) {
      s.stop("Failed to fetch manifest");
      p.cancel(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      process.exit(1);
    }

    if (target === "github-copilot") {
      await handleCopilotInstallation(
        cwd,
        manifest,
        args,
        shouldInitCommands,
        shouldInitRules,
        shouldInitSkills
      );
      return;
    }

    const results: {
      commands?: InitResult;
      rules?: InitResult;
      skills?: InitResult;
    } = {};

    try {
      ensureDir(cursorDir);

      if (shouldInitCommands) {
        let selectedCommands: string[];

        if (args.all) {
          selectedCommands = manifest.commands;
        } else {
          const selection = await selectTemplates("commands", manifest.commands);
          if (p.isCancel(selection)) {
            p.cancel("Operation cancelled");
            process.exit(0);
          }
          selectedCommands = selection;
        }

        const conflictingCommands = getConflictingFiles(
          commandsDir,
          selectedCommands
        );
        let commandStrategy: ConflictStrategy = "overwrite";

        if (conflictingCommands.length > 0 && !args.force) {
          const strategy = await handleConflicts("commands", conflictingCommands);
          if (p.isCancel(strategy) || strategy === "cancel") {
            p.cancel("Operation cancelled");
            process.exit(0);
          }
          commandStrategy = strategy;
        }

        s.start("Installing commands...");
        results.commands = await installTemplates(
          "commands",
          commandsDir,
          selectedCommands,
          commandStrategy
        );
        s.stop("Commands installed");
      }

      if (shouldInitRules) {
        let selectedRules: string[];

        if (args.all) {
          selectedRules = manifest.rules;
        } else {
          const selection = await selectTemplates("rules", manifest.rules);
          if (p.isCancel(selection)) {
            p.cancel("Operation cancelled");
            process.exit(0);
          }
          selectedRules = selection;
        }

        const conflictingRules = getConflictingFiles(rulesDir, selectedRules);
        let ruleStrategy: ConflictStrategy = "overwrite";

        if (conflictingRules.length > 0 && !args.force) {
          const strategy = await handleConflicts("rules", conflictingRules);
          if (p.isCancel(strategy) || strategy === "cancel") {
            p.cancel("Operation cancelled");
            process.exit(0);
          }
          ruleStrategy = strategy;
        }

        s.start("Installing rules...");
        results.rules = await installTemplates(
          "rules",
          rulesDir,
          selectedRules,
          ruleStrategy
        );
        s.stop("Rules installed");
      }

      if (shouldInitSkills) {
        let selectedSkills: string[];

        if (args.all) {
          selectedSkills = manifest.skills;
        } else {
          const selection = await selectTemplates("skills", manifest.skills);
          if (p.isCancel(selection)) {
            p.cancel("Operation cancelled");
            process.exit(0);
          }
          selectedSkills = selection;
        }

        const conflictingSkills = getConflictingDirs(skillsDir, selectedSkills);
        let skillStrategy: ConflictStrategy = "overwrite";

        if (conflictingSkills.length > 0 && !args.force) {
          const strategy = await handleConflicts("skills", conflictingSkills);
          if (p.isCancel(strategy) || strategy === "cancel") {
            p.cancel("Operation cancelled");
            process.exit(0);
          }
          skillStrategy = strategy;
        }

        s.start("Installing skills...");
        results.skills = await installSkills(
          skillsDir,
          selectedSkills,
          skillStrategy
        );
        s.stop("Skills installed");
      }

      printDivider();
      console.log();

      if (results.commands) {
        const { added, skipped } = results.commands;
        if (added.length > 0 || skipped.length > 0) {
          printSuccess(
            `Commands: ${highlight(added.length.toString())} added${skipped.length > 0 ? `, ${pc.yellow(skipped.length.toString())} skipped` : ""}`
          );
          for (const f of added) {
            console.log(pc.dim(`   └─ ${pc.green("+")} ${f}`));
          }
          for (const f of skipped) {
            console.log(pc.dim(`   └─ ${pc.yellow("○")} ${f} (kept existing)`));
          }
        }
      }

      if (results.rules) {
        const { added, skipped } = results.rules;
        if (added.length > 0 || skipped.length > 0) {
          printSuccess(
            `Rules: ${highlight(added.length.toString())} added${skipped.length > 0 ? `, ${pc.yellow(skipped.length.toString())} skipped` : ""}`
          );
          for (const f of added) {
            console.log(pc.dim(`   └─ ${pc.green("+")} ${f}`));
          }
          for (const f of skipped) {
            console.log(pc.dim(`   └─ ${pc.yellow("○")} ${f} (kept existing)`));
          }
        }
      }

      if (results.skills) {
        const { added, skipped } = results.skills;
        if (added.length > 0 || skipped.length > 0) {
          printSuccess(
            `Skills: ${highlight(added.length.toString())} added${skipped.length > 0 ? `, ${pc.yellow(skipped.length.toString())} skipped` : ""}`
          );
          for (const f of added) {
            console.log(pc.dim(`   └─ ${pc.green("+")} ${f}`));
          }
          for (const f of skipped) {
            console.log(pc.dim(`   └─ ${pc.yellow("○")} ${f} (kept existing)`));
          }
        }
      }

      const totalAdded =
        (results.commands?.added.length ?? 0) +
        (results.rules?.added.length ?? 0) +
        (results.skills?.added.length ?? 0);
      const totalSkipped =
        (results.commands?.skipped.length ?? 0) +
        (results.rules?.skipped.length ?? 0) +
        (results.skills?.skipped.length ?? 0);

      if (totalAdded === 0 && totalSkipped > 0) {
        console.log();
        p.outro(pc.yellow("No new templates added (all selected files already exist)"));
      } else {
        console.log();
        p.outro(pc.green("✨ Cursor Kit initialized successfully!"));
      }
    } catch (error) {
      s.stop("Failed");
      p.cancel(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      process.exit(1);
    }
  },
});
