import type { Category } from "@/db/schema";

interface CategoryBadgeProps {
  category: Category | null;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  if (!category) {
    return (
      <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
        No category
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-white"
      style={{ backgroundColor: category.color }}
    >
      {category.name}
    </span>
  );
}
