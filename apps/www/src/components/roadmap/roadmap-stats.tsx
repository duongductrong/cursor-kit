import { Card } from "@/components/ui/card";
import { getRoadmapStats } from "@/lib/roadmap";
import { CheckCircle2, Clock, Lightbulb, TrendingUp } from "lucide-react";

export function RoadmapStats() {
  const stats = getRoadmapStats();

  const statItems = [
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Planned",
      value: stats.planned,
      icon: Lightbulb,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Completion",
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {statItems.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-primary/5"
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            {/* Gradient background */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative p-6">
              <div className="mb-3 flex items-center justify-between">
                <div
                  className={`flex size-10 items-center justify-center rounded-lg ${stat.bgColor} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className={`size-5 ${stat.color}`} />
                </div>
              </div>
              <div>
                <p className="mb-1 text-3xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>

            {/* Progress bar (only for completion) */}
            {stat.label === "Completion" && (
              <div className="h-1 w-full bg-muted">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-1000"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

