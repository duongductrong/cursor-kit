import type { Component } from "solid-js";
import { createSignal, For } from "solid-js";
import { FadeIn } from "../animations";
import { installCommands } from "../../data/commands";

export const InstallSection: Component = () => {
  const [copied, setCopied] = createSignal<string | null>(null);

  const handleCopy = async (command: string) => {
    await navigator.clipboard.writeText(command);
    setCopied(command);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section class="py-24">
      <div class="max-w-4xl mx-auto px-6">
        <FadeIn direction="up">
          <div class="text-center mb-12">
            <h2 class="text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Get Started in Seconds
            </h2>
            <p class="text-lg text-[var(--text-secondary)]">
              Install globally or run directly with npx — your choice.
            </p>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={100}>
          <div class="space-y-4">
            <For each={installCommands}>
              {(item) => (
                <div class="group relative">
                  <div class="flex items-center gap-4 p-4 rounded-xl bg-[var(--terminal-bg)] border border-[var(--border-primary)]">
                    <span class="text-sm text-[var(--text-muted)] shrink-0 min-w-[100px]">
                      {item.label}
                    </span>
                    <code class="flex-1 font-mono text-[var(--terminal-cyan)] text-sm lg:text-base overflow-x-auto">
                      {item.command}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.command)}
                      class="shrink-0 p-2 rounded-lg hover:bg-[var(--surface-overlay)] transition-colors"
                      title="Copy to clipboard"
                    >
                      {copied() === item.command ? (
                        <svg
                          class="w-5 h-5 text-[var(--terminal-green)]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          class="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </FadeIn>

        {/* Requirements */}
        <FadeIn direction="up" delay={200}>
          <div class="mt-8 text-center">
            <p class="text-sm text-[var(--text-muted)]">
              Requires Node.js ≥ 18.0.0
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
