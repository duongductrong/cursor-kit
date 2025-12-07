import type { Component } from "solid-js";
import { A } from "@solidjs/router";
import { Button } from "../ui";
import { Terminal } from "../terminal";
import { FadeIn } from "../animations";
import { commands } from "../../data/commands";

export const HeroSection: Component = () => {
  const initCommand = commands.find((c) => c.id === "init");
  const previewOutput = initCommand?.output.slice(0, 18) ?? [];

  return (
    <section class="relative overflow-hidden">
      {/* Background gradient */}
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div class="relative max-w-6xl mx-auto px-6 py-24 lg:py-32 min-h-[88vh]">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <FadeIn direction="up" delay={0}>
            <div class="space-y-8">
              {/* Badge */}
              <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                <span class="text-lg">✦</span>
                <span class="text-sm text-indigo-300 font-medium">
                  Supercharge your AI IDE
                </span>
              </div>

              {/* Headline */}
              <h1 class="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                <span class="text-[var(--text-primary)]">Curated </span>
                <span class="text-gradient">rules & commands</span>
                <span class="text-[var(--text-primary)]"> for AI IDE</span>
              </h1>

              {/* Subheadline */}
              <p class="text-lg lg:text-xl text-[var(--text-secondary)] leading-relaxed max-w-xl">
                A CLI toolkit to manage, share, and sync your AI coding assistant configurations.
                Works with Cursor IDE and GitHub Copilot and Google Antigravity now.
              </p>

              {/* CTAs */}
              <div class="flex flex-wrap gap-4">
                <A href="/playground">
                  <Button size="lg">
                    <span>Explore Commands</span>
                    <span>→</span>
                  </Button>
                </A>
                <a
                  href="https://github.com/duongductrong/cursor-kit"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="lg">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    View on GitHub
                  </Button>
                </a>
              </div>

              {/* CLI aliases */}
              <div class="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                <span>CLI aliases:</span>
                <div class="flex gap-2">
                  <code class="px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--terminal-cyan)] font-mono text-xs">
                    cursor-kit
                  </code>
                  <code class="px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--terminal-cyan)] font-mono text-xs">
                    cursorkit
                  </code>
                  <code class="px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--terminal-cyan)] font-mono text-xs">
                    ck
                  </code>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Right: Terminal Preview */}
          <FadeIn direction="up" delay={200}>
            <Terminal
              title="cursor-kit init"
              lines={previewOutput}
              class="glow-primary"
            />
          </FadeIn>
        </div>
      </div>
    </section>
  );
};
