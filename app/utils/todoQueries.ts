import type { Todo, TodoFilter, TodoPriority, TodoSort } from "../types/todo";
import { toDateInputValue } from "./todoSections";

const priorityRank: Record<TodoPriority, number> = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
};

/**
 * Filters Todos by the selected filter.
 *
 * @param todos Todos to filter.
 * @param filter Selected filter.
 * @returns Filtered Todos.
 */
export function filterTodos(todos: Todo[], filter: TodoFilter) {
  if (filter === "active") {
    return todos.filter((todo) => !todo.completed);
  }

  if (filter === "completed") {
    return todos.filter((todo) => todo.completed);
  }

  if (filter === "today") {
    const today = toDateInputValue(new Date());

    return todos.filter((todo) => todo.dueDate === today || todo.repeat === "daily");
  }

  if (filter === "scheduled") {
    return todos.filter((todo) => todo.dueDate.length > 0 && !todo.completed);
  }

  return todos;
}

/**
 * Searches Todos by title, memo, tags, and subtask titles.
 *
 * @param todos Todos to search.
 * @param query Search query.
 * @returns Matching Todos.
 */
export function searchTodos(todos: Todo[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length === 0) {
    return todos;
  }

  return todos.filter((todo) => {
    const searchableText = [
      todo.title,
      todo.memo,
      ...todo.tags,
      ...todo.subtasks.map((subtask) => subtask.title),
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}

/**
 * Sorts Todos by the selected sort option.
 *
 * @param todos Todos to sort.
 * @param sort Selected sort option.
 * @returns Sorted Todos.
 */
export function sortTodos(todos: Todo[], sort: TodoSort) {
  const sortedTodos = [...todos];
  const compareByPriorityThenCreated = (a: Todo, b: Todo) =>
    priorityRank[b.priority] - priorityRank[a.priority] || a.id - b.id;

  if (sort === "dueDate") {
    return sortedTodos.sort((a, b) => {
      if (a.dueDate.length === 0 && b.dueDate.length === 0) {
        return a.id - b.id;
      }

      if (a.dueDate.length === 0) {
        return 1;
      }

      if (b.dueDate.length === 0) {
        return -1;
      }

      return a.dueDate.localeCompare(b.dueDate) || a.id - b.id;
    });
  }

  if (sort === "priority") {
    return sortedTodos.sort(compareByPriorityThenCreated);
  }

  return sortedTodos.sort(compareByPriorityThenCreated);
}
