export function ScreenshotSection() {
  return (
    <section className="border-b border-border/50 py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col items-center gap-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, powerful CLI
          </h2>
          <p className="max-w-xl text-lg text-muted-foreground">
            One command to initialize your entire AI development environment.
          </p>
        </div>

        {/* Terminal-style screenshot */}
        <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-black/10">
          {/* Terminal header */}
          <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-4 py-3">
            <div className="flex gap-2">
              <div className="size-3 rounded-full bg-red-400" />
              <div className="size-3 rounded-full bg-yellow-400" />
              <div className="size-3 rounded-full bg-green-400" />
            </div>
            <span className="ml-4 text-sm text-muted-foreground font-mono">
              terminal
            </span>
          </div>

          {/* Terminal content */}
          <div className="p-6 font-mono text-sm">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">$</span>
                <span className="text-foreground">npx cursor-kit-cli init</span>
              </div>
              <div className="text-muted-foreground pl-4 space-y-1">
                <p>? Select target: <span className="text-foreground">Cursor IDE</span></p>
                <p>? Select commands to install: <span className="text-foreground">All (7 commands)</span></p>
                <p>? Select rules to install: <span className="text-foreground">All (3 rules)</span></p>
                <p>? Select skills to install: <span className="text-foreground">All (8 skills)</span></p>
              </div>
              <div className="text-muted-foreground pl-4 space-y-1 mt-2">
                <p className="text-green-600 dark:text-green-400">✓ Created .cursor/commands/ (7 files)</p>
                <p className="text-green-600 dark:text-green-400">✓ Created .cursor/rules/ (3 files)</p>
                <p className="text-green-600 dark:text-green-400">✓ Created .cursor/skills/ (8 directories)</p>
                <p className="text-green-600 dark:text-green-400 font-medium mt-2">✓ Setup complete!</p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Get up and running in less than 30 seconds
        </p>
      </div>
    </section>
  );
}
