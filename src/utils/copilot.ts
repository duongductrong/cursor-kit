import { join } from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import {
  ensureDir,
  fileExists,
  dirExists,
  writeFile,
  deleteFile,
  readFile,
  getCopilotInstructionsPath,
  getCopilotInstructionsDir,
  getCopilotCommandsDir,
  getCopilotRulesDir,
  getCopilotSkillsDir,
} from "./fs";
import {
  fetchMultipleTemplates,
  copyLocalSkill,
  stripFrontmatter,
  extractFrontmatter,
  generateCopilotIndex,
} from "./templates";
import { printSuccess } from "./branding";

export interface CopilotInstallResult {
  commands: string[];
  rules: string[];
  skills: string[];
  alwaysApplyRules: string[];
}

async function installCopilotCommands(
  commandsDir: string,
  selectedCommands: string[]
): Promise<string[]> {
  if (selectedCommands.length === 0) return [];

  ensureDir(commandsDir);
  const commandsMap = await fetchMultipleTemplates("commands", selectedCommands);
  const installed: string[] = [];

  for (const [filename, content] of commandsMap) {
    const cleanContent = stripFrontmatter(content);
    const filePath = join(commandsDir, filename);
    writeFile(filePath, cleanContent);
    installed.push(filename);
  }

  return installed;
}

async function installCopilotRules(
  rulesDir: string,
  selectedRules: string[]
): Promise<{ installed: string[]; alwaysApply: string[] }> {
  if (selectedRules.length === 0) return { installed: [], alwaysApply: [] };

  ensureDir(rulesDir);
  const rulesMap = await fetchMultipleTemplates("rules", selectedRules);
  const installed: string[] = [];
  const alwaysApply: string[] = [];

  for (const [filename, content] of rulesMap) {
    const frontmatter = extractFrontmatter(content);
    const cleanContent = stripFrontmatter(content);

    const mdFilename = filename.replace(/\.mdc$/, ".md");
    const filePath = join(rulesDir, mdFilename);
    writeFile(filePath, cleanContent);

    installed.push(mdFilename);

    if (frontmatter.alwaysApply) {
      alwaysApply.push(mdFilename);
    }
  }

  return { installed, alwaysApply };
}

async function installCopilotSkills(
  skillsDir: string,
  selectedSkills: string[]
): Promise<string[]> {
  if (selectedSkills.length === 0) return [];

  ensureDir(skillsDir);
  const installed: string[] = [];

  for (const skillName of selectedSkills) {
    const success = copyLocalSkill(skillName, skillsDir);
    if (!success) continue;

    const skillTargetDir = join(skillsDir, skillName);
    const skillMdcPath = join(skillTargetDir, "SKILL.mdc");
    const skillMdPath = join(skillTargetDir, "SKILL.md");

    if (fileExists(skillMdcPath)) {
      const content = readFile(skillMdcPath);
      const cleanContent = stripFrontmatter(content);
      writeFile(skillMdPath, cleanContent);
      deleteFile(skillMdcPath);
    }

    installed.push(skillName);
  }

  return installed;
}

export async function checkCopilotConflicts(
  cwd: string,
  force: boolean
): Promise<boolean> {
  const copilotDir = getCopilotInstructionsDir(cwd);
  const copilotIndexPath = getCopilotInstructionsPath(cwd);

  const hasExistingDir = dirExists(copilotDir);
  const hasExistingIndex = fileExists(copilotIndexPath);

  if ((hasExistingDir || hasExistingIndex) && !force) {
    const overwrite = await p.confirm({
      message: "GitHub Copilot instructions already exist. Overwrite?",
      initialValue: false,
    });

    if (p.isCancel(overwrite) || !overwrite) {
      return false;
    }
  }

  return true;
}

export async function installCopilotInstructions(
  cwd: string,
  selectedCommands: string[],
  selectedRules: string[],
  selectedSkills: string[]
): Promise<CopilotInstallResult> {
  const commandsDir = getCopilotCommandsDir(cwd);
  const rulesDir = getCopilotRulesDir(cwd);
  const skillsDir = getCopilotSkillsDir(cwd);
  const copilotIndexPath = getCopilotInstructionsPath(cwd);

  const [installedCommands, rulesResult, installedSkills] = await Promise.all([
    installCopilotCommands(commandsDir, selectedCommands),
    installCopilotRules(rulesDir, selectedRules),
    installCopilotSkills(skillsDir, selectedSkills),
  ]);

  const installedRules = rulesResult.installed;
  const alwaysApplyRules = rulesResult.alwaysApply;

  const indexContent = generateCopilotIndex(
    installedCommands,
    installedRules,
    installedSkills,
    alwaysApplyRules
  );

  writeFile(copilotIndexPath, indexContent);

  printSuccess(`GitHub Copilot instructions generated`);
  console.log(pc.dim(`   └─ ${copilotIndexPath}`));
  console.log(pc.dim(`   └─ ${getCopilotInstructionsDir(cwd)}/`));

  return {
    commands: installedCommands,
    rules: installedRules.map((r) => r.replace(/\.md$/, "")),
    skills: installedSkills,
    alwaysApplyRules,
  };
}

