import type { Todo } from "../types/todo";

export type TodoSectionId = "overdue" | "today" | "upcoming" | "noDueDate" | "completed";

export type TodoSection = {
  id: TodoSectionId;
  label: string;
  todos: Todo[];
};

const todoSectionLabels: Record<TodoSectionId, string> = {
  overdue: "期限切れ",
  today: "今日",
  upcoming: "明日以降",
  noDueDate: "期限なし",
  completed: "完了済み",
};

/**
 * Date inputs and Todo due dates share the same local YYYY-MM-DD format.
 *
 * @param date The date to convert.
 * @returns A local date string for date input comparison.
 */
export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Groups visible Todos into reminder-style date and completion sections.
 *
 * @param todos Todos after filtering, searching, and sorting.
 * @param currentDate Date used as the boundary for today.
 * @returns Sections in display order, including empty sections for stable headings.
 */
export function createTodoSections(todos: Todo[], currentDate = new Date()): TodoSection[] {
  const today = toDateInputValue(currentDate);
  const sections: Record<TodoSectionId, Todo[]> = {
    overdue: [],
    today: [],
    upcoming: [],
    noDueDate: [],
    completed: [],
  };

  for (const todo of todos) {
    if (todo.completed) {
      sections.completed.push(todo);
      continue;
    }

    if (todo.dueDate.length === 0) {
      sections.noDueDate.push(todo);
      continue;
    }

    if (todo.dueDate < today) {
      sections.overdue.push(todo);
      continue;
    }

    if (todo.dueDate === today) {
      sections.today.push(todo);
      continue;
    }

    sections.upcoming.push(todo);
  }

  return [
    { id: "overdue", label: todoSectionLabels.overdue, todos: sections.overdue },
    { id: "today", label: todoSectionLabels.today, todos: sections.today },
    { id: "upcoming", label: todoSectionLabels.upcoming, todos: sections.upcoming },
    { id: "noDueDate", label: todoSectionLabels.noDueDate, todos: sections.noDueDate },
    { id: "completed", label: todoSectionLabels.completed, todos: sections.completed },
  ];
}
