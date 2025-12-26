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
import { createTunnel, getTunnelProviderLabel, type TunnelConnection } from "../utils/tunnel";
import type { InstructionTarget, NetworkMode, TunnelProvider } from "../types/init";

const DEFAULT_PORT = 8080;
const MAX_PORT_RETRIES = 10;
const METADATA_FILENAME = ".cursor-kit-share.json";
const CONFIRMATION_TIMEOUT_MS = 30000;

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

interface TransferState {
  zipSent: boolean;
  confirmed: boolean;
  confirmationTimeout: NodeJS.Timeout | null;
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

function handleDownloadRequest(
  _req: IncomingMessage,
  res: ServerResponse,
  selectedConfigs: ConfigOption[],
  transferState: TransferState,
  onTransferStart: () => void,
  onZipSent: () => void,
  onTransferError: (err: Error) => void
): void {
  onTransferStart();

  res.writeHead(200, {
    "Content-Type": "application/zip",
    "Content-Disposition": 'attachment; filename="cursor-kit-configs.zip"',
    "Transfer-Encoding": "chunked",
  });

  const archive = createConfigZipStream(selectedConfigs);

  res.on("finish", () => {
    transferState.zipSent = true;
    onZipSent();
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

function handleConfirmRequest(
  _req: IncomingMessage,
  res: ServerResponse,
  transferState: TransferState,
  onTransferComplete: () => void
): void {
  if (transferState.confirmed) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "already_confirmed" }));
    return;
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "confirmed" }));

  onTransferComplete();
}

function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  selectedConfigs: ConfigOption[],
  transferState: TransferState,
  onTransferStart: () => void,
  onZipSent: () => void,
  onTransferComplete: () => void,
  onTransferError: (err: Error) => void
): void {
  const url = req.url || "/";

  if (req.method === "GET" && url === "/") {
    handleDownloadRequest(
      req,
      res,
      selectedConfigs,
      transferState,
      onTransferStart,
      onZipSent,
      onTransferError
    );
    return;
  }

  if (req.method === "GET" && url === "/confirm") {
    handleConfirmRequest(req, res, transferState, onTransferComplete);
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
}

export const shareCommand = defineCommand({
  meta: {
    name: "share",
    description: "Share AI IDE configs (.cursor, .agent, .github) over LAN or Internet via HTTP",
  },
  args: {
    port: {
      type: "string",
      alias: "p",
      description: "Port to use for the HTTP server",
      default: String(DEFAULT_PORT),
    },
    network: {
      type: "string",
      alias: "n",
      description: "Network mode: 'lan' (local network) or 'internet' (public tunnel)",
    },
    tunnel: {
      type: "string",
      alias: "t",
      description: "Tunnel provider for internet mode: 'localtunnel' or 'ngrok'",
      default: "localtunnel",
    },
  },
  async run({ args }) {
    const cwd = process.cwd();
    const requestedPort = Number.parseInt(args.port, 10);

    if (Number.isNaN(requestedPort) || requestedPort < 1 || requestedPort > 65535) {
      p.cancel("Invalid port number. Please specify a port between 1 and 65535.");
      process.exit(1);
    }

    const validNetworkModes: NetworkMode[] = ["lan", "internet"];
    const validTunnelProviders: TunnelProvider[] = ["localtunnel", "ngrok"];

    if (args.network && !validNetworkModes.includes(args.network as NetworkMode)) {
      p.cancel("Invalid network mode. Use 'lan' or 'internet'.");
      process.exit(1);
    }

    if (!validTunnelProviders.includes(args.tunnel as TunnelProvider)) {
      p.cancel("Invalid tunnel provider. Use 'localtunnel' or 'ngrok'.");
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

    let networkMode: NetworkMode;
    if (args.network) {
      networkMode = args.network as NetworkMode;
    } else {
      const networkSelection = await p.select({
        message: "How do you want to share?",
        options: [
          {
            value: "lan" as NetworkMode,
            label: "LAN (Local Network)",
            hint: "Share within your local network",
          },
          {
            value: "internet" as NetworkMode,
            label: "Internet (Public URL)",
            hint: "Share via a public tunnel URL",
          },
        ],
      });

      if (p.isCancel(networkSelection)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }

      networkMode = networkSelection;
    }

    let tunnelProvider: TunnelProvider = args.tunnel as TunnelProvider;
    if (networkMode === "internet" && !args.tunnel) {
      const tunnelSelection = await p.select({
        message: "Which tunnel provider do you want to use?",
        options: [
          {
            value: "localtunnel" as TunnelProvider,
            label: "localtunnel",
            hint: "Free, no account required",
          },
          {
            value: "ngrok" as TunnelProvider,
            label: "ngrok",
            hint: "More reliable, requires account",
          },
        ],
      });

      if (p.isCancel(tunnelSelection)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }

      tunnelProvider = tunnelSelection;
    }

    console.log();

    const s = p.spinner();
    s.start("Starting HTTP server...");

    let server: Server | null = null;
    let tunnel: TunnelConnection | null = null;
    let transferInProgress = false;

    const transferState: TransferState = {
      zipSent: false,
      confirmed: false,
      confirmationTimeout: null,
    };

    const cleanup = async () => {
      if (transferState.confirmationTimeout) {
        clearTimeout(transferState.confirmationTimeout);
        transferState.confirmationTimeout = null;
      }
      if (tunnel) {
        try {
          await tunnel.close();
        } catch {
          // Ignore tunnel close errors
        }
        tunnel = null;
      }
      if (server) {
        server.close();
        server = null;
      }
    };

    const handleTransferComplete = async () => {
      if (transferState.confirmed) return;
      transferState.confirmed = true;

      if (transferState.confirmationTimeout) {
        clearTimeout(transferState.confirmationTimeout);
        transferState.confirmationTimeout = null;
      }

      transferInProgress = false;
      console.log();
      printSuccess("Transfer complete!");
      printInfo("Server will shut down automatically.");
      await cleanup();
      process.exit(0);
    };

    process.on("SIGINT", async () => {
      console.log();
      if (transferInProgress) {
        printError("Transfer interrupted");
      } else {
        printInfo("Server stopped");
      }
      await cleanup();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      await cleanup();
      process.exit(0);
    });

    try {
      server = createServer((req, res) => {
        handleRequest(
          req,
          res,
          selectedConfigs,
          transferState,
          () => {
            transferInProgress = true;
            console.log();
            printInfo("Connection established, transferring files...");
          },
          () => {
            printInfo("Files sent, waiting for receiver confirmation...");
            transferState.confirmationTimeout = setTimeout(() => {
              if (!transferState.confirmed) {
                printInfo("No confirmation received, assuming transfer complete (timeout fallback).");
                handleTransferComplete();
              }
            }, CONFIRMATION_TIMEOUT_MS);
          },
          handleTransferComplete,
          (err) => {
            transferInProgress = false;
            printError(`Transfer failed: ${err.message}`);
          }
        );
      });

      const actualPort = await findAvailablePort(server, requestedPort);
      const localIp = getLocalIp();

      s.stop("HTTP server started");

      let shareUrl: string;

      if (networkMode === "internet") {
        const tunnelSpinner = p.spinner();
        tunnelSpinner.start(`Creating ${getTunnelProviderLabel(tunnelProvider)} tunnel...`);

        try {
          tunnel = await createTunnel(actualPort, tunnelProvider);
          shareUrl = tunnel.url;
          tunnelSpinner.stop(`Tunnel created via ${getTunnelProviderLabel(tunnelProvider)}`);
        } catch (error) {
          tunnelSpinner.stop("Failed to create tunnel");
          await cleanup();
          printError(error instanceof Error ? error.message : "Unknown tunnel error");
          p.cancel("Could not establish internet connection");
          process.exit(1);
        }
      } else {
        shareUrl = `http://${localIp}:${actualPort}`;
      }

      console.log();
      printDivider();
      console.log();
      printInfo("Sharing configs:");
      for (const config of selectedConfigs) {
        console.log(pc.dim(`   └─ ${pc.green("●")} ${config.label} (${config.directory})`));
      }
      console.log();

      if (networkMode === "internet") {
        printInfo(`Mode: ${highlight("Internet")} (${getTunnelProviderLabel(tunnelProvider)})`);
        printInfo(`Public URL: ${highlight(shareUrl)}`);
      } else {
        printInfo(`Mode: ${highlight("LAN")}`);
        printInfo(`Local IP: ${highlight(localIp)}`);
        printInfo(`Port: ${highlight(String(actualPort))}`);
      }

      console.log();
      printDivider();
      console.log();

      console.log(pc.bold("  Run this command on the receiving machine:"));
      console.log();
      console.log(
        `  ${pc.cyan("$")} ${pc.bold(pc.green(`cursor-kit receive ${shareUrl}`))}`
      );
      console.log();
      printDivider();
      console.log();
      printInfo("Waiting for connection... (Press Ctrl+C to cancel)");
    } catch (error) {
      s.stop("Failed to start server");
      await cleanup();
      p.cancel(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      process.exit(1);
    }
  },
});
