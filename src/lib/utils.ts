import { format, isToday, isAfter, isBefore, startOfDay, addDays, parseISO } from "date-fns";

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy");
}

export function isOverdue(dueDate: string): boolean {
  const today = startOfDay(new Date());
  const due = parseISO(dueDate);
  return isBefore(due, today);
}

export function isDueToday(dueDate: string): boolean {
  const due = parseISO(dueDate);
  return isToday(due);
}

export function isDueThisWeek(dueDate: string): boolean {
  const today = startOfDay(new Date());
  const weekFromNow = addDays(today, 7);
  const due = parseISO(dueDate);
  return isAfter(due, today) && isBefore(due, weekFromNow);
}

export function addDaysToDate(date: string, days: number): string {
  const d = parseISO(date);
  const newDate = addDays(d, days);
  return format(newDate, "yyyy-MM-dd");
}
