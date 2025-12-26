import { defineCommand, runMain } from "citty";
import { createRequire } from "node:module";
import { printBanner, printVersion } from "./utils/branding";
import { initCommand } from "./commands/init";
import { addCommand } from "./commands/add";
import { pullCommand } from "./commands/pull";
import { listCommand } from "./commands/list";
import { removeCommand } from "./commands/remove";
import { instanceCommand } from "./commands/instance";
import { shareCommand } from "./commands/share";
import { receiveCommand } from "./commands/receive";

const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version: string };

const main = defineCommand({
  meta: {
    name: "cursor-kit",
    version: pkg.version,
    description: "CLI toolkit to manage Cursor IDE rules and commands",
  },
  setup() {
    printBanner();
    printVersion(pkg.version);
  },
  subCommands: {
    init: initCommand,
    add: addCommand,
    pull: pullCommand,
    list: listCommand,
    remove: removeCommand,
    instance: instanceCommand,
    share: shareCommand,
    receive: receiveCommand,
  },
});

runMain(main);

