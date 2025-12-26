import { defineCommand } from "citty";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { createServer, type Server, type IncomingMessage, type ServerResponse } from "node:http";
import { networkInterfaces } from "node:os";
import archiver from "archiver";
import { printDivider, printSuccess, printInfo, printError, highlight } from "../utils/branding";
import {
  dirExists,
  fileExists,
  getCursorDir,
  getAgentDir,
  getGitHubDir,
  getCopilotInstructionsPath,
  getCopilotInstructionsDir,
} from "../utils/fs";
import type { InstructionTarget } from "../types/init";

const DEFAULT_PORT = 8080;
const MAX_PORT_RETRIES = 10;
const METADATA_FILENAME = ".cursor-kit-share.json";

interface ConfigOption {
  type: InstructionTarget;
  label: string;
  directory: string;
  path: string;
}

interface ShareMetadata {
  version: number;
  configs: InstructionTarget[];
}

function getLocalIp(): string {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    const netList = nets[name];
    if (!netList) continue;
    for (const net of netList) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "127.0.0.1";
}

function detectAvailableConfigs(cwd: string): ConfigOption[] {
  const configs: ConfigOption[] = [];

  const cursorDir = getCursorDir(cwd);
  if (dirExists(cursorDir)) {
    configs.push({
      type: "cursor",
      label: "Cursor",
      directory: ".cursor",
      path: cursorDir,
    });
  }

  const agentDir = getAgentDir(cwd);
  if (dirExists(agentDir)) {
    configs.push({
      type: "google-antigravity",
      label: "Google AntiGravity",
      directory: ".agent",
      path: agentDir,
    });
  }

  const githubDir = getGitHubDir(cwd);
  const copilotInstructionsPath = getCopilotInstructionsPath(cwd);
  const copilotInstructionsDir = getCopilotInstructionsDir(cwd);
  if (fileExists(copilotInstructionsPath) || dirExists(copilotInstructionsDir)) {
    configs.push({
      type: "github-copilot",
      label: "GitHub Copilot",
      directory: ".github",
      path: githubDir,
    });
  }

  return configs;
}

function tryListen(server: Server, port: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const handleError = (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        reject(new Error(`Port ${port} is already in use`));
      } else {
        reject(err);
      }
    };

    server.once("error", handleError);
    server.listen(port, () => {
      server.removeListener("error", handleError);
      resolve(port);
    });
  });
}

async function findAvailablePort(server: Server, startPort: number): Promise<number> {
  for (let i = 0; i < MAX_PORT_RETRIES; i++) {
    const port = startPort + i;
    try {
      return await tryListen(server, port);
    } catch {
      if (i === MAX_PORT_RETRIES - 1) {
        throw new Error(`Could not find an available port after ${MAX_PORT_RETRIES} attempts`);
      }
    }
  }
  throw new Error("Unexpected error finding available port");
}

function createConfigZipStream(selectedConfigs: ConfigOption[]): archiver.Archiver {
  const archive = archiver("zip", {
    zlib: { level: 6 },
  });

  archive.on("warning", (err) => {
    if (err.code !== "ENOENT") {
      console.warn(pc.yellow(`Warning: ${err.message}`));
    }
  });

  archive.on("error", (err) => {
    throw err;
  });

  const metadata: ShareMetadata = {
    version: 1,
    configs: selectedConfigs.map((c) => c.type),
  };
  archive.append(JSON.stringify(metadata, null, 2), { name: METADATA_FILENAME });

  for (const config of selectedConfigs) {
    archive.directory(config.path, config.directory);
  }

  archive.finalize();

  return archive;
}

function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  selectedConfigs: ConfigOption[],
  onTransferStart: () => void,
  onTransferComplete: () => void,
  onTransferError: (err: Error) => void
): void {
  if (req.method !== "GET" || req.url !== "/") {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
    return;
  }

  onTransferStart();

  res.writeHead(200, {
    "Content-Type": "application/zip",
    "Content-Disposition": 'attachment; filename="cursor-kit-configs.zip"',
    "Transfer-Encoding": "chunked",
  });

  const archive = createConfigZipStream(selectedConfigs);

  res.on("finish", () => {
    onTransferComplete();
  });

  res.on("close", () => {
    if (!res.writableFinished) {
      onTransferError(new Error("Client disconnected before transfer completed"));
    }
  });

  archive.on("error", (err) => {
    onTransferError(err);
    res.destroy();
  });

  archive.pipe(res);
}

export const shareCommand = defineCommand({
  meta: {
    name: "share",
    description: "Share AI IDE configs (.cursor, .agent, .github) over LAN via HTTP",
  },
  args: {
    port: {
      type: "string",
      alias: "p",
      description: "Port to use for the HTTP server",
      default: String(DEFAULT_PORT),
    },
  },
  async run({ args }) {
    const cwd = process.cwd();
    const requestedPort = Number.parseInt(args.port, 10);

    if (Number.isNaN(requestedPort) || requestedPort < 1 || requestedPort > 65535) {
      p.cancel("Invalid port number. Please specify a port between 1 and 65535.");
      process.exit(1);
    }

    p.intro(pc.bgCyan(pc.black(" cursor-kit share ")));

    const availableConfigs = detectAvailableConfigs(cwd);

    if (availableConfigs.length === 0) {
      console.log();
      printError("No AI IDE configs found in the current directory.");
      printInfo("Run 'cursor-kit init' first to create configs for your AI IDE.");
      console.log();
      p.cancel("Nothing to share");
      process.exit(1);
    }

    let selectedConfigs: ConfigOption[];

    if (availableConfigs.length === 1) {
      selectedConfigs = availableConfigs;
      printInfo(`Found: ${highlight(availableConfigs[0].label)} (${availableConfigs[0].directory})`);
    } else {
      const selection = await p.multiselect({
        message: "Which AI IDE configs do you want to share?",
        options: availableConfigs.map((config) => ({
          value: config.type,
          label: config.label,
          hint: config.directory,
        })),
        required: true,
      });

      if (p.isCancel(selection)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }

      selectedConfigs = availableConfigs.filter((c) =>
        (selection as InstructionTarget[]).includes(c.type)
      );
    }

    console.log();

    const s = p.spinner();
    s.start("Starting HTTP server...");

    let server: Server | null = null;
    let transferInProgress = false;

    const cleanup = () => {
      if (server) {
        server.close();
        server = null;
      }
    };

    process.on("SIGINT", () => {
      console.log();
      if (transferInProgress) {
        printError("Transfer interrupted");
      } else {
        printInfo("Server stopped");
      }
      cleanup();
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      cleanup();
      process.exit(0);
    });

    try {
      server = createServer((req, res) => {
        handleRequest(
          req,
          res,
          selectedConfigs,
          () => {
            transferInProgress = true;
            console.log();
            printInfo("Connection established, transferring files...");
          },
          () => {
            transferInProgress = false;
            console.log();
            printSuccess("Transfer complete!");
            printInfo("Server will shut down automatically.");
            cleanup();
            process.exit(0);
          },
          (err) => {
            transferInProgress = false;
            printError(`Transfer failed: ${err.message}`);
          }
        );
      });

      const actualPort = await findAvailablePort(server, requestedPort);
      const localIp = getLocalIp();

      s.stop("HTTP server started");

      console.log();
      printDivider();
      console.log();
      printInfo("Sharing configs:");
      for (const config of selectedConfigs) {
        console.log(pc.dim(`   └─ ${pc.green("●")} ${config.label} (${config.directory})`));
      }
      console.log();
      printInfo(`Local IP: ${highlight(localIp)}`);
      printInfo(`Port: ${highlight(String(actualPort))}`);
      console.log();
      printDivider();
      console.log();

      console.log(pc.bold("  Run this command on the receiving machine:"));
      console.log();
      console.log(
        `  ${pc.cyan("$")} ${pc.bold(pc.green(`cursor-kit receive http://${localIp}:${actualPort}`))}`
      );
      console.log();
      printDivider();
      console.log();
      printInfo("Waiting for connection... (Press Ctrl+C to cancel)");
    } catch (error) {
      s.stop("Failed to start server");
      cleanup();
      p.cancel(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      process.exit(1);
    }
  },
});
