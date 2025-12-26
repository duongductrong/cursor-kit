export type InstructionTarget =
  | "cursor"
  | "github-copilot"
  | "google-antigravity";

export interface TargetConfig {
  label: string;
  description: string;
  rootDir: (cwd: string) => string;
  outputFile?: (cwd: string) => string;
}

export type NetworkMode = "lan" | "internet";
export type TunnelProvider = "localtunnel" | "ngrok";
