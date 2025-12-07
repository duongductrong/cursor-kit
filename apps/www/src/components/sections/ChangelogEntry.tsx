import type { Component } from "solid-js";
import { For, Show } from "solid-js";
import { Badge } from "../ui";
import { FadeIn } from "../animations";
import type { ChangelogEntry, ChangelogSection } from "../../lib/changelog-parser";
import { formatDate } from "../../lib/changelog-parser";

interface ChangelogEntryProps {
  entry: ChangelogEntry;
  index: number;
  isLast: boolean;
}

const sectionBadgeVariants: Record<ChangelogSection["type"], "primary" | "success" | "warning" | "info" | "default"> = {
  feature: "primary",
  fix: "success",
  breaking: "warning",
  docs: "info",
  refactor: "default",
  chore: "default",
};

export const ChangelogEntryComponent: Component<ChangelogEntryProps> = (props) => {
  return (
    <FadeIn direction="up" delay={props.index * 100}>
      <div class="relative pl-8 pb-12">
        {/* Timeline connector */}
        <Show when={!props.isLast}>
          <div class="absolute left-[11px] top-6 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 to-transparent" />
        </Show>
        
        {/* Timeline dot */}
        <div class="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-[var(--bg-card)] border-2 border-indigo-500 flex items-center justify-center">
          <div class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        </div>

        {/* Content */}
        <div class="ml-4">
          {/* Header */}
          <div class="flex flex-wrap items-center gap-3 mb-4">
            <Show when={props.entry.compareUrl}>
              <a
                href={props.entry.compareUrl}
                target="_blank"
                rel="noopener noreferrer"
                class="text-2xl font-bold text-[var(--text-primary)] hover:text-gradient transition-all font-mono"
              >
                v{props.entry.version}
              </a>
            </Show>
            <Show when={!props.entry.compareUrl}>
              <span class="text-2xl font-bold text-[var(--text-primary)] font-mono">
                v{props.entry.version}
              </span>
            </Show>
            <span class="text-sm text-[var(--text-muted)]">
              {formatDate(props.entry.date)}
            </span>
          </div>

          {/* Sections */}
          <div class="space-y-6">
            <For each={props.entry.sections}>
              {(section) => (
                <div class="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-5 hover:border-[var(--border-hover)] transition-all duration-300">
                  {/* Section header */}
                  <div class="flex items-center gap-2 mb-4">
                    <span class="text-lg">{section.emoji}</span>
                    <Badge variant={sectionBadgeVariants[section.type]}>
                      {section.title.replace(/^[^\s]+\s/, "")}
                    </Badge>
                  </div>

                  {/* Items */}
                  <ul class="space-y-2">
                    <For each={section.items}>
                      {(item) => (
                        <li class="flex items-start gap-2 text-[var(--text-secondary)]">
                          <span class="text-indigo-400 mt-1.5 shrink-0">•</span>
                          <span class="leading-relaxed">
                            {item.message}
                            <Show when={item.commitHash && item.commitUrl}>
                              <a
                                href={item.commitUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="ml-2 text-xs font-mono text-[var(--text-muted)] hover:text-indigo-400 transition-colors"
                              >
                                ({item.commitHash?.slice(0, 7)})
                              </a>
                            </Show>
                          </span>
                        </li>
                      )}
                    </For>
                  </ul>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
    </FadeIn>
  );
};
