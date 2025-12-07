import { Footer } from "@/components/sections/footer";
import { Header } from "@/components/sections/header";
import { getStatusColor, roadmapItems, type RoadmapItem } from "@/lib/roadmap";
import { CheckCircle2, Circle, Loader2, Map } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmap - Cursor Kit",
  description:
    "Explore our vision for the future of Cursor Kit. See what we're building, what's in progress, and what's coming next.",
};

function StatusIcon({ status }: { status: RoadmapItem["status"] }) {
  if (status === "completed") {
    return <CheckCircle2 className="size-5 text-green-500" />;
  }
  if (status === "in-progress") {
    return <Loader2 className="size-5 animate-spin text-blue-500" />;
  }
  return <Circle className="size-5 text-muted-foreground" />;
}

function RoadmapRow({ item }: { item: RoadmapItem }) {
  const Icon = item.icon;

  return (
    <div className="group flex items-start gap-4 rounded-lg p-4 transition-colors hover:bg-muted/50">
      <div className="mt-0.5">
        <StatusIcon status={item.status} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <Icon className="size-4 text-muted-foreground" />
          <h3 className="font-medium text-foreground">{item.title}</h3>
          {item.version && (
            <span className="text-xs text-muted-foreground">
              {item.version}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-1">
          {item.description}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`hidden sm:inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusColor(
            item.status
          )}`}
        >
          {item.status.replace("-", " ")}
        </span>
        {item.quarter && (
          <span className="text-xs text-muted-foreground">{item.quarter}</span>
        )}
      </div>
    </div>
  );
}

export default function RoadmapPage() {
  const inProgress = roadmapItems.filter(
    (item) => item.status === "in-progress"
  );
  const planned = roadmapItems.filter((item) => item.status === "planned");
  const completed = roadmapItems.filter((item) => item.status === "completed");

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 relative">
        <section className="relative overflow-hidden">
          <div className="relative mx-auto max-w-6xl px-6 py-24">
            <div className="text-center">
              <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-primary/10 p-4">
                <Map className="size-10 text-primary" />
              </div>

              <h1 className="mb-4 bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl">
                Roadmap
              </h1>

              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
                Track our progress and see what&apos;s coming next for Cursor
                Kit.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-background py-16">
          <div className="mx-auto max-w-3xl px-6">
            {inProgress.length > 0 && (
              <div className="mb-12">
                <div className="mb-4 flex items-center gap-2">
                  <div className="size-2 animate-pulse rounded-full bg-blue-500" />
                  <h2 className="text-lg font-semibold text-foreground">
                    In Progress
                  </h2>
                </div>
                <div className="divide-y divide-border/50 rounded-xl border border-border/50 bg-card/50">
                  {inProgress.map((item) => (
                    <RoadmapRow key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {planned.length > 0 && (
              <div className="mb-12">
                <div className="mb-4 flex items-center gap-2">
                  <div className="size-2 rounded-full bg-muted-foreground" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Planned
                  </h2>
                </div>
                <div className="divide-y divide-border/50 rounded-xl border border-border/50 bg-card/50">
                  {planned.map((item) => (
                    <RoadmapRow key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {completed.length > 0 && (
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <div className="size-2 rounded-full bg-green-500" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Completed
                  </h2>
                </div>
                <div className="divide-y divide-border/50 rounded-xl border border-border/50 bg-card/50">
                  {completed.map((item) => (
                    <RoadmapRow key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="border-t border-border/50 bg-muted/30 py-16">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="mb-3 text-2xl font-bold text-foreground">
              Have a feature request?
            </h2>
            <p className="mb-6 text-muted-foreground">
              We&apos;d love to hear your ideas. Join the discussion or open an
              issue.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://github.com/duongductrong/cursor-kit/discussions"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Join Discussions
              </a>
              <a
                href="https://github.com/duongductrong/cursor-kit/issues/new"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Request Feature
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
