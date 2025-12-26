import { defineCommand } from "citty";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { get as httpGet } from "node:http";
import { createWriteStream, createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { PassThrough } from "node:stream";
import unzipper from "unzipper";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { printDivider, printSuccess, printInfo, printError, highlight } from "../utils/branding";
import {
  dirExists,
  fileExists,
  removeFile,
  ensureDir,
  getCursorDir,
  getAgentDir,
  getGitHubDir,
} from "../utils/fs";
import type { InstructionTarget } from "../types/init";

const METADATA_FILENAME = ".cursor-kit-share.json";

interface ShareMetadata {
  version: number;
  configs: InstructionTarget[];
}

type ConflictStrategy = "overwrite" | "merge" | "cancel";

interface ConfigInfo {
  type: InstructionTarget;
  label: string;
  directory: string;
  targetPath: string;
  hasConflict: boolean;
}

function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:";
  } catch {
    return false;
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

function getConfigInfo(type: InstructionTarget, cwd: string): ConfigInfo {
  switch (type) {
    case "cursor":
      return {
        type,
        label: "Cursor",
        directory: ".cursor",
        targetPath: getCursorDir(cwd),
        hasConflict: dirExists(getCursorDir(cwd)),
      };
    case "google-antigravity":
      return {
        type,
        label: "Google AntiGravity",
        directory: ".agent",
        targetPath: getAgentDir(cwd),
        hasConflict: dirExists(getAgentDir(cwd)),
      };
    case "github-copilot":
      return {
        type,
        label: "GitHub Copilot",
        directory: ".github",
        targetPath: getGitHubDir(cwd),
        hasConflict: dirExists(getGitHubDir(cwd)),
      };
  }
}

async function downloadToTemp(url: string): Promise<{ tempPath: string; size: number }> {
  const tempPath = join(tmpdir(), `cursor-kit-receive-${randomUUID()}.zip`);

  return new Promise((resolve, reject) => {
    const request = httpGet(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Server returned status ${response.statusCode}`));
        return;
      }

      const writeStream = createWriteStream(tempPath);
      const passThrough = new PassThrough();
      let size = 0;

      passThrough.on("data", (chunk: Buffer) => {
        size += chunk.length;
      });

      response.pipe(passThrough).pipe(writeStream);

      writeStream.on("finish", () => {
        resolve({ tempPath, size });
      });

      writeStream.on("error", (err) => {
        reject(err);
      });

      response.on("error", (err) => {
        reject(err);
      });
    });

    request.on("error", reject);
    request.on("timeout", () => {
      request.destroy();
      reject(new Error("Connection timed out"));
    });
    request.setTimeout(30000);
  });
}

async function readMetadataFromZip(zipPath: string): Promise<ShareMetadata | null> {
  return new Promise((resolve) => {
    const readStream = createReadStream(zipPath);
    const unzipStream = readStream.pipe(unzipper.Parse());

    let found = false;

    unzipStream.on("entry", async (entry) => {
      if (entry.path === METADATA_FILENAME && !found) {
        found = true;
        const chunks: Buffer[] = [];
        entry.on("data", (chunk: Buffer) => chunks.push(chunk));
        entry.on("end", () => {
          try {
            const content = Buffer.concat(chunks).toString("utf-8");
            const metadata = JSON.parse(content) as ShareMetadata;
            resolve(metadata);
          } catch {
            resolve(null);
          }
        });
      } else {
        entry.autodrain();
      }
    });

    unzipStream.on("close", () => {
      if (!found) {
        resolve(null);
      }
    });

    unzipStream.on("error", () => {
      resolve(null);
    });
  });
}

async function extractWithStrategy(
  zipPath: string,
  cwd: string,
  configs: ConfigInfo[],
  strategy: ConflictStrategy
): Promise<void> {
  if (strategy === "overwrite") {
    for (const config of configs) {
      if (config.hasConflict) {
        removeFile(config.targetPath);
      }
    }
  }

  const configDirs = new Set(configs.map((c) => c.directory));

  return new Promise((resolve, reject) => {
    const readStream = createReadStream(zipPath);
    const unzipStream = readStream.pipe(unzipper.Parse());

    const extractPromises: Promise<void>[] = [];

    unzipStream.on("entry", (entry) => {
      const entryPath = entry.path as string;

      if (entryPath === METADATA_FILENAME) {
        entry.autodrain();
        return;
      }

      const topLevelDir = entryPath.split("/")[0];
      if (!configDirs.has(topLevelDir)) {
        entry.autodrain();
        return;
      }

      const targetPath = join(cwd, entryPath);

      if (entry.type === "Directory") {
        ensureDir(targetPath);
        entry.autodrain();
        return;
      }

      if (strategy === "merge" && fileExists(targetPath)) {
        entry.autodrain();
        return;
      }

      ensureDir(join(targetPath, ".."));
      const writeStream = createWriteStream(targetPath);
      const extractPromise = pipeline(entry, writeStream);
      extractPromises.push(extractPromise);
    });

    unzipStream.on("close", async () => {
      try {
        await Promise.all(extractPromises);
        resolve();
      } catch (err) {
        reject(err);
      }
    });

    unzipStream.on("error", reject);
  });
}

export const receiveCommand = defineCommand({
  meta: {
    name: "receive",
    description: "Receive and extract shared AI IDE configs from a cursor-kit share URL",
  },
  args: {
    url: {
      type: "positional",
      description: "The share URL (e.g., http://192.168.1.15:8080)",
      required: true,
    },
    force: {
      type: "boolean",
      alias: "f",
      description: "Overwrite existing configs without prompting",
      default: false,
    },
  },
  async run({ args }) {
    const { url, force } = args;
    const cwd = process.cwd();

    if (!isValidUrl(url)) {
      p.cancel("Invalid URL. Please provide a valid HTTP URL (e.g., http://192.168.1.15:8080)");
      process.exit(1);
    }

    p.intro(pc.bgCyan(pc.black(" cursor-kit receive ")));

    console.log();
    printInfo(`Source: ${highlight(url)}`);
    printInfo(`Destination: ${highlight(cwd)}`);
    console.log();
    printDivider();
    console.log();

    const s = p.spinner();
    s.start("Connecting to server...");

    let tempPath: string | null = null;
    let receivedSize = 0;

    try {
      const result = await downloadToTemp(url);
      tempPath = result.tempPath;
      receivedSize = result.size;
      s.stop("Connected and downloaded");

      printInfo(`Received: ${highlight(formatBytes(receivedSize))}`);
      console.log();

      s.start("Reading metadata...");
      const metadata = await readMetadataFromZip(tempPath);

      if (!metadata || !metadata.configs || metadata.configs.length === 0) {
        s.stop("Invalid share file");
        printError("This doesn't appear to be a valid cursor-kit share.");
        printInfo("The share file is missing required metadata.");
        p.cancel("Invalid share format");
        removeFile(tempPath);
        process.exit(1);
      }

      s.stop("Metadata loaded");

      const configs = metadata.configs.map((type) => getConfigInfo(type, cwd));
      const conflictingConfigs = configs.filter((c) => c.hasConflict);

      printInfo("Configs in this share:");
      for (const config of configs) {
        const conflictIcon = config.hasConflict ? pc.yellow("⚠") : pc.green("●");
        const conflictHint = config.hasConflict ? pc.yellow(" (exists)") : "";
        console.log(pc.dim(`   └─ ${conflictIcon} ${config.label} (${config.directory})${conflictHint}`));
      }
      console.log();

      let strategy: ConflictStrategy = "overwrite";

      if (conflictingConfigs.length > 0 && !force) {
        const strategySelection = await p.select({
          message: `${conflictingConfigs.length} existing config(s) found. How do you want to handle conflicts?`,
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

        if (p.isCancel(strategySelection) || strategySelection === "cancel") {
          p.cancel("Operation cancelled");
          removeFile(tempPath);
          process.exit(0);
        }

        strategy = strategySelection;
      }

      s.start("Extracting configs...");
      await extractWithStrategy(tempPath, cwd, configs, strategy);
      s.stop("Configs extracted");

      removeFile(tempPath);

      console.log();
      printDivider();
      console.log();

      for (const config of configs) {
        const action = config.hasConflict
          ? strategy === "merge"
            ? "merged"
            : "replaced"
          : "added";
        printSuccess(`${config.label}: ${highlight(action)}`);
      }

      console.log();
      p.outro(pc.green("✨ Transfer complete!"));
    } catch (error) {
      s.stop("Failed");

      if (tempPath) {
        removeFile(tempPath);
      }

      let errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("ECONNREFUSED")) {
        errorMessage = "Connection refused. Make sure the share server is running.";
      } else if (errorMessage.includes("ETIMEDOUT") || errorMessage.includes("timeout")) {
        errorMessage = "Connection timed out. Check the URL and network connection.";
      } else if (errorMessage.includes("ENOTFOUND")) {
        errorMessage = "Host not found. Check the URL and network connection.";
      } else if (errorMessage.includes("ECONNRESET") || errorMessage.includes("aborted")) {
        errorMessage = "Connection was reset. The server may have closed unexpectedly.";
      }

      printError(errorMessage);
      p.cancel("Failed to receive configs");
      process.exit(1);
    }
  },
});
