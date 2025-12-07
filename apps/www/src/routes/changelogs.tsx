import type { Component } from "solid-js";
import { For, Show } from "solid-js";
import { A } from "@solidjs/router";
import { Title, Meta } from "@solidjs/meta";
import { FadeIn } from "../components/animations";
import { ChangelogEntryComponent } from "../components/sections";
import { changelog, getLatestVersion } from "../lib/changelog-parser";

const ChangelogsPage: Component = () => {
  return (
    <>
      <Title>Changelogs - Cursor Kit</Title>
      <Meta
        name="description"
        content="View the complete changelog for Cursor Kit. Stay updated with new features, bug fixes, and improvements."
      />

      <div class="min-h-screen py-12">
        {/* Background gradient */}
        <div class="fixed top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div class="relative max-w-4xl mx-auto px-6">
          {/* Header */}
          <FadeIn direction="up">
            <div class="text-center mb-16">
              <div class="inline-flex items-center gap-2 mb-4">
                <A
                  href="/"
                  class="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  ← Back to Home
                </A>
              </div>

              <h1 class="text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mb-4">
                <span class="text-gradient">Changelog</span>
              </h1>

              <p class="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-6">
                Track the evolution of Cursor Kit. Every feature, fix, and
                improvement documented for transparency.
              </p>

              {/* Latest version badge */}
              <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                <span class="text-sm text-[var(--text-muted)]">
                  Latest version:
                </span>
                <span class="text-sm font-mono font-medium text-indigo-300">
                  v{getLatestVersion()}
                </span>
              </div>
            </div>
          </FadeIn>

          {/* Timeline */}
          <div class="relative">
            <Show
              when={changelog.length > 0}
              fallback={
                <FadeIn direction="up">
                  <div class="text-center py-12 text-[var(--text-muted)]">
                    No changelog entries found.
                  </div>
                </FadeIn>
              }
            >
              <For each={changelog}>
                {(entry, index) => (
                  <ChangelogEntryComponent
                    entry={entry}
                    index={index()}
                    isLast={index() === changelog.length - 1}
                  />
                )}
              </For>
            </Show>
          </div>

          {/* Footer CTA */}
          <FadeIn direction="up" delay={300}>
            <div class="mt-16 text-center">
              <p class="text-[var(--text-muted)] mb-4">
                Want to contribute or report an issue?
              </p>
              <a
                href="https://github.com/duongductrong/cursor-kit/issues"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <svg
                  class="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Open an Issue on GitHub
              </a>
            </div>
          </FadeIn>
        </div>
      </div>
    </>
  );
};

export default ChangelogsPage;
