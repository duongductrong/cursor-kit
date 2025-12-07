import { ChangelogEntry } from "./changelog-entry";
import type { ChangelogEntry as EntryType } from "@/lib/changelog";

interface ChangelogSectionProps {
  entries: EntryType[];
}

export function ChangelogSection({ entries }: ChangelogSectionProps) {
  return (
    <section className="bg-gradient-to-b from-background/60 via-background to-background py-16 md:py-24 relative">
      <div className="mx-auto max-w-3xl px-6">
        <div className="space-y-0">
          {entries.map((entry, index) => (
            <ChangelogEntry
              key={entry.version}
              entry={entry}
              isLatest={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
