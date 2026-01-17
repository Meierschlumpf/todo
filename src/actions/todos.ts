"use server";

import { db } from "@/db";
import { todos } from "@/db/schema";
import { requireAuth } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { eq, and, isNull, desc, asc } from "drizzle-orm";
import { addDaysToDate } from "@/lib/utils";
import type { Priority } from "@/types";

export async function createTodo(data: {
  description: string;
  dueDate: string | null;
  categoryId: string | null;
  priority: Priority;
  notes: string | null;
  parentId: number | null;
  recurrenceIntervalDays: number | null;
}) {
  const session = await requireAuth();

  const now = new Date();

  await db.insert(todos).values({
    userId: session.user.id,
    description: data.description,
    dueDate: data.dueDate,
    categoryId: data.categoryId,
    priority: data.priority,
    notes: data.notes,
    parentId: data.parentId,
    recurrenceIntervalDays: data.recurrenceIntervalDays,
    completed: false,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/");
}

export async function toggleTodoComplete(todoId: number) {
  const session = await requireAuth();

  // Get the todo
  const todo = await db.query.todos.findFirst({
    where: and(eq(todos.id, todoId), eq(todos.userId, session.user.id)),
  });

  if (!todo) {
    throw new Error("Todo not found");
  }

  const now = new Date();
  const newCompletedState = !todo.completed;

  // Update the todo
  await db
    .update(todos)
    .set({
      completed: newCompletedState,
      completedAt: newCompletedState ? now : null,
      updatedAt: now,
    })
    .where(eq(todos.id, todoId));

  // If marking as complete and has recurrence, create new todo
  if (newCompletedState && todo.recurrenceIntervalDays && todo.dueDate) {
    const newDueDate = addDaysToDate(todo.dueDate, todo.recurrenceIntervalDays);

    await db.insert(todos).values({
      userId: session.user.id,
      description: todo.description,
      dueDate: newDueDate,
      categoryId: todo.categoryId,
      priority: todo.priority,
      notes: todo.notes,
      parentId: null, // Don't copy parent relationship
      recurrenceIntervalDays: todo.recurrenceIntervalDays,
      completed: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  revalidatePath("/");
}

export async function updateTodoCategory(todoId: number, categoryId: string | null) {
  const session = await requireAuth();

  await db
    .update(todos)
    .set({
      categoryId,
      updatedAt: new Date(),
    })
    .where(and(eq(todos.id, todoId), eq(todos.userId, session.user.id)));

  revalidatePath("/");
}

export async function getTodos(filters: {
  showCompleted: boolean;
  categoryId?: string | null;
  priority?: Priority | "all";
  dueDate?: "all" | "overdue" | "today" | "week" | "later" | "none";
}) {
  const session = await requireAuth();

  // Build where conditions
  const conditions = [eq(todos.userId, session.user.id)];

  if (!filters.showCompleted) {
    conditions.push(eq(todos.completed, false));
  }

  if (filters.categoryId) {
    if (filters.categoryId === "none") {
      conditions.push(isNull(todos.categoryId));
    } else {
      conditions.push(eq(todos.categoryId, filters.categoryId));
    }
  }

  if (filters.priority && filters.priority !== "all") {
    conditions.push(eq(todos.priority, filters.priority));
  }

  // Fetch todos
  const allTodos = await db.query.todos.findMany({
    where: and(...conditions),
  });

  // Apply due date filter
  let filteredTodos = allTodos;
  if (filters.dueDate && filters.dueDate !== "all") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    const weekStr = weekFromNow.toISOString().split("T")[0];

    filteredTodos = allTodos.filter((todo) => {
      if (filters.dueDate === "none") {
        return !todo.dueDate;
      }
      if (!todo.dueDate) return false;

      if (filters.dueDate === "overdue") {
        return todo.dueDate < todayStr;
      }
      if (filters.dueDate === "today") {
        return todo.dueDate === todayStr;
      }
      if (filters.dueDate === "week") {
        return todo.dueDate >= todayStr && todo.dueDate <= weekStr;
      }
      if (filters.dueDate === "later") {
        return todo.dueDate > weekStr;
      }
      return true;
    });
  }

  // Split into two groups
  const withDueDate = filteredTodos
    .filter((t) => t.dueDate !== null)
    .sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return a.dueDate.localeCompare(b.dueDate);
    });

  const withoutDueDate = filteredTodos
    .filter((t) => t.dueDate === null)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return { withDueDate, withoutDueDate };
}

export async function getSubtasks(parentId: number) {
  const session = await requireAuth();

  const subtasks = await db.query.todos.findMany({
    where: and(eq(todos.parentId, parentId), eq(todos.userId, session.user.id)),
    orderBy: [asc(todos.createdAt)],
  });

  return subtasks;
}

export async function updateTodo(
  todoId: number,
  data: {
    description: string;
    dueDate: string | null;
    categoryId: string | null;
    priority: Priority;
    notes: string | null;
    recurrenceIntervalDays: number | null;
  }
) {
  const session = await requireAuth();

  await db
    .update(todos)
    .set({
      description: data.description,
      dueDate: data.dueDate,
      categoryId: data.categoryId,
      priority: data.priority,
      notes: data.notes,
      recurrenceIntervalDays: data.recurrenceIntervalDays,
      updatedAt: new Date(),
    })
    .where(and(eq(todos.id, todoId), eq(todos.userId, session.user.id)));

  revalidatePath("/");
}

export async function deleteTodo(todoId: number) {
  const session = await requireAuth();

  // Delete the todo and all its subtasks
  // First, get all subtasks
  const subtasks = await db.query.todos.findMany({
    where: and(eq(todos.parentId, todoId), eq(todos.userId, session.user.id)),
  });

  // Delete all subtasks
  for (const subtask of subtasks) {
    await db
      .delete(todos)
      .where(and(eq(todos.id, subtask.id), eq(todos.userId, session.user.id)));
  }

  // Delete the parent todo
  await db
    .delete(todos)
    .where(and(eq(todos.id, todoId), eq(todos.userId, session.user.id)));

  revalidatePath("/");
}
