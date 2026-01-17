"use client";

import type { Todo, Category } from "@/db/schema";
import { TodoItem } from "./todo-item";
import { getSubtasks } from "@/actions/todos";
import { useQuery } from "@tanstack/react-query";

interface SubtaskListProps {
  parentId: number;
  categories: Category[];
  allTodos?: Todo[];
}

export function SubtaskList({ parentId, categories, allTodos = [] }: SubtaskListProps) {
  const { data: subtasks = [], isLoading } = useQuery({
    queryKey: ["subtasks", parentId],
    queryFn: () => getSubtasks(parentId),
  });

  if (isLoading) {
    return (
      <div className="mt-3 pl-8 text-sm text-zinc-500 dark:text-zinc-400">
        Loading subtasks...
      </div>
    );
  }

  if (subtasks.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2 border-l-2 border-zinc-200 pl-4 dark:border-zinc-700">
      {subtasks.map((subtask) => (
        <TodoItem key={subtask.id} todo={subtask} categories={categories} allTodos={allTodos} />
      ))}
    </div>
  );
}
