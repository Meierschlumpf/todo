export interface Category {
  id: string;
  name: string;
  color: string;
}

export type Priority = "high" | "medium" | "low";

export interface TodoFilters {
  categoryId: string | null; // null = all, "none" = no category
  priority: "all" | Priority;
  dueDate: "all" | "overdue" | "today" | "week" | "later" | "none";
  showCompleted: boolean;
}
