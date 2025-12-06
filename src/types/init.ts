export type InstructionTarget = "cursor" | "github-copilot";

export interface TargetConfig {
  label: string;
  description: string;
  rootDir: (cwd: string) => string;
  outputFile?: (cwd: string) => string;
}

