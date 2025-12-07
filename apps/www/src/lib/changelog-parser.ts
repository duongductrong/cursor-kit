import changelogRaw from "../../../../CHANGELOG.md?raw";

export interface ChangelogItem {
  message: string;
  commitUrl?: string;
  commitHash?: string;
}

export interface ChangelogSection {
  type: "feature" | "fix" | "docs" | "refactor" | "chore" | "breaking";
  title: string;
  emoji: string;
  items: ChangelogItem[];
}

export interface ChangelogEntry {
  version: string;
  date: string;
  compareUrl?: string;
  sections: ChangelogSection[];
}

const SECTION_MAP: Record<
  string,
  { type: ChangelogSection["type"]; emoji: string }
> = {
  "🚀 Features": { type: "feature", emoji: "🚀" },
  Features: { type: "feature", emoji: "🚀" },
  "🐛 Bug Fixes": { type: "fix", emoji: "🐛" },
  "Bug Fixes": { type: "fix", emoji: "🐛" },
  "📚 Documentation": { type: "docs", emoji: "📚" },
  "♻️ Code Refactoring": { type: "refactor", emoji: "♻️" },
  "🏠 Chores": { type: "chore", emoji: "🏠" },
  "⚠️ Breaking Changes": { type: "breaking", emoji: "⚠️" },
};

function parseChangelogItem(line: string): ChangelogItem | null {
  // Match: * message ([hash](url)) or * feat(scope): message ([hash](url))
  const commitMatch = line.match(
    /^\*\s+(.+?)\s+\(\[([a-f0-9]+)\]\(([^)]+)\)\)$/
  );
  if (commitMatch) {
    return {
      message: commitMatch[1].trim(),
      commitHash: commitMatch[2],
      commitUrl: commitMatch[3],
    };
  }

  // Match simple: * message
  const simpleMatch = line.match(/^\*\s+(.+)$/);
  if (simpleMatch) {
    return {
      message: simpleMatch[1].trim(),
    };
  }

  return null;
}

function parseChangelog(markdown: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  const lines = markdown.split("\n");

  let currentEntry: ChangelogEntry | null = null;
  let currentSection: ChangelogSection | null = null;

  for (const line of lines) {
    // Match version header: ## [1.4.0](url) (2025-12-07)
    const versionMatch = line.match(
      /^## \[([^\]]+)\]\(([^)]+)\)\s+\((\d{4}-\d{2}-\d{2})\)/
    );
    if (versionMatch) {
      if (currentEntry) {
        if (currentSection && currentSection.items.length > 0) {
          currentEntry.sections.push(currentSection);
        }
        entries.push(currentEntry);
      }
      currentEntry = {
        version: versionMatch[1],
        compareUrl: versionMatch[2],
        date: versionMatch[3],
        sections: [],
      };
      currentSection = null;
      continue;
    }

    // Match version without URL: ## 1.0.0 (2025-11-29)
    const simpleVersionMatch = line.match(
      /^## ([^\s]+)\s+\((\d{4}-\d{2}-\d{2})\)/
    );
    if (simpleVersionMatch && !versionMatch) {
      if (currentEntry) {
        if (currentSection && currentSection.items.length > 0) {
          currentEntry.sections.push(currentSection);
        }
        entries.push(currentEntry);
      }
      currentEntry = {
        version: simpleVersionMatch[1],
        date: simpleVersionMatch[2],
        sections: [],
      };
      currentSection = null;
      continue;
    }

    // Match section header: ### 🚀 Features
    const sectionMatch = line.match(/^### (.+)$/);
    if (sectionMatch && currentEntry) {
      if (currentSection && currentSection.items.length > 0) {
        currentEntry.sections.push(currentSection);
      }
      const sectionTitle = sectionMatch[1].trim();
      const sectionInfo = SECTION_MAP[sectionTitle] || {
        type: "chore" as const,
        emoji: "📝",
      };
      currentSection = {
        type: sectionInfo.type,
        title: sectionTitle,
        emoji: sectionInfo.emoji,
        items: [],
      };
      continue;
    }

    // Match changelog item
    if (line.startsWith("*") && currentSection) {
      const item = parseChangelogItem(line);
      if (item) {
        currentSection.items.push(item);
      }
    }
  }

  // Push last entry and section
  if (currentEntry) {
    if (currentSection && currentSection.items.length > 0) {
      currentEntry.sections.push(currentSection);
    }
    entries.push(currentEntry);
  }

  // Filter out beta releases
  return entries.filter((entry) => !entry.version.includes("beta"));
}

export const changelog: ChangelogEntry[] = parseChangelog(changelogRaw);

export function getLatestVersion(): string {
  return changelog[0]?.version ?? "1.0.0";
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
