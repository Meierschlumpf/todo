"use client";

import type { TodoFilters, Priority } from "@/types";
import type { Category } from "@/db/schema";

interface FiltersProps {
  filters: TodoFilters;
  categories: Category[];
  onFiltersChange: (filters: TodoFilters) => void;
}

export function Filters({ filters, categories, onFiltersChange }: FiltersProps) {
  return (
    <div className="border-b border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left side filters */}
          <div className="flex flex-wrap gap-2">
            {/* Category filter */}
            <select
              value={filters.categoryId || "all"}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  categoryId: e.target.value === "all" ? null : e.target.value,
                })
              }
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            >
              <option value="all">All categories</option>
              <option value="none">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Priority filter */}
            <select
              value={filters.priority}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  priority: e.target.value as typeof filters.priority,
                })
              }
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            >
              <option value="all">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Due date filter */}
            <select
              value={filters.dueDate}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  dueDate: e.target.value as typeof filters.dueDate,
                })
              }
              className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            >
              <option value="all">All dates</option>
              <option value="overdue">Overdue</option>
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="later">Later</option>
              <option value="none">No due date</option>
            </select>
          </div>

          {/* Right side - show completed toggle */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.showCompleted}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  showCompleted: e.target.checked,
                })
              }
              className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800"
            />
            <span className="text-zinc-700 dark:text-zinc-300">
              Show completed
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
