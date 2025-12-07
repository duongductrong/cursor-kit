import {
  Sparkles,
  Zap,
  Box,
  Palette,
  Code2,
  Globe,
  Terminal,
  Settings,
  FileCode,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export type RoadmapStatus = "completed" | "in-progress" | "planned";
export type RoadmapPriority = "high" | "medium" | "low";
export type RoadmapCategory =
  | "features"
  | "performance"
  | "developer-experience"
  | "design"
  | "integration";

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: RoadmapStatus;
  priority: RoadmapPriority;
  category: RoadmapCategory;
  icon: LucideIcon;
  version?: string;
  quarter?: string;
}

export const roadmapItems: RoadmapItem[] = [
  // Completed
  {
    id: "1",
    title: "Core CLI Framework",
    description:
      "Built the foundational CLI with commands for init, add, list, and remove functionality.",
    status: "completed",
    priority: "high",
    category: "features",
    icon: Terminal,
    version: "v1.0",
    quarter: "Q4 2024",
  },
  {
    id: "2",
    title: "Template System",
    description:
      "Implemented reusable template system for commands, rules, and skills with manifest support.",
    status: "completed",
    priority: "high",
    category: "features",
    icon: FileCode,
    version: "v1.0",
    quarter: "Q4 2024",
  },
  {
    id: "3",
    title: "Multi-Instance Support",
    description:
      "Added ability to run multiple Cursor instances on macOS with separate user data.",
    status: "completed",
    priority: "medium",
    category: "features",
    icon: Box,
    version: "v1.1",
    quarter: "Q4 2024",
  },

  // In Progress
  {
    id: "4",
    title: "Interactive Template Builder",
    description:
      "Visual interface to create custom commands, rules, and skills without editing JSON manually.",
    status: "in-progress",
    priority: "high",
    category: "developer-experience",
    icon: Sparkles,
    version: "v2.0",
    quarter: "Q1 2025",
  },
  {
    id: "5",
    title: "Web Dashboard",
    description:
      "Modern web interface to browse, manage, and preview templates before installation.",
    status: "in-progress",
    priority: "high",
    category: "design",
    icon: Globe,
    version: "v2.0",
    quarter: "Q1 2025",
  },
  {
    id: "6",
    title: "Template Marketplace",
    description:
      "Community-driven marketplace for sharing and discovering custom templates and workflows.",
    status: "in-progress",
    priority: "medium",
    category: "integration",
    icon: Workflow,
    version: "v2.1",
    quarter: "Q1 2025",
  },

  // Planned
  {
    id: "7",
    title: "VS Code Extension",
    description:
      "Native VS Code extension for managing cursor-kit templates directly from the editor.",
    status: "planned",
    priority: "high",
    category: "integration",
    icon: Code2,
    version: "v2.2",
    quarter: "Q2 2025",
  },
  {
    id: "8",
    title: "AI-Powered Template Generator",
    description:
      "Use AI to automatically generate optimized templates based on your project structure and needs.",
    status: "planned",
    priority: "medium",
    category: "features",
    icon: Zap,
    version: "v3.0",
    quarter: "Q2 2025",
  },
  {
    id: "9",
    title: "Custom Theme Support",
    description:
      "Allow users to customize the visual appearance of templates with custom themes and styling.",
    status: "planned",
    priority: "low",
    category: "design",
    icon: Palette,
    version: "v3.0",
    quarter: "Q3 2025",
  },
  {
    id: "10",
    title: "Advanced Configuration",
    description:
      "Enhanced configuration system with environment-specific settings and team sharing capabilities.",
    status: "planned",
    priority: "medium",
    category: "developer-experience",
    icon: Settings,
    version: "v3.1",
    quarter: "Q3 2025",
  },
];

export const getRoadmapStats = () => {
  const completed = roadmapItems.filter((item) => item.status === "completed");
  const inProgress = roadmapItems.filter(
    (item) => item.status === "in-progress",
  );
  const planned = roadmapItems.filter((item) => item.status === "planned");

  return {
    total: roadmapItems.length,
    completed: completed.length,
    inProgress: inProgress.length,
    planned: planned.length,
    completionRate: Math.round((completed.length / roadmapItems.length) * 100),
  };
};

export const getRoadmapByStatus = (status: RoadmapStatus) =>
  roadmapItems.filter((item) => item.status === status);

export const getCategoryColor = (category: RoadmapCategory) => {
  const colors: Record<RoadmapCategory, string> = {
    features: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    performance: "bg-green-500/10 text-green-500 border-green-500/20",
    "developer-experience":
      "bg-purple-500/10 text-purple-500 border-purple-500/20",
    design: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    integration: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  };
  return colors[category];
};

export const getStatusColor = (status: RoadmapStatus) => {
  const colors: Record<RoadmapStatus, string> = {
    completed: "bg-green-500/10 text-green-500 border-green-500/20",
    "in-progress": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    planned: "bg-muted text-muted-foreground border-border",
  };
  return colors[status];
};

export const getPriorityIcon = (priority: RoadmapPriority) => {
  const icons: Record<RoadmapPriority, string> = {
    high: "🔴",
    medium: "🟡",
    low: "🟢",
  };
  return icons[priority];
};

