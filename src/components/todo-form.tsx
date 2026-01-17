"use client";

import { useState } from "react";
import { createTodo, updateTodo } from "@/actions/todos";
import type { Priority } from "@/types";
import type { Todo, Category } from "@/db/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface TodoFormProps {
  categories: Category[];
  todos: Todo[];
  onClose: () => void;
  editTodo?: Todo; // If provided, we're editing instead of creating
}

export function TodoForm({ categories, todos, onClose, editTodo }: TodoFormProps) {
  const [description, setDescription] = useState(editTodo?.description || "");
  const [dueDate, setDueDate] = useState(editTodo?.dueDate || "");
  const [categoryId, setCategoryId] = useState<string | null>(editTodo?.categoryId || null);
  const [priority, setPriority] = useState<Priority>(editTodo?.priority || "medium");
  const [notes, setNotes] = useState(editTodo?.notes || "");
  const [parentId, setParentId] = useState<number | null>(editTodo?.parentId || null);
  const [recurrenceIntervalDays, setRecurrenceIntervalDays] = useState(
    editTodo?.recurrenceIntervalDays?.toString() || ""
  );
  
  const queryClient = useQueryClient();
  const isEditing = !!editTodo;

  // Create todo mutation
  const createMutation = useMutation({
    mutationFn: (data: {
      description: string;
      dueDate: string | null;
      categoryId: string | null;
      priority: Priority;
      notes: string | null;
      parentId: number | null;
      recurrenceIntervalDays: number | null;
    }) => createTodo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      if (parentId) {
        queryClient.invalidateQueries({ queryKey: ["subtasks", parentId] });
      }
      onClose();
    },
  });

  // Update todo mutation
  const updateMutation = useMutation({
    mutationFn: (data: {
      description: string;
      dueDate: string | null;
      categoryId: string | null;
      priority: Priority;
      notes: string | null;
      recurrenceIntervalDays: number | null;
    }) => updateTodo(editTodo!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      if (editTodo?.parentId) {
        queryClient.invalidateQueries({ queryKey: ["subtasks", editTodo.parentId] });
      }
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const todoData = {
      description,
      dueDate: dueDate || null,
      categoryId: categoryId || null,
      priority,
      notes: notes || null,
      recurrenceIntervalDays: recurrenceIntervalDays
        ? parseInt(recurrenceIntervalDays)
        : null,
    };

    if (isEditing) {
      updateMutation.mutate(todoData);
    } else {
      createMutation.mutate({
        ...todoData,
        parentId,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {isEditing ? "Edit Todo" : "Create New Todo"}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Description *
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              placeholder="What needs to be done?"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Category
            </label>
            <select
              value={categoryId || ""}
              onChange={(e) => setCategoryId(e.target.value || null)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Priority
            </label>
            <div className="mt-2 flex gap-4">
              {["high", "medium", "low"].map((p) => (
                <label key={p} className="flex items-center gap-2">
                  <input
                    type="radio"
                    value={p}
                    checked={priority === p}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="text-zinc-900 focus:ring-2 focus:ring-zinc-900"
                  />
                  <span className="text-sm capitalize text-zinc-700 dark:text-zinc-300">
                    {p}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Parent Todo (for subtasks) */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Parent Todo (optional)
              </label>
              <select
                value={parentId || ""}
                onChange={(e) => setParentId(e.target.value ? parseInt(e.target.value) : null)}
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              >
                <option value="">None (standalone todo)</option>
                {todos
                  .filter((t) => !t.completed && !t.parentId)
                  .map((todo) => (
                    <option key={todo.id} value={todo.id}>
                      {todo.description.substring(0, 50)}
                      {todo.description.length > 50 ? "..." : ""}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              placeholder="Additional details..."
            />
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Repeat every (days)
            </label>
            <input
              type="number"
              min="1"
              value={recurrenceIntervalDays}
              onChange={(e) => setRecurrenceIntervalDays(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              placeholder="Leave empty for no repeat"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isPending ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save Changes" : "Create Todo")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
