import { Card } from "@/components/ui/card";
import {
  getCategoryColor,
  getPriorityIcon,
  getStatusColor,
  type RoadmapItem,
} from "@/lib/roadmap";

interface RoadmapCardProps {
  item: RoadmapItem;
  index: number;
}

export function RoadmapCard({ item, index }: RoadmapCardProps) {
  const Icon = item.icon;

  return (
    <Card
      className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-border hover:bg-card hover:shadow-lg hover:shadow-primary/5"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Gradient overlay on hover */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Content */}
      <div className="relative p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
              <Icon className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              {item.version && (
                <p className="text-xs text-muted-foreground">{item.version}</p>
              )}
            </div>
          </div>
          <span className="text-xl" title={`${item.priority} priority`}>
            {getPriorityIcon(item.priority)}
          </span>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>

        {/* Footer */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors ${getStatusColor(item.status)}`}
          >
            {item.status === "in-progress" && (
              <span className="mr-1.5 size-1.5 animate-pulse rounded-full bg-current" />
            )}
            {item.status.replace("-", " ")}
          </span>
          <span
            className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors ${getCategoryColor(item.category)}`}
          >
            {item.category.replace("-", " ")}
          </span>
          {item.quarter && (
            <span className="ml-auto text-xs text-muted-foreground">
              {item.quarter}
            </span>
          )}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-primary/50 via-primary to-primary/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </Card>
  );
}

