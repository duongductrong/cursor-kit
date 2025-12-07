import { FeatureCard } from "@/components/feature-card";
import {
  FileText,
  BookOpen,
  GraduationCap,
  RefreshCw,
  Target,
  Layers,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Commands",
    description:
      "Reusable prompt templates for docs, explain, fix, implement, refactor, review, and test.",
  },
  {
    icon: BookOpen,
    title: "Rules",
    description:
      "Project-specific AI behavior guidelines like coding-style and git conventions.",
  },
  {
    icon: GraduationCap,
    title: "Skills",
    description:
      "Comprehensive guides with references for aesthetic, frontend, backend, and more.",
  },
  {
    icon: RefreshCw,
    title: "Sync",
    description:
      "Pull the latest updates from the cursor-kit community repository anytime.",
  },
  {
    icon: Target,
    title: "Multi-Target",
    description:
      "Support for both Cursor IDE and GitHub Copilot with one unified toolkit.",
  },
  {
    icon: Layers,
    title: "Multi-Instance",
    description:
      "Run multiple Cursor accounts simultaneously on macOS with separate data.",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="border-b border-border/50 bg-gradient-to-b from-background/0 via-background to-background py-16 md:py-24 relative"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-4 text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need
          </h2>
          <p className="max-w-xl text-lg text-muted-foreground">
            A complete toolkit for managing AI-powered IDE configurations.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
