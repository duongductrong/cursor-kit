import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { REPO_RAW_URL, TEMPLATE_PATHS } from "./constants";
import { fileExists, readFile, dirExists, listFiles, listDirs, copyDir, ensureDir } from "./fs";

export interface TemplateManifest {
  commands: string[];
  rules: string[];
  skills: string[];
}

export type TemplateType = "commands" | "rules" | "skills";

export interface TemplateItem {
  name: string;
  type: TemplateType;
}

function getLocalTemplatesDir(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  return join(currentDir, "..", "templates");
}

function getLocalManifest(): TemplateManifest | null {
  const templatesDir = getLocalTemplatesDir();
  const manifestPath = join(templatesDir, "manifest.json");

  if (fileExists(manifestPath)) {
    try {
      return JSON.parse(readFile(manifestPath)) as TemplateManifest;
    } catch {
      return null;
    }
  }

  const commandsDir = join(templatesDir, "commands");
  const rulesDir = join(templatesDir, "rules");
  const skillsDir = join(templatesDir, "skills");

  if (!dirExists(commandsDir) && !dirExists(rulesDir) && !dirExists(skillsDir)) {
    return null;
  }

  return {
    commands: dirExists(commandsDir) ? listFiles(commandsDir, ".md") : [],
    rules: dirExists(rulesDir) ? listFiles(rulesDir, ".mdc") : [],
    skills: dirExists(skillsDir) ? listDirs(skillsDir) : [],
  };
}

function getLocalTemplateContent(type: TemplateType, filename: string): string | null {
  const templatesDir = getLocalTemplatesDir();
  const filePath = join(templatesDir, type, filename);

  if (fileExists(filePath)) {
    return readFile(filePath);
  }

  return null;
}

export function getLocalSkillDir(skillName: string): string | null {
  const templatesDir = getLocalTemplatesDir();
  const skillPath = join(templatesDir, "skills", skillName);

  if (dirExists(skillPath)) {
    return skillPath;
  }

  return null;
}

export function copyLocalSkill(skillName: string, targetDir: string): boolean {
  const sourcePath = getLocalSkillDir(skillName);
  if (!sourcePath) return false;

  const destPath = join(targetDir, skillName);
  ensureDir(destPath);
  copyDir(sourcePath, destPath);
  return true;
}

export async function fetchTemplateManifest(): Promise<TemplateManifest> {
  const localManifest = getLocalManifest();
  if (localManifest) {
    return localManifest;
  }

  const url = `${REPO_RAW_URL}/templates/manifest.json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch template manifest: ${response.statusText}`);
  }

  return response.json() as Promise<TemplateManifest>;
}

export async function fetchTemplateContent(
  type: TemplateType,
  filename: string
): Promise<string> {
  const localContent = getLocalTemplateContent(type, filename);
  if (localContent !== null) {
    return localContent;
  }

  const templatePath = TEMPLATE_PATHS[type];
  const url = `${REPO_RAW_URL}/${templatePath}/${filename}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch template ${filename}: ${response.statusText}`);
  }

  return response.text();
}

export async function fetchMultipleTemplates(
  type: TemplateType,
  filenames: string[]
): Promise<Map<string, string>> {
  const results = new Map<string, string>();

  const fetchPromises = filenames.map(async (filename) => {
    const content = await fetchTemplateContent(type, filename);
    return { filename, content };
  });

  const settled = await Promise.allSettled(fetchPromises);

  for (const result of settled) {
    if (result.status === "fulfilled") {
      results.set(result.value.filename, result.value.content);
    }
  }

  return results;
}

export function getTemplateLabel(filename: string): string {
  const nameWithoutExt = filename.replace(/\.(md|mdc)$/, "");
  return nameWithoutExt
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getSkillLabel(skillName: string): string {
  return skillName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function stripFrontmatter(content: string): string {
  const frontmatterRegex = /^---\n[\s\S]*?\n---\n/;
  return content.replace(frontmatterRegex, "").trim();
}

export function extractFrontmatter(content: string): {
  alwaysApply?: boolean;
  name?: string;
  description?: string;
  [key: string]: unknown;
} {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!frontmatterMatch) return {};

  const frontmatter = frontmatterMatch[1];
  const result: Record<string, unknown> = {};

  for (const line of frontmatter.split("\n")) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      result[key] =
        value === "true" ? true : value === "false" ? false : value;
    }
  }

  return result;
}

export function generateCopilotIndex(
  commands: string[],
  rules: string[],
  skills: string[],
  alwaysApplyRules: string[] = []
): string {
  let output = "# GitHub Copilot Custom Instructions\n\n";
  output += "> Generated by cursor-kit-cli\n\n";
  output +=
    "This file provides instructions for GitHub Copilot. ";
  output +=
    "When working on tasks, read the relevant files from the `copilot-instructions/` directory as needed.\n\n";

  if (alwaysApplyRules.length > 0) {
    output += "## Rules Applied Automatically\n\n";
    output +=
      "The following rules are always applied. Read these files for context:\n\n";
    for (const rule of alwaysApplyRules) {
      const ruleName = rule.replace(/\.md$/, "");
      output += `- **${ruleName}**: Read \`.github/copilot-instructions/rules/${rule}\` for guidelines\n`;
    }
    output += "\n";
  }

  if (commands.length > 0) {
    output += "## Commands\n\n";
    output +=
      "When the user requests a command, read the corresponding file:\n\n";
    for (const cmd of commands) {
      const cmdName = cmd.replace(/\.md$/, "");
      output += `- **${cmdName}**: Read \`.github/copilot-instructions/commands/${cmd}\` when user requests "${cmdName}"\n`;
    }
    output += "\n";
  }

  if (rules.length > 0) {
    output += "## Rules\n\n";
    output +=
      "Apply these rules when relevant to the task. Read the files as needed:\n\n";
    for (const rule of rules) {
      const ruleName = rule.replace(/\.md$/, "");
      output += `- **${ruleName}**: Read \`.github/copilot-instructions/rules/${rule}\` for ${ruleName} guidelines\n`;
    }
    output += "\n";
  }

  if (skills.length > 0) {
    output += "## Skills\n\n";
    output +=
      "These are comprehensive guides for specialized domains. Read the relevant skill when working in that domain:\n\n";
    for (const skill of skills) {
      output += `- **${skill}**: Read \`.github/copilot-instructions/skills/${skill}/SKILL.md\` when working on ${skill} tasks\n`;
    }
    output += "\n";
  }

  output += "## Usage Guidelines\n\n";
  output +=
    "- **Don't read all files at once** - Only read files relevant to the current task\n";
  output +=
    "- **Commands**: Read command files when the user explicitly requests that command\n";
  output +=
    "- **Rules**: Reference rules when they apply to the current coding task\n";
  output +=
    "- **Skills**: Read skill files when working in that domain (e.g., frontend-development for React components)\n";
  output +=
    "- **Always Apply Rules**: These are automatically considered, but you can reference them for specific guidance\n\n";

  return output;
}
