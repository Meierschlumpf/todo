"use client";

import { getSubtasks, getTodos } from "@/actions/todos";
import { getCategories } from "@/actions/categories";
import { Filters } from "@/components/filters";
import { Header } from "@/components/header";
import { TodoForm } from "@/components/todo-form";
import { TodoItem } from "@/components/todo-item";
import { CategoriesManager } from "@/components/categories-manager";
import type { Todo } from "@/db/schema";
import type { TodoFilters } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";

export default function TodoList() {
  const [filters, setFilters] = useState<TodoFilters>({
    categoryId: null,
    priority: "all",
    dueDate: "all",
    showCompleted: false,
  });

  const [showForm, setShowForm] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // Fetch todos with useQuery
  const { data, isLoading } = useQuery({
    queryKey: ["todos", filters],
    queryFn: () => getTodos({
      showCompleted: filters.showCompleted,
      categoryId: filters.categoryId === "none" ? "none" : filters.categoryId,
      priority: filters.priority,
      dueDate: filters.dueDate,
    }),
  });

  const withDueDate = data?.withDueDate || [];
  const withoutDueDate = data?.withoutDueDate || [];
  const allTodos = [...withDueDate, ...withoutDueDate];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <Filters
        filters={filters}
        categories={categories}
        onFiltersChange={setFilters}
      />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            + New Todo
          </button>
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {showCategories ? "Hide Categories" : "Manage Categories"}
          </button>
        </div>

        {/* Categories Manager */}
        {showCategories && (
          <div className="mb-6">
            <CategoriesManager />
          </div>
        )}

        {isLoading ? (
          <div className="text-center text-zinc-500 dark:text-zinc-400">
            Loading todos...
          </div>
        ) : (
          <>
            {/* Todos with due date */}
            {withDueDate.length > 0 && (
              <section className="mb-8">
                <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  📅 With Due Date
                </h2>
                <div className="space-y-3">
                  {withDueDate.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      categories={categories}
                      allTodos={allTodos}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Todos without due date */}
            {withoutDueDate.length > 0 && (
              <section>
                <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  📋 No Due Date
                </h2>
                <div className="space-y-3">
                  {withoutDueDate.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      categories={categories}
                      allTodos={allTodos}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {withDueDate.length === 0 && withoutDueDate.length === 0 && (
              <div className="rounded-lg border-2 border-dashed border-zinc-300 py-12 text-center dark:border-zinc-700">
                <p className="text-zinc-500 dark:text-zinc-400">
                  No todos found. Create your first todo to get started!
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Todo Form Modal */}
      {showForm && (
        <TodoForm
          categories={categories}
          todos={allTodos.filter((t) => !t.completed && !t.parentId)}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
