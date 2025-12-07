import { History } from "lucide-react";

export function ChangelogHero() {
  return (
    <section className="relative overflow-hidden min-h-[50vh]">
      <div className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-primary/10 p-4">
            <History className="size-10 text-primary" />
          </div>

          <h1 className="mb-4 bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl">
            Changelog
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Track every update, new feature, and improvement made to cursor-kit.
          </p>

          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-4 py-2 text-sm backdrop-blur-sm">
            <span className="size-1.5 rounded-full gradient-bg" />
            <span className="font-medium text-foreground">Release History</span>
          </div>
        </div>
      </div>
    </section>
  );
}
