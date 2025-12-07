import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" /> */}

      <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-4 py-2 text-sm backdrop-blur-sm">
            <span className="size-1.5 rounded-full gradient-bg" />
            <span className="font-medium text-foreground">
              Supercharge your AI IDE with rules & commands
            </span>
          </div>

          {/* Headline */}
          <h1 className="max-w-3xl bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl">
            Manage, share, and sync your{" "}
            <span className="text-primary">AI IDE configurations</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            A CLI toolkit for Cursor IDE and GitHub Copilot. Commands, rules,
            and skills—all version-controlled and shareable.
          </p>

          {/* CTAs */}
          <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2 px-8" asChild>
              <Link
                href="https://www.npmjs.com/package/cursor-kit-cli"
                target="_blank"
              >
                Get Started
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8" asChild>
              <Link
                href="https://github.com/duongductrong/cursor-kit"
                target="_blank"
              >
                View on GitHub
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
