import { defineCommand } from "citty";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { spawn } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, chmodSync, readdirSync } from "node:fs";
import { highlight, printDivider, printSuccess, printInfo, printWarning } from "../utils/branding";
import {
  createAlias,
  removeAlias,
  getAliasForInstance,
  aliasExists,
  generateAliasName,
  getStorageLocationLabel,
  isHomeBinInPath,
  getPathSetupInstructions,
  detectShellConfigPath,
  type AliasStorageLocation,
} from "../utils/alias";

type InstanceAction = "create" | "remove" | "reinstall" | "alias";

interface InstanceInfo {
  name: string;
  path: string;
  alias?: string;
}

function getBinPath(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const possiblePaths = [
    join(currentDir, "..", "..", "bin"),
    join(currentDir, "..", "bin"),
  ];

  for (const binPath of possiblePaths) {
    if (existsSync(binPath)) {
      return binPath;
    }
  }

  return possiblePaths[0];
}

function ensureExecutable(scriptPath: string): void {
  try {
    chmodSync(scriptPath, 0o755);
  } catch {
    // Ignore permission errors
  }
}

function getExistingInstances(): InstanceInfo[] {
  const userAppsDir = join(process.env.HOME ?? "", "Applications");
  if (!existsSync(userAppsDir)) return [];

  try {
    const apps = readdirSync(userAppsDir);
    return apps
      .filter((app) => app.startsWith("Cursor") && app.endsWith(".app") && app !== "Cursor.app")
      .map((app) => {
        const name = app.replace(".app", "");
        const aliasEntry = getAliasForInstance(name);
        return {
          name,
          path: join(userAppsDir, app),
          alias: aliasEntry?.aliasName,
        };
      });
  } catch {
    return [];
  }
}

function runScript(scriptPath: string, args: string[]): Promise<number> {
  return new Promise((resolve) => {
    ensureExecutable(scriptPath);

    const child = spawn(scriptPath, args, {
      stdio: "inherit",
    });

    child.on("close", (code) => {
      resolve(code ?? 1);
    });

    child.on("error", () => {
      resolve(1);
    });
  });
}

async function promptAliasCreation(
  instanceName: string,
  providedAlias?: string,
  providedLocation?: string,
  skipConfirmation?: boolean
): Promise<{ aliasName: string; location: AliasStorageLocation } | null> {
  if (!skipConfirmation) {
    const shouldCreateAlias = await p.confirm({
      message: "Would you like to create a shell alias for this instance?",
      initialValue: true,
    });

    if (p.isCancel(shouldCreateAlias) || !shouldCreateAlias) {
      return null;
    }
  }

  let aliasName: string;
  const suggestedAlias = generateAliasName(instanceName);

  if (providedAlias) {
    aliasName = providedAlias;
  } else {
    const aliasResult = await p.text({
      message: "Enter alias name:",
      placeholder: suggestedAlias,
      initialValue: suggestedAlias,
      validate: (value) => {
        if (!value.trim()) return "Alias name is required";
        if (!/^[a-z0-9-]+$/.test(value)) return "Alias must contain only lowercase letters, numbers, and hyphens";
        if (aliasExists(value)) return `Alias "${value}" already exists`;
        return undefined;
      },
    });

    if (p.isCancel(aliasResult)) {
      return null;
    }

    aliasName = aliasResult;
  }

  let location: AliasStorageLocation;

  if (providedLocation && ["shell-config", "usr-local-bin", "home-bin"].includes(providedLocation)) {
    location = providedLocation as AliasStorageLocation;
  } else {
    const locationResult = await p.select({
      message: "Where should the alias be stored?",
      options: [
        {
          value: "shell-config" as AliasStorageLocation,
          label: "Shell config",
          hint: detectShellConfigPath(),
        },
        {
          value: "home-bin" as AliasStorageLocation,
          label: "~/bin",
          hint: "User-local executable scripts",
        },
        {
          value: "usr-local-bin" as AliasStorageLocation,
          label: "/usr/local/bin",
          hint: "System-wide (may require sudo)",
        },
      ],
    });

    if (p.isCancel(locationResult)) {
      return null;
    }

    location = locationResult as AliasStorageLocation;
  }

  return { aliasName, location };
}

async function handleAliasCreation(
  instanceName: string,
  aliasName: string,
  location: AliasStorageLocation
): Promise<boolean> {
  const result = createAlias({
    aliasName,
    instanceName,
    storageLocation: location,
  });

  if (!result.success) {
    printWarning(`Failed to create alias: ${result.error}`);
    return false;
  }

  console.log();
  printSuccess(`Alias ${highlight(aliasName)} created!`);
  console.log(pc.dim(`  └─ Location: ${getStorageLocationLabel(location)}`));

  if (location === "home-bin" && !isHomeBinInPath()) {
    console.log();
    printWarning("~/bin is not in your PATH");
    console.log(pc.dim(getPathSetupInstructions()));
  }

  if (location === "shell-config") {
    console.log();
    console.log(pc.dim("  Restart your terminal or run:"));
    console.log(pc.dim(`  source ${detectShellConfigPath()}`));
  }

  console.log();
  console.log(pc.dim("  Usage:"));
  console.log(pc.dim(`  ${aliasName} .              # Open current directory`));
  console.log(pc.dim(`  ${aliasName} /path/to/dir   # Open specific directory`));

  return true;
}

async function handleAliasRemoval(instanceName: string): Promise<void> {
  const aliasEntry = getAliasForInstance(instanceName);

  if (!aliasEntry) {
    return;
  }

  const shouldRemove = await p.confirm({
    message: `Remove associated alias "${aliasEntry.aliasName}"?`,
    initialValue: true,
  });

  if (p.isCancel(shouldRemove) || !shouldRemove) {
    return;
  }

  const removed = removeAlias(aliasEntry.aliasName);

  if (removed) {
    printSuccess(`Alias ${highlight(aliasEntry.aliasName)} removed`);
  } else {
    printWarning(`Could not remove alias ${aliasEntry.aliasName}`);
  }
}

async function handleAliasAction(
  instanceName: string,
  providedAlias?: string,
  providedLocation?: string
): Promise<void> {
  const existingAlias = getAliasForInstance(instanceName);

  if (existingAlias) {
    console.log();
    printInfo(`Instance ${highlight(instanceName)} already has alias: ${highlight(existingAlias.aliasName)}`);
    console.log(pc.dim(`  └─ Location: ${getStorageLocationLabel(existingAlias.storageLocation)}`));
    console.log();

    const updateChoice = await p.select({
      message: "What would you like to do?",
      options: [
        {
          value: "update",
          label: "Update alias",
          hint: "Change alias name or location",
        },
        {
          value: "remove",
          label: "Remove alias",
          hint: "Delete the existing alias",
        },
        {
          value: "keep",
          label: "Keep current alias",
          hint: "No changes",
        },
      ],
    });

    if (p.isCancel(updateChoice) || updateChoice === "keep") {
      p.outro(pc.dim("No changes made"));
      return;
    }

    if (updateChoice === "remove") {
      const removed = removeAlias(existingAlias.aliasName);
      if (removed) {
        console.log();
        printSuccess(`Alias ${highlight(existingAlias.aliasName)} removed`);
        console.log();
        p.outro(pc.green("✨ Done!"));
      } else {
        printWarning(`Could not remove alias ${existingAlias.aliasName}`);
        p.outro(pc.yellow("Check file permissions"));
      }
      return;
    }

    // Update: remove old alias first
    removeAlias(existingAlias.aliasName);
  }

  // Create new alias (skip confirmation since user already chose alias action)
  const aliasConfig = await promptAliasCreation(
    instanceName,
    providedAlias,
    providedLocation,
    true
  );

  if (!aliasConfig) {
    p.outro(pc.dim("Alias creation cancelled"));
    return;
  }

  const success = await handleAliasCreation(instanceName, aliasConfig.aliasName, aliasConfig.location);

  if (success) {
    console.log();
    p.outro(pc.green("✨ Done!"));
  } else {
    p.outro(pc.yellow("Alias creation failed"));
  }
}

export const instanceCommand = defineCommand({
  meta: {
    name: "instance",
    description: "Manage Cursor IDE instances for multi-account login (macOS only)",
  },
  args: {
    action: {
      type: "string",
      alias: "a",
      description: "Action: 'create', 'reinstall', 'remove', or 'alias'",
    },
    name: {
      type: "string",
      alias: "n",
      description: "Name of the instance (e.g. 'Cursor Enterprise')",
    },
    list: {
      type: "boolean",
      alias: "l",
      description: "List existing Cursor instances",
      default: false,
    },
    alias: {
      type: "string",
      alias: "A",
      description: "Shell alias name for the instance (e.g. 'cursor-work')",
    },
    aliasLocation: {
      type: "string",
      description: "Alias storage location: 'shell-config', 'usr-local-bin', or 'home-bin'",
    },
    skipAlias: {
      type: "boolean",
      description: "Skip alias creation prompt",
      default: false,
    },
  },
  async run({ args }) {
    p.intro(pc.bgCyan(pc.black(" cursor-kit instance ")));

    // OS check
    if (process.platform !== "darwin") {
      console.log();
      printWarning("This command only works on macOS.");
      console.log(pc.dim("  Cursor instance management requires macOS-specific features."));
      console.log();
      p.outro(pc.dim("Exiting"));
      process.exit(1);
    }

    // List mode
    if (args.list) {
      const instances = getExistingInstances();
      printDivider();
      console.log();

      if (instances.length === 0) {
        printInfo("No custom Cursor instances found.");
        console.log(pc.dim("  Run ") + highlight("cursor-kit instance") + pc.dim(" to create one."));
      } else {
        console.log(pc.bold(pc.cyan("  🖥  Cursor Instances")) + pc.dim(` (${instances.length})`));
        console.log();
        for (const instance of instances) {
          const aliasInfo = instance.alias ? pc.dim(` (alias: ${pc.cyan(instance.alias)})`) : "";
          console.log(`  ${pc.green("●")} ${highlight(instance.name)}${aliasInfo}`);
          console.log(pc.dim(`    └─ ${instance.path}`));
        }
      }

      console.log();
      printDivider();
      p.outro(pc.dim(`Total: ${instances.length} instance${instances.length !== 1 ? "s" : ""}`));
      return;
    }

    // Get existing instances for context (needed for alias action before prerequisites)
    const existingInstances = getExistingInstances();

    // Handle alias action early (doesn't need instance scripts)
    if (args.action === "alias") {
      if (existingInstances.length === 0) {
        console.log();
        printInfo("No custom Cursor instances found.");
        console.log(pc.dim("  Create an instance first with: ") + highlight("cursor-kit instance -a create"));
        console.log();
        p.outro(pc.dim("Nothing to do"));
        return;
      }

      let instanceName: string;

      if (args.name) {
        const found = existingInstances.find((i) => i.name === args.name);
        if (!found) {
          printWarning(`Instance "${args.name}" not found.`);
          console.log(pc.dim("  Available instances:"));
          for (const inst of existingInstances) {
            console.log(pc.dim(`    • ${inst.name}`));
          }
          console.log();
          p.outro(pc.dim("Nothing to do"));
          return;
        }
        instanceName = args.name;
      } else {
        const instanceResult = await p.select({
          message: "Select instance to manage alias:",
          options: existingInstances.map((inst) => ({
            value: inst.name,
            label: inst.alias ? `${inst.name} (alias: ${inst.alias})` : inst.name,
            hint: inst.alias ? "Has alias" : "No alias",
          })),
        });

        if (p.isCancel(instanceResult)) {
          p.cancel("Operation cancelled");
          process.exit(0);
        }

        instanceName = instanceResult as string;
      }

      await handleAliasAction(instanceName, args.alias, args.aliasLocation);
      return;
    }

    const s = p.spinner();

    // Check prerequisites (only for create/remove/reinstall)
    s.start("Checking prerequisites...");
    const binPath = getBinPath();
    const createScript = join(binPath, "cursor-new-instance");
    const removeScript = join(binPath, "cursor-remove-instance");
    const reinstallScript = join(binPath, "cursor-reinstall-instance.sh");

    const scriptsExist = existsSync(createScript) && existsSync(removeScript) && existsSync(reinstallScript);
    if (!scriptsExist) {
      s.stop("Prerequisites check failed");
      console.log();
      printWarning("Required scripts not found.");
      console.log(pc.dim(`  Expected at: ${binPath}`));
      console.log();
      p.outro(pc.red("Installation may be corrupted"));
      process.exit(1);
    }

    const originalCursor = "/Applications/Cursor.app";
    if (!existsSync(originalCursor)) {
      s.stop("Prerequisites check failed");
      console.log();
      printWarning("Cursor.app not found in /Applications");
      console.log(pc.dim("  Please install Cursor IDE first."));
      console.log();
      p.outro(pc.red("Cursor IDE required"));
      process.exit(1);
    }

    s.stop("Prerequisites verified");

    let action: InstanceAction;
    let instanceName: string;

    // Determine action
    if (args.action && ["create", "remove", "reinstall"].includes(args.action)) {
      action = args.action as InstanceAction;
    } else {
      const actionResult = await p.select({
        message: "What would you like to do?",
        options: [
          {
            value: "create",
            label: "Create new instance",
            hint: "Clone Cursor with separate identity",
          },
          {
            value: "alias",
            label: "Manage alias",
            hint: existingInstances.length > 0
              ? "Add or update shell alias for instance"
              : "No instances available",
          },
          {
            value: "reinstall",
            label: "Reinstall instance",
            hint: existingInstances.length > 0
              ? "Fix broken instance after Cursor update"
              : "No instances to reinstall",
          },
          {
            value: "remove",
            label: "Remove instance",
            hint: existingInstances.length > 0
              ? `${existingInstances.length} instance${existingInstances.length !== 1 ? "s" : ""} available`
              : "No instances to remove",
          },
        ],
      });

      if (p.isCancel(actionResult)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }

      action = actionResult as InstanceAction;

      // Handle alias action if selected from menu
      if (action === "alias") {
        if (existingInstances.length === 0) {
          console.log();
          printInfo("No custom Cursor instances found.");
          console.log(pc.dim("  Create an instance first."));
          console.log();
          p.outro(pc.dim("Nothing to do"));
          return;
        }

        const instanceResult = await p.select({
          message: "Select instance to manage alias:",
          options: existingInstances.map((inst) => ({
            value: inst.name,
            label: inst.alias ? `${inst.name} (alias: ${inst.alias})` : inst.name,
            hint: inst.alias ? "Has alias" : "No alias",
          })),
        });

        if (p.isCancel(instanceResult)) {
          p.cancel("Operation cancelled");
          process.exit(0);
        }

        await handleAliasAction(instanceResult as string, args.alias, args.aliasLocation);
        return;
      }
    }

    // Get instance name
    if (args.name) {
      instanceName = args.name;
    } else if ((action === "remove" || action === "reinstall") && existingInstances.length > 0) {
      // For remove/reinstall actions, show existing instances to select from
      const actionLabel = action === "remove" ? "remove" : "reinstall";
      const instanceResult = await p.select({
        message: `Select instance to ${actionLabel}:`,
        options: existingInstances.map((inst) => ({
          value: inst.name,
          label: inst.alias ? `${inst.name} (alias: ${inst.alias})` : inst.name,
          hint: inst.path,
        })),
      });

      if (p.isCancel(instanceResult)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }

      instanceName = instanceResult as string;
    } else if ((action === "remove" || action === "reinstall") && existingInstances.length === 0) {
      console.log();
      printInfo(`No custom Cursor instances found to ${action}.`);
      console.log();
      p.outro(pc.dim("Nothing to do"));
      return;
    } else {
      // For create action, prompt for name
      const nameResult = await p.text({
        message: "Enter a name for the new instance:",
        placeholder: "Cursor Enterprise",
        validate: (value) => {
          if (!value.trim()) return "Instance name is required";
          if (value.length < 2) return "Name must be at least 2 characters";
          const existing = existingInstances.find(
            (i) => i.name.toLowerCase() === value.toLowerCase()
          );
          if (existing) return `Instance "${value}" already exists`;
          return undefined;
        },
      });

      if (p.isCancel(nameResult)) {
        p.cancel("Operation cancelled");
        process.exit(0);
      }

      instanceName = nameResult;
    }

    // Show summary
    printDivider();
    console.log();
    console.log(pc.bold(pc.cyan("  📋 Summary")));
    console.log();
    const actionColor = action === "create" ? pc.green : action === "reinstall" ? pc.blue : pc.yellow;
    const actionLabel = action === "create" ? "Create" : action === "reinstall" ? "Reinstall" : "Remove";
    console.log(`  ${pc.dim("Action:")}    ${actionColor(actionLabel)}`);
    console.log(`  ${pc.dim("Instance:")}  ${highlight(instanceName)}`);

    if (action === "create" || action === "reinstall") {
      const slug = instanceName.toLowerCase().replace(/[^a-z0-9]/g, "");
      console.log(`  ${pc.dim("Bundle ID:")} ${pc.dim("com.cursor.")}${highlight(slug)}`);
      console.log(`  ${pc.dim("Location:")}  ${pc.dim("~/Applications/")}${highlight(instanceName + ".app")}`);
      if (action === "reinstall") {
        const dataDir = join(process.env.HOME ?? "", "Library", "Application Support", instanceName.replace(/ /g, ""));
        console.log(`  ${pc.dim("Data:")}      ${pc.green("✓")} ${pc.dim("Preserved at")} ${pc.dim(dataDir)}`);
      }
    } else {
      const targetPath = join(process.env.HOME ?? "", "Applications", `${instanceName}.app`);
      console.log(`  ${pc.dim("Path:")}      ${pc.dim(targetPath)}`);

      const aliasEntry = getAliasForInstance(instanceName);
      if (aliasEntry) {
        console.log(`  ${pc.dim("Alias:")}     ${pc.yellow(aliasEntry.aliasName)} ${pc.dim("(will be removed)")}`);
      }
    }

    console.log();
    printDivider();
    console.log();

    const shouldContinue = await p.confirm({
      message: action === "create"
        ? "Create this Cursor instance?"
        : action === "reinstall"
        ? "Reinstall this instance? (User data will be preserved)"
        : "Remove this Cursor instance? This cannot be undone.",
      initialValue: action !== "remove",
    });

    if (p.isCancel(shouldContinue) || !shouldContinue) {
      p.cancel("Operation cancelled");
      process.exit(0);
    }

    // Execute script
    console.log();
    printDivider();
    console.log();

    const scriptPath = action === "create" 
      ? createScript 
      : action === "reinstall"
      ? reinstallScript
      : removeScript;
    // Pass --yes to remove/reinstall scripts since we already confirmed in the CLI
    const scriptArgs = action === "remove" || action === "reinstall" 
      ? ["--yes", instanceName] 
      : [instanceName];
    const exitCode = await runScript(scriptPath, scriptArgs);

    console.log();
    printDivider();
    console.log();

    if (exitCode === 0) {
      if (action === "create") {
        printSuccess(`Instance ${highlight(instanceName)} created successfully!`);

        // Offer alias creation
        if (!args.skipAlias) {
          console.log();

          const aliasConfig = await promptAliasCreation(
            instanceName,
            args.alias,
            args.aliasLocation
          );

          if (aliasConfig) {
            await handleAliasCreation(instanceName, aliasConfig.aliasName, aliasConfig.location);
          }
        } else if (args.alias) {
          // If alias is provided but skipAlias is set, still create it
          const location = (args.aliasLocation as AliasStorageLocation) ?? "shell-config";
          await handleAliasCreation(instanceName, args.alias, location);
        }

        console.log();
        console.log(pc.dim("  Next steps:"));
        console.log(pc.dim("  • The new instance should launch automatically"));
        console.log(pc.dim("  • Sign in with a different Cursor account"));
        console.log(pc.dim("  • Find it in ~/Applications/"));
      } else if (action === "reinstall") {
        printSuccess(`Instance ${highlight(instanceName)} reinstalled successfully!`);
        console.log();
        console.log(pc.dim("  The instance has been:"));
        console.log(pc.dim("  • Refreshed with the latest Cursor version"));
        console.log(pc.dim("  • Relaunched with your preserved data"));
        console.log(pc.dim("  • Ready to use with your existing account"));
      } else {
        // Handle alias removal for remove action
        await handleAliasRemoval(instanceName);

        printSuccess(`Instance ${highlight(instanceName)} removed successfully!`);
      }
      console.log();
      p.outro(pc.green("✨ Done!"));
    } else {
      printWarning(`Operation completed with exit code ${exitCode}`);
      console.log();
      p.outro(pc.yellow("Check the output above for details"));
      process.exit(exitCode);
    }
  },
});
