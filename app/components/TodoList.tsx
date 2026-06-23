"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";

import { AddButton } from "./AddButton";
import { TodoItem } from "./TodoItem";
import type {
  Todo,
  TodoFilter,
  TodoFilterOption,
  TodoPriority,
  TodoPriorityOption,
  TodoSort,
  TodoSortOption,
} from "../types/todo";

type TodoListProps = {
  /** page.tsx から受け取る初期 Todo 一覧。 */
  todos: Todo[];
};

const filterOptions: TodoFilterOption[] = [
  { label: "すべて", value: "all" },
  { label: "今日", value: "today" },
  { label: "予定", value: "scheduled" },
  { label: "未完了", value: "active" },
  { label: "完了済み", value: "completed" },
];

const priorityOptions: TodoPriorityOption[] = [
  { label: "なし", value: "none" },
  { label: "低", value: "low" },
  { label: "中", value: "medium" },
  { label: "高", value: "high" },
];

const sortOptions: TodoSortOption[] = [
  { label: "作成順", value: "created" },
  { label: "期限日が近い順", value: "dueDate" },
  { label: "優先度が高い順", value: "priority" },
];

const priorityRank: Record<TodoPriority, number> = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
};

const todoStorageKey = "todo-app.todos";
const todoSortStorageKey = "todo-app.sort";

/**
 * 優先度として扱える値かどうかを判定します。
 *
 * @param value 判定する値。
 * @returns 優先度として扱える場合は true。
 */
function isTodoPriority(value: unknown): value is TodoPriority {
  return value === "none" || value === "low" || value === "medium" || value === "high";
}

/**
 * 並び替え条件として扱える値かどうかを判定します。
 *
 * @param value 判定する値。
 * @returns 並び替え条件として扱える場合は true。
 */
function isTodoSort(value: unknown): value is TodoSort {
  return value === "created" || value === "dueDate" || value === "priority";
}

/**
 * 日付入力と比較するためのローカル日付文字列を返します。
 *
 * @param date 変換する日付。
 * @returns YYYY-MM-DD 形式の日付文字列。
 */
function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * タグ入力を Todo に保存するタグ一覧へ変換します。
 *
 * @param value カンマ区切りのタグ入力。
 * @returns 空文字と重複を取り除いたタグ一覧。
 */
function parseTags(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
    ),
  );
}

/**
 * 保存済み Todo を現在の Todo 型に整えます。
 *
 * @param value 判定する値。
 * @returns Todo として扱える値、または null。
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

  return {
    id: todo.id,
    title: todo.title,
    memo: typeof todo.memo === "string" ? todo.memo : "",
    dueDate: typeof todo.dueDate === "string" ? todo.dueDate : "",
    priority: isTodoPriority(todo.priority) ? todo.priority : "none",
    tags: Array.isArray(todo.tags)
      ? todo.tags.filter((tag): tag is string => typeof tag === "string")
      : [],
    completed: todo.completed,
  };
}

/**
 * localStorage から Todo 一覧を読み込みます。
 *
 * @param fallbackTodos 保存データが使えない場合に表示する初期 Todo 一覧。
 * @returns 復元した Todo 一覧、または初期 Todo 一覧。
 */
function loadTodosFromStorage(fallbackTodos: Todo[]) {
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
 * localStorage から並び替え条件を読み込みます。
 *
 * @param fallbackSort 保存データが使えない場合に使う並び替え条件。
 * @returns 復元した並び替え条件、または初期値。
 */
function loadSortFromStorage(fallbackSort: TodoSort) {
  if (typeof window === "undefined") {
    return fallbackSort;
  }

  const storedSort = window.localStorage.getItem(todoSortStorageKey);

  return isTodoSort(storedSort) ? storedSort : fallbackSort;
}

/**
 * Todo 一覧を localStorage に保存します。
 *
 * @param todos 保存する Todo 一覧。
 */
function saveTodosToStorage(todos: Todo[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(todoStorageKey, JSON.stringify(todos));
}

/**
 * 並び替え条件を localStorage に保存します。
 *
 * @param sort 保存する並び替え条件。
 */
function saveSortToStorage(sort: TodoSort) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(todoSortStorageKey, sort);
}

/**
 * Todo 一覧を選択中のフィルタに合わせて絞り込みます。
 *
 * @param todos 絞り込み対象の Todo 一覧。
 * @param filter 選択中のフィルタ。
 * @returns 表示対象の Todo 一覧。
 */
function filterTodos(todos: Todo[], filter: TodoFilter) {
  if (filter === "active") {
    return todos.filter((todo) => !todo.completed);
  }

  if (filter === "completed") {
    return todos.filter((todo) => todo.completed);
  }

  if (filter === "today") {
    const today = toDateInputValue(new Date());

    return todos.filter((todo) => todo.dueDate === today);
  }

  if (filter === "scheduled") {
    return todos.filter((todo) => todo.dueDate.length > 0 && !todo.completed);
  }

  return todos;
}

/**
 * Todo 一覧を検索語で絞り込みます。
 *
 * @param todos 検索対象の Todo 一覧。
 * @param query 検索語。
 * @returns 検索語に一致する Todo 一覧。
 */
function searchTodos(todos: Todo[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length === 0) {
    return todos;
  }

  return todos.filter((todo) => {
    const searchableText = [todo.title, todo.memo, ...todo.tags].join(" ").toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}

/**
 * Todo 一覧を選択中の条件に合わせて並び替えます。
 *
 * @param todos 並び替え対象の Todo 一覧。
 * @param sort 選択中の並び替え条件。
 * @returns 表示順に並び替えた Todo 一覧。
 */
function sortTodos(todos: Todo[], sort: TodoSort) {
  const sortedTodos = [...todos];

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
    return sortedTodos.sort(
      (a, b) => priorityRank[b.priority] - priorityRank[a.priority] || a.id - b.id,
    );
  }

  return sortedTodos.sort((a, b) => a.id - b.id);
}

/**
 * Todo 一覧、追加、完了切り替え、削除、編集、表示フィルタを管理します。
 *
 * @param props Todo 一覧の表示に必要な情報。
 * @param props.todos 表示する Todo の初期一覧。
 * @returns Todo 一覧。
 */
export function TodoList({ todos }: TodoListProps) {
  const [todoItems, setTodoItems] = useState<Todo[]>(todos);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoMemo, setNewTodoMemo] = useState("");
  const [newTodoDueDate, setNewTodoDueDate] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState<TodoPriority>("none");
  const [newTodoTags, setNewTodoTags] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<TodoFilter>("all");
  const [selectedSort, setSelectedSort] = useState<TodoSort>("created");
  const [hasLoadedStoredTodos, setHasLoadedStoredTodos] = useState(false);
  const hasChangedTodosRef = useRef(false);
  const hasChangedSortRef = useRef(false);

  const filteredTodoItems = sortTodos(
    searchTodos(filterTodos(todoItems, selectedFilter), searchQuery),
    selectedSort,
  );

  useEffect(() => {
    let isActive = true;

    queueMicrotask(() => {
      if (!isActive) {
        return;
      }

      if (!hasChangedTodosRef.current) {
        setTodoItems(loadTodosFromStorage(todos));
      }

      if (!hasChangedSortRef.current) {
        setSelectedSort(loadSortFromStorage("created"));
      }

      setHasLoadedStoredTodos(true);
    });

    return () => {
      isActive = false;
    };
  }, [todos]);

  useEffect(() => {
    if (!hasLoadedStoredTodos) {
      return;
    }

    saveTodosToStorage(todoItems);
    saveSortToStorage(selectedSort);
  }, [hasLoadedStoredTodos, selectedSort, todoItems]);

  /**
   * 指定した Todo の完了状態を反転します。
   *
   * @param id 完了状態を切り替える Todo の ID。
   */
  function toggleTodoCompleted(id: number) {
    hasChangedTodosRef.current = true;

    setTodoItems((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  }

  /**
   * 指定した Todo のタイトル、メモ、期限日、優先度、タグを更新します。
   *
   * @param id 更新する Todo の ID。
   * @param title 更新後のタイトル。
   * @param memo 更新後のメモ。
   * @param dueDate 更新後の期限日。
   * @param priority 更新後の優先度。
   * @param tags 更新後のタグ一覧。
   */
  function updateTodo(
    id: number,
    title: string,
    memo: string,
    dueDate: string,
    priority: TodoPriority,
    tags: string[],
  ) {
    const trimmedTitle = title.trim();

    if (trimmedTitle.length === 0) {
      return;
    }

    hasChangedTodosRef.current = true;

    setTodoItems((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id
          ? { ...todo, title: trimmedTitle, memo, dueDate, priority, tags }
          : todo,
      ),
    );
  }

  /**
   * 指定した Todo を一覧から削除します。
   *
   * @param id 削除する Todo の ID。
   */
  function deleteTodo(id: number) {
    hasChangedTodosRef.current = true;

    setTodoItems((currentTodos) =>
      currentTodos.filter((todo) => todo.id !== id),
    );
  }

  /**
   * 現在の Todo 一覧から、画面内で使う一意な ID を作成します。
   *
   * @param currentTodos 現在表示している Todo 一覧。
   * @returns 新しい Todo に付与する ID。
   */
  function createTodoId(currentTodos: Todo[]) {
    if (currentTodos.length === 0) {
      return 1;
    }

    return Math.max(...currentTodos.map((todo) => todo.id)) + 1;
  }

  /**
   * 入力されたタイトル、メモ、期限日、優先度、タグで未完了の Todo を追加します。
   *
   * @param event フォーム送信イベント。
   */
  function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = newTodoTitle.trim();

    if (title.length === 0) {
      return;
    }

    hasChangedTodosRef.current = true;

    setTodoItems((currentTodos) => [
      ...currentTodos,
      {
        id: createTodoId(currentTodos),
        title,
        memo: newTodoMemo.trim(),
        dueDate: newTodoDueDate,
        priority: newTodoPriority,
        tags: parseTags(newTodoTags),
        completed: false,
      },
    ]);
    setNewTodoTitle("");
    setNewTodoMemo("");
    setNewTodoDueDate("");
    setNewTodoPriority("none");
    setNewTodoTags("");
  }

  /**
   * 追加入力中の Enter キー入力で Todo を追加します。
   *
   * @param event キーボード入力イベント。
   */
  function handleNewTodoKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  /**
   * 並び替え条件を変更し、保存対象として扱います。
   *
   * @param sort 新しい並び替え条件。
   */
  function changeSort(sort: TodoSort) {
    hasChangedSortRef.current = true;
    setSelectedSort(sort);
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2" aria-label="Todo 表示フィルタ" role="group">
        {filterOptions.map((filter) => {
          const isSelected = selectedFilter === filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              className={
                isSelected
                  ? "rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
                  : "rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:text-gray-900"
              }
              aria-pressed={isSelected}
              onClick={() => setSelectedFilter(filter.value)}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <label htmlFor="todo-search" className="sr-only">
          Todo 検索
        </label>
        <input
          id="todo-search"
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="検索"
          className="min-w-0 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-400"
        />
        <label htmlFor="todo-sort" className="sr-only">
          Todo 並び替え
        </label>
        <select
          id="todo-sort"
          value={selectedSort}
          onChange={(event) => changeSort(event.target.value as TodoSort)}
          className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm outline-none transition focus:border-blue-400"
        >
          {sortOptions.map((sort) => (
            <option key={sort.value} value={sort.value}>
              {sort.label}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg bg-white shadow-sm">
        {filteredTodoItems.map((todo) => (
          <TodoItem
            key={todo.id}
            title={todo.title}
            memo={todo.memo}
            dueDate={todo.dueDate}
            priority={todo.priority}
            tags={todo.tags}
            priorityOptions={priorityOptions}
            completed={todo.completed}
            onToggle={() => toggleTodoCompleted(todo.id)}
            onDelete={() => deleteTodo(todo.id)}
            onUpdateTodo={(title, memo, dueDate, priority, tags) =>
              updateTodo(todo.id, title, memo, dueDate, priority, tags)
            }
          />
        ))}
      </div>

      <form onSubmit={addTodo} className="mt-6 grid gap-3">
        <label htmlFor="new-todo-title" className="sr-only">
          追加する Todo
        </label>
        <input
          id="new-todo-title"
          type="text"
          value={newTodoTitle}
          onChange={(event) => setNewTodoTitle(event.target.value)}
          onKeyDown={handleNewTodoKeyDown}
          placeholder="新しい Todo"
          className="min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-400"
        />
        <label htmlFor="new-todo-memo" className="sr-only">
          追加する Todo メモ
        </label>
        <textarea
          id="new-todo-memo"
          value={newTodoMemo}
          onChange={(event) => setNewTodoMemo(event.target.value)}
          placeholder="メモ"
          rows={3}
          className="min-w-0 resize-y rounded-md border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-400"
        />
        <label htmlFor="new-todo-due-date" className="sr-only">
          追加する Todo 期限日
        </label>
        <input
          id="new-todo-due-date"
          type="date"
          value={newTodoDueDate}
          onChange={(event) => setNewTodoDueDate(event.target.value)}
          className="min-w-0 rounded-md border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition focus:border-blue-400"
        />
        <label htmlFor="new-todo-priority" className="sr-only">
          追加する Todo 優先度
        </label>
        <select
          id="new-todo-priority"
          value={newTodoPriority}
          onChange={(event) => setNewTodoPriority(event.target.value as TodoPriority)}
          className="min-w-0 rounded-md border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition focus:border-blue-400"
        >
          {priorityOptions.map((priority) => (
            <option key={priority.value} value={priority.value}>
              優先度: {priority.label}
            </option>
          ))}
        </select>
        <label htmlFor="new-todo-tags" className="sr-only">
          追加する Todo タグ
        </label>
        <input
          id="new-todo-tags"
          type="text"
          value={newTodoTags}
          onChange={(event) => setNewTodoTags(event.target.value)}
          placeholder="タグ（カンマ区切り）"
          className="min-w-0 rounded-md border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-400"
        />
        <div className="flex justify-end">
          <AddButton disabled={newTodoTitle.trim().length === 0} />
        </div>
      </form>
    </>
  );
}
