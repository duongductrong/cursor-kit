import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, rmSync, statSync, cpSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

export function ensureDir(path: string): void {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

export function fileExists(path: string): boolean {
  return existsSync(path);
}

export function dirExists(path: string): boolean {
  return existsSync(path) && statSync(path).isDirectory();
}

export function readFile(path: string): string {
  return readFileSync(path, "utf-8");
}

export function writeFile(path: string, content: string): void {
  ensureDir(dirname(path));
  writeFileSync(path, content, "utf-8");
}

export function removeFile(path: string): void {
  if (existsSync(path)) {
    rmSync(path, { recursive: true });
  }
}

export function copyDir(src: string, dest: string): void {
  cpSync(src, dest, { recursive: true });
}

export function listFiles(dir: string, extension?: string): string[] {
  if (!dirExists(dir)) return [];
  
  const files = readdirSync(dir);
  if (extension) {
    return files.filter((f) => f.endsWith(extension));
  }
  return files;
}

export function listDirs(dir: string): string[] {
  if (!dirExists(dir)) return [];
  
  return readdirSync(dir).filter((item) => {
    const itemPath = join(dir, item);
    return statSync(itemPath).isDirectory();
  });
}

export function getCursorDir(cwd: string = process.cwd()): string {
  return join(cwd, ".cursor");
}

export function getCommandsDir(cwd: string = process.cwd()): string {
  return join(getCursorDir(cwd), "commands");
}

export function getRulesDir(cwd: string = process.cwd()): string {
  return join(getCursorDir(cwd), "rules");
}

export function getSkillsDir(cwd: string = process.cwd()): string {
  return join(getCursorDir(cwd), "skills");
}

export function resolveFromCwd(...paths: string[]): string {
  return resolve(process.cwd(), ...paths);
}

export function getPackageJson(cwd: string = process.cwd()): Record<string, unknown> | null {
  const pkgPath = join(cwd, "package.json");
  if (!fileExists(pkgPath)) return null;
  
  try {
    return JSON.parse(readFile(pkgPath));
  } catch {
    return null;
  }
}

export function getConflictingFiles(dir: string, files: string[]): string[] {
  if (!dirExists(dir)) return [];
  return files.filter((file) => fileExists(join(dir, file)));
}

export function getConflictingDirs(dir: string, dirs: string[]): string[] {
  if (!dirExists(dir)) return [];
  return dirs.filter((d) => dirExists(join(dir, d)));
}

export function getNonConflictingFiles(dir: string, files: string[]): string[] {
  if (!dirExists(dir)) return files;
  return files.filter((file) => !fileExists(join(dir, file)));
}

export function getNonConflictingDirs(dir: string, dirs: string[]): string[] {
  if (!dirExists(dir)) return dirs;
  return dirs.filter((d) => !dirExists(join(dir, d)));
}

export function getGitHubDir(cwd: string = process.cwd()): string {
  return join(cwd, ".github");
}

export function getCopilotInstructionsPath(cwd: string = process.cwd()): string {
  return join(getGitHubDir(cwd), "copilot-instructions.md");
}

export function getCopilotInstructionsDir(cwd: string = process.cwd()): string {
  return join(getGitHubDir(cwd), "copilot-instructions");
}

export function getCopilotCommandsDir(cwd: string = process.cwd()): string {
  return join(getCopilotInstructionsDir(cwd), "commands");
}

export function getCopilotRulesDir(cwd: string = process.cwd()): string {
  return join(getCopilotInstructionsDir(cwd), "rules");
}

export function getCopilotSkillsDir(cwd: string = process.cwd()): string {
  return join(getCopilotInstructionsDir(cwd), "skills");
}

export function deleteFile(path: string): void {
  if (fileExists(path)) {
    rmSync(path);
  }
}
