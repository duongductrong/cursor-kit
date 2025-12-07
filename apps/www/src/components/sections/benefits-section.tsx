import { Terminal, Command } from "lucide-react";

const installMethods = [
  {
    title: "Quick Install",
    icon: Terminal,
    description: "Get started in seconds with npm or npx.",
    commands: [
      "npm install -g cursor-kit-cli",
      "# Or use directly",
      "npx cursor-kit-cli init",
    ],
    note: "CLI aliases: cursor-kit, cursorkit, ck",
  },
  {
    title: "Key Commands",
    icon: Command,
    description: "Everything you need to manage your AI IDE.",
    commands: [
      "ck init      # Initialize templates",
      "ck add       # Create new command/rule/skill",
      "ck pull      # Sync latest updates",
      "ck list      # View installed",
      "ck instance  # Multi-account (macOS)",
    ],
    note: "Run any command with --help for options",
  },
];

export function BenefitsSection() {
  return (
    <section id="install" className="border-b border-border/50 bg-background py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="flex flex-col items-center gap-4 text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Get started in seconds
          </h2>
          <p className="max-w-xl text-lg text-muted-foreground">
            Install globally or use directly with npx—your choice.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {installMethods.map((method) => {
            const Icon = method.icon;
            return (
              <div
                key={method.title}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg gradient-bg-subtle">
                    <Icon className="size-5 text-[var(--gradient-mid)]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {method.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {method.description}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-secondary/50 p-4 font-mono text-sm">
                  {method.commands.map((cmd, i) => (
                    <p
                      key={i}
                      className={
                        cmd.startsWith("#")
                          ? "text-muted-foreground"
                          : "text-foreground"
                      }
                    >
                      {cmd}
                    </p>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground">{method.note}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
