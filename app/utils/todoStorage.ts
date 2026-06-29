import { normalizeTag } from "./tags";
import type { Todo, TodoPriority, TodoRepeat, TodoSort, TodoSubtask } from "../types/todo";

export type TodoTheme = "light" | "dark";

const todoStorageKey = "todo-app.todos";
const todoSortStorageKey = "todo-app.sort";
const todoThemeStorageKey = "todo-app.theme";

/**
 * Checks whether a stored value can be used as a Todo priority.
 *
 * @param value Stored value to check.
 * @returns True when the value is a supported Todo priority.
 */
function isTodoPriority(value: unknown): value is TodoPriority {
  return value === "none" || value === "low" || value === "medium" || value === "high";
}

/**
 * Checks whether a stored value can be used as a Todo repeat setting.
 *
 * @param value Stored value to check.
 * @returns True when the value is a supported Todo repeat setting.
 */
function isTodoRepeat(value: unknown): value is TodoRepeat {
  return value === "none" || value === "daily" || value === "weekly" || value === "monthly";
}

/**
 * Checks whether a stored value can be used as a Todo sort setting.
 *
 * @param value Stored value to check.
 * @returns True when the value is a supported Todo sort setting.
 */
function isTodoSort(value: unknown): value is TodoSort {
  return value === "created" || value === "dueDate" || value === "priority";
}

/**
 * Checks whether a stored value can be used as a Todo theme setting.
 *
 * @param value Stored value to check.
 * @returns True when the value is a supported Todo theme setting.
 */
function isTodoTheme(value: unknown): value is TodoTheme {
  return value === "light" || value === "dark";
}

/**
 * Normalizes a stored Todo into the current Todo shape.
 *
 * @param value Stored value to normalize.
 * @returns A normalized Todo, or null when the stored value is invalid.
 */
function normalizeStoredTodo(value: unknown): Todo | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const todo = value as Partial<Todo>;

  if (
    typeof todo.id !== "number" ||
    typeof todo.title !== "string" ||
    typeof todo.completed !== "boolean"
  ) {
    return null;
  }

  const subtasks: TodoSubtask[] = [];

  if (Array.isArray(todo.subtasks)) {
    for (const value of todo.subtasks) {
      if (typeof value !== "object" || value === null) {
        continue;
      }

      const subtask = value as Partial<TodoSubtask>;

      if (
        typeof subtask.id === "number" &&
        typeof subtask.title === "string" &&
        typeof subtask.completed === "boolean"
      ) {
        subtasks.push({
          id: subtask.id,
          title: subtask.title,
          completed: subtask.completed,
        });
      }
    }
  }

  return {
    id: todo.id,
    title: todo.title,
    memo: typeof todo.memo === "string" ? todo.memo : "",
    dueDate: typeof todo.dueDate === "string" ? todo.dueDate : "",
    priority: isTodoPriority(todo.priority) ? todo.priority : "none",
    repeat: isTodoRepeat(todo.repeat) ? todo.repeat : "none",
    tags: Array.isArray(todo.tags)
      ? todo.tags
          .filter((tag): tag is string => typeof tag === "string")
          .map(normalizeTag)
          .filter((tag) => tag.length > 0)
      : [],
    subtasks,
    completed: todo.completed,
  };
}

/**
 * Loads Todos from localStorage.
 *
 * @param fallbackTodos Todos to use when storage is unavailable or invalid.
 * @returns Stored Todos, or fallback Todos.
 */
export function loadTodosFromStorage(fallbackTodos: Todo[]) {
  if (typeof window === "undefined") {
    return fallbackTodos;
  }

  const storedTodos = window.localStorage.getItem(todoStorageKey);

  if (storedTodos === null) {
    return fallbackTodos;
  }

  try {
    const parsedTodos: unknown = JSON.parse(storedTodos);

    if (!Array.isArray(parsedTodos)) {
      return fallbackTodos;
    }

    const normalizedTodos: Todo[] = [];

    for (const parsedTodo of parsedTodos) {
      const normalizedTodo = normalizeStoredTodo(parsedTodo);

      if (normalizedTodo === null) {
        return fallbackTodos;
      }

      normalizedTodos.push(normalizedTodo);
    }

    return normalizedTodos;
  } catch {
    return fallbackTodos;
  }
}

/**
 * Loads the Todo sort setting from localStorage.
 *
 * @param fallbackSort Sort setting to use when storage is unavailable or invalid.
 * @returns Stored sort setting, or fallback sort setting.
 */
export function loadSortFromStorage(fallbackSort: TodoSort) {
  if (typeof window === "undefined") {
    return fallbackSort;
  }

  const storedSort = window.localStorage.getItem(todoSortStorageKey);

  return isTodoSort(storedSort) ? storedSort : fallbackSort;
}

/**
 * Loads the theme setting from localStorage.
 *
 * @param fallbackTheme Theme setting to use when storage is unavailable or invalid.
 * @returns Stored theme setting, or fallback theme setting.
 */
export function loadThemeFromStorage(fallbackTheme: TodoTheme) {
  if (typeof window === "undefined") {
    return fallbackTheme;
  }

  const storedTheme = window.localStorage.getItem(todoThemeStorageKey);

  return isTodoTheme(storedTheme) ? storedTheme : fallbackTheme;
}

/**
 * Saves Todos to localStorage.
 *
 * @param todos Todos to save.
 */
export function saveTodosToStorage(todos: Todo[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(todoStorageKey, JSON.stringify(todos));
}

/**
 * Saves the Todo sort setting to localStorage.
 *
 * @param sort Sort setting to save.
 */
export function saveSortToStorage(sort: TodoSort) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(todoSortStorageKey, sort);
}

/**
 * Saves the theme setting to localStorage.
 *
 * @param theme Theme setting to save.
 */
export function saveThemeToStorage(theme: TodoTheme) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(todoThemeStorageKey, theme);
}

/**
 * Applies the selected theme to the page.
 *
 * @param theme Theme setting to apply.
 */
export function applyThemeToDocument(theme: TodoTheme) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.toggle("dark", theme === "dark");
}
