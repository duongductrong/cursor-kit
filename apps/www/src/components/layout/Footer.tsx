import type { Component } from "solid-js";

export const Footer: Component = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer class="border-t border-[var(--border-primary)]">
      <div class="max-w-6xl mx-auto px-6 py-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <span class="text-xl">✦</span>
              <span class="text-lg font-semibold text-[var(--text-primary)]">Cursor Kit</span>
            </div>
            <p class="text-[var(--text-muted)] text-sm leading-relaxed">
              Supercharge your AI IDE with curated rules, commands, and skills.
            </p>
          </div>

          {/* Links */}
          <div class="space-y-4">
            <h4 class="text-sm font-semibold text-[var(--text-primary)]">Resources</h4>
            <ul class="space-y-2">
              <li>
                <a
                  href="https://github.com/duongductrong/cursor-kit"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm transition-colors"
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href="https://www.npmjs.com/package/cursor-kit-cli"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm transition-colors"
                >
                  NPM Package
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/duongductrong/cursor-kit/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm transition-colors"
                >
                  Contributing Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div class="space-y-4">
            <h4 class="text-sm font-semibold text-[var(--text-primary)]">Community</h4>
            <ul class="space-y-2">
              <li>
                <a
                  href="https://github.com/duongductrong/cursor-kit/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm transition-colors"
                >
                  Report Issues
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/duongductrong/cursor-kit/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm transition-colors"
                >
                  Discussions
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div class="mt-12 pt-8 border-t border-[var(--border-primary)]">
          <p class="text-center text-[var(--text-muted)] text-sm">
            MIT © {currentYear}{" "}
            <a
              href="https://github.com/duongductrong"
              target="_blank"
              rel="noopener noreferrer"
              class="hover:text-[var(--text-primary)] transition-colors"
            >
              duongductrong
            </a>
            . Made with ♥ for the Cursor community.
          </p>
        </div>
      </div>
    </footer>
  );
};
