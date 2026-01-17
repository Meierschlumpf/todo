"use client";

import { useState } from "react";
import type { Todo, Category } from "@/db/schema";
import { CategoryBadge } from "./category-badge";
import { PriorityIndicator } from "./priority-indicator";
import { SubtaskList } from "./subtask-list";
import { TodoForm } from "./todo-form";
import { formatDate, isOverdue } from "@/lib/utils";
import { deleteTodo, getSubtasks, toggleTodoComplete, updateTodoCategory } from "@/actions/todos";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface TodoItemProps {
  todo: Todo;
  categories: Category[];
  allTodos?: Todo[]; // For edit form parent selection
}

export function TodoItem({ todo, categories, allTodos = [] }: TodoItemProps) {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showCategorySelect, setShowCategorySelect] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const queryClient = useQueryClient();
  
  const category = todo.categoryId 
    ? categories.find((c) => c.id === todo.categoryId) || null
    : null;

  // Fetch subtasks count
  const { data: subtasks = [] } = useQuery({
    queryKey: ["subtasks", todo.id],
    queryFn: () => getSubtasks(todo.id),
  });

  const subtasksCount = subtasks.length;

  // Toggle complete mutation
  const toggleMutation = useMutation({
    mutationFn: () => toggleTodoComplete(todo.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["subtasks", todo.id] });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: (categoryId: string | null) => updateTodoCategory(todo.id, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setShowCategorySelect(false);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteTodo(todo.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      if (todo.parentId) {
        queryClient.invalidateQueries({ queryKey: ["subtasks", todo.parentId] });
      }
    },
  });

  const handleToggleComplete = () => {
    toggleMutation.mutate();
  };

  const handleUpdateCategory = (categoryId: string | null) => {
    updateCategoryMutation.mutate(categoryId);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={handleToggleComplete}
            disabled={toggleMutation.isPending}
            className="mt-1 h-5 w-5 min-w-5 rounded border-zinc-300 text-zinc-900 focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800"
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p
              className={`text-base ${
                todo.completed
                  ? "text-zinc-500 line-through dark:text-zinc-500"
                  : "text-zinc-900 dark:text-zinc-50"
              }`}
            >
              {todo.description}
            </p>

            {/* Metadata */}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              {/* Due date */}
              {todo.dueDate && (
                <span
                  className={`flex items-center gap-1 ${
                    isOverdue(todo.dueDate) && !todo.completed
                      ? "text-red-600 dark:text-red-400"
                      : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {isOverdue(todo.dueDate) && !todo.completed && "⚠️ "}
                  {formatDate(todo.dueDate)}
                </span>
              )}

              {/* Category */}
              {!showCategorySelect ? (
                <button
                  onClick={() => setShowCategorySelect(true)}
                  className="hover:opacity-80"
                >
                  <CategoryBadge category={category} />
                </button>
              ) : (
                <select
                  value={todo.categoryId || "none"}
                  onChange={(e) =>
                    handleUpdateCategory(e.target.value === "none" ? null : e.target.value)
                  }
                  onBlur={() => setShowCategorySelect(false)}
                  autoFocus
                  disabled={updateCategoryMutation.isPending}
                  className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                >
                  <option value="none">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}

              {/* Priority */}
              <PriorityIndicator priority={todo.priority} />

              {/* Recurrence indicator */}
              {todo.recurrenceIntervalDays && (
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  🔄 Every {todo.recurrenceIntervalDays} days
                </span>
              )}

              {/* Subtasks */}
              {subtasksCount > 0 && (
                <button
                  onClick={() => setShowSubtasks(!showSubtasks)}
                  className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  📋 {subtasksCount} subtask{subtasksCount !== 1 ? "s" : ""}
                </button>
              )}
            </div>

            {/* Notes */}
            {todo.notes && (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {todo.notes}
              </p>
            )}

            {/* Delete confirmation */}
            {showDeleteConfirm && (
              <div className="mt-3 rounded-md border border-red-300 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
                <p className="text-sm text-red-900 dark:text-red-200">
                  Are you sure you want to delete this todo? {subtasksCount > 0 && `This will also delete ${subtasksCount} subtask${subtasksCount !== 1 ? 's' : ''}.`}
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="rounded-md bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Yes, delete"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="rounded-md border border-zinc-300 px-3 py-1 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Expanded subtasks */}
            {showSubtasks && <SubtaskList parentId={todo.id} categories={categories} allTodos={allTodos} />}
          </div>

          {/* Action buttons - Desktop (hidden on mobile) */}
          <div className="hidden sm:flex items-start gap-1">
            <button
              onClick={() => setShowEditForm(true)}
              className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 transition-colors"
              title="Edit todo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleteMutation.isPending}
              className="rounded p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400 transition-colors disabled:opacity-50"
              title="Delete todo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Action buttons - Mobile (shown on mobile) */}
          <div className="flex sm:hidden items-start gap-1">
            <button
              onClick={() => setShowEditForm(true)}
              className="rounded p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 transition-colors"
              title="Edit"
            >
              <span className="text-sm">✏️</span>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleteMutation.isPending}
              className="rounded p-1 text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400 transition-colors disabled:opacity-50"
              title="Delete"
            >
              <span className="text-sm">🗑️</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <TodoForm
          categories={categories}
          todos={allTodos}
          onClose={() => setShowEditForm(false)}
          editTodo={todo}
        />
      )}
    </>
  );
}
