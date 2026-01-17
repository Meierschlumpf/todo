import type { Priority } from "@/types";

interface PriorityIndicatorProps {
  priority: Priority;
}

export function PriorityIndicator({ priority }: PriorityIndicatorProps) {
  const colors = {
    high: "text-red-600 dark:text-red-400",
    medium: "text-yellow-600 dark:text-yellow-400",
    low: "text-green-600 dark:text-green-400",
  };

  const labels = {
    high: "High",
    medium: "Medium",
    low: "Low",
  };

  return (
    <span className={`text-xs font-medium ${colors[priority]}`}>
      {labels[priority]}
    </span>
  );
}
