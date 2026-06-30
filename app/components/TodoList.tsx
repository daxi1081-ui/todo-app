"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";

import { AddButton } from "./AddButton";
import { TodoItem } from "./TodoItem";
import { parseTags } from "../utils/tags";
import { filterTodos, searchTodos, sortTodos } from "../utils/todoQueries";
import { createTodoSections } from "../utils/todoSections";
import {
  applyThemeToDocument,
  loadSortFromStorage,
  loadThemeFromStorage,
  loadTodosFromStorage,
  saveSortToStorage,
  saveThemeToStorage,
  saveTodosToStorage,
} from "../utils/todoStorage";
import type { TodoTheme } from "../utils/todoStorage";
import type {
  Todo,
  TodoFilter,
  TodoFilterOption,
  TodoPriority,
  TodoPriorityOption,
  TodoRepeat,
  TodoRepeatOption,
  TodoSort,
  TodoSortOption,
  TodoSubtask,
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

const repeatOptions: TodoRepeatOption[] = [
  { label: "なし", value: "none" },
  { label: "毎日", value: "daily" },
  { label: "毎週", value: "weekly" },
  { label: "毎月", value: "monthly" },
];

const sortOptions: TodoSortOption[] = [
  { label: "デフォルト", value: "created" },
  { label: "期限日が近い順", value: "dueDate" },
  { label: "優先度が高い順", value: "priority" },
];

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
  const [newTodoRepeat, setNewTodoRepeat] = useState<TodoRepeat>("none");
  const [newTodoTags, setNewTodoTags] = useState("");
  const [isNewTodoDetailsOpen, setIsNewTodoDetailsOpen] = useState(false);
  const [isControlMenuOpen, setIsControlMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<TodoFilter>("all");
  const [selectedSort, setSelectedSort] = useState<TodoSort>("created");
  const [selectedTheme, setSelectedTheme] = useState<TodoTheme>("light");
  const [hasLoadedStoredTodos, setHasLoadedStoredTodos] = useState(false);
  const hasChangedTodosRef = useRef(false);
  const hasChangedSortRef = useRef(false);
  const hasChangedThemeRef = useRef(false);

  const filteredTodoItems = sortTodos(
    searchTodos(filterTodos(todoItems, selectedFilter), searchQuery),
    selectedSort,
  );
  const todoSections = createTodoSections(filteredTodoItems);
  const selectedSortLabel = sortOptions.find((sort) => sort.value === selectedSort)?.label ?? "";
  const hasSearchQuery = searchQuery.trim().length > 0;
  const isDarkTheme = selectedTheme === "dark";

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

  useEffect(() => {
    let isActive = true;

    queueMicrotask(() => {
      if (!isActive || hasChangedThemeRef.current) {
        return;
      }

      const storedTheme = loadThemeFromStorage("light");

      setSelectedTheme(storedTheme);
      applyThemeToDocument(storedTheme);
    });

    return () => {
      isActive = false;
    };
  }, []);

  /**
   * 指定した Todo の完了状態を反転します。
   *
   * @param id 完了状態を切り替える Todo の ID。
   */
  function toggleTodoCompleted(id: number) {
    hasChangedTodosRef.current = true;

    setTodoItems((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              completed: !todo.completed,
              subtasks: !todo.completed
                ? todo.subtasks.map((subtask) => ({ ...subtask, completed: true }))
                : todo.subtasks,
            }
          : todo,
      ),
    );
  }

  /**
   * 指定した Todo のタイトル、メモ、期限日、優先度、繰り返し設定、タグ、サブタスクを更新します。
   *
   * @param id 更新する Todo の ID。
   * @param title 更新後のタイトル。
   * @param memo 更新後のメモ。
   * @param dueDate 更新後の期限日。
   * @param priority 更新後の優先度。
   * @param repeat 更新後の繰り返し設定。
   * @param tags 更新後のタグ一覧。
   * @param subtasks 更新後のサブタスク一覧。
   */
  function updateTodo(
    id: number,
    title: string,
    memo: string,
    dueDate: string,
    priority: TodoPriority,
    repeat: TodoRepeat,
    tags: string[],
    subtasks: TodoSubtask[],
  ) {
    const trimmedTitle = title.trim();

    if (trimmedTitle.length === 0) {
      return;
    }

    hasChangedTodosRef.current = true;

    setTodoItems((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id
          ? { ...todo, title: trimmedTitle, memo, dueDate, priority, repeat, tags, subtasks }
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
   * 入力されたタイトル、メモ、期限日、優先度、繰り返し設定、タグで未完了の Todo を追加します。
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
        repeat: newTodoRepeat,
        tags: parseTags(newTodoTags),
        subtasks: [],
        completed: false,
      },
    ]);
    setNewTodoTitle("");
    setNewTodoMemo("");
    setNewTodoDueDate("");
    setNewTodoPriority("none");
    setNewTodoRepeat("none");
    setNewTodoTags("");
    setIsNewTodoDetailsOpen(false);
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

  /**
   * 現在のサブタスク一覧から一意な ID を作成します。
   *
   * @param subtasks 現在のサブタスク一覧。
   * @returns 新しいサブタスクに付与する ID。
   */
  function createSubtaskId(subtasks: TodoSubtask[]) {
    if (subtasks.length === 0) {
      return 1;
    }

    return Math.max(...subtasks.map((subtask) => subtask.id)) + 1;
  }

  /**
   * 指定した Todo にサブタスクを追加します。
   *
   * @param todoId サブタスクを追加する Todo の ID。
   * @param title サブタスクのタイトル。
   */
  function addSubtask(todoId: number, title: string) {
    const trimmedTitle = title.trim();

    if (trimmedTitle.length === 0) {
      return;
    }

    hasChangedTodosRef.current = true;

    setTodoItems((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              subtasks: [
                ...todo.subtasks,
                {
                  id: createSubtaskId(todo.subtasks),
                  title: trimmedTitle,
                  completed: false,
                },
              ],
            }
          : todo,
      ),
    );
  }

  /**
   * 指定したサブタスクの完了状態を反転します。
   *
   * @param todoId 対象 Todo の ID。
   * @param subtaskId 対象サブタスクの ID。
   */
  function toggleSubtaskCompleted(todoId: number, subtaskId: number) {
    hasChangedTodosRef.current = true;

    setTodoItems((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              subtasks: todo.subtasks.map((subtask) =>
                subtask.id === subtaskId
                  ? { ...subtask, completed: !subtask.completed }
                  : subtask,
              ),
            }
          : todo,
      ),
    );
  }

  /**
   * 指定したサブタスクのタイトルを更新します。
   *
   * @param todoId 対象 Todo の ID。
   * @param subtaskId 対象サブタスクの ID。
   * @param title 更新後のタイトル。
   */
  function updateSubtask(todoId: number, subtaskId: number, title: string) {
    const trimmedTitle = title.trim();

    if (trimmedTitle.length === 0) {
      return;
    }

    hasChangedTodosRef.current = true;

    setTodoItems((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              subtasks: todo.subtasks.map((subtask) =>
                subtask.id === subtaskId ? { ...subtask, title: trimmedTitle } : subtask,
              ),
            }
          : todo,
      ),
    );
  }

  /**
   * 指定したサブタスクを削除します。
   *
   * @param todoId 対象 Todo の ID。
   * @param subtaskId 削除するサブタスクの ID。
   */
  function deleteSubtask(todoId: number, subtaskId: number) {
    hasChangedTodosRef.current = true;

    setTodoItems((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              subtasks: todo.subtasks.filter((subtask) => subtask.id !== subtaskId),
            }
          : todo,
      ),
    );
  }

  /**
   * ライトモードとダークモードを切り替えます。
   */
  function toggleTheme() {
    hasChangedThemeRef.current = true;
    setSelectedTheme((currentTheme) => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";

      applyThemeToDocument(nextTheme);
      saveThemeToStorage(nextTheme);

      return nextTheme;
    });
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          aria-label={isDarkTheme ? "ライトモードに切り替える" : "ダークモードに切り替える"}
          aria-pressed={isDarkTheme}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors duration-150 ease-out hover:border-blue-200 hover:text-gray-950 active:translate-y-px dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-blue-500 dark:hover:text-white"
          onClick={toggleTheme}
        >
          <span aria-hidden="true">{isDarkTheme ? "☀" : "☾"}</span>
          {isDarkTheme ? "Light" : "Dark"}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2" aria-label="Todo 表示フィルタ" role="group">
        {filterOptions.map((filter) => {
          const isSelected = selectedFilter === filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              className={
                isSelected
                  ? "rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 ease-out active:translate-y-px dark:bg-gray-100 dark:text-gray-950"
                  : "rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition-colors duration-150 ease-out hover:text-gray-900 active:translate-y-px dark:bg-gray-900 dark:text-gray-300 dark:hover:text-white"
              }
              aria-pressed={isSelected}
              onClick={() => setSelectedFilter(filter.value)}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="mb-4 grid gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-expanded={isControlMenuOpen}
            aria-controls="todo-control-menu"
            aria-label={
              isControlMenuOpen ? "絞り込み・並び替えメニューを閉じる" : "絞り込み・並び替えメニューを開く"
            }
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors duration-150 ease-out hover:text-gray-900 active:translate-y-px dark:bg-gray-900 dark:text-gray-300 dark:hover:text-white"
            onClick={() => setIsControlMenuOpen((isOpen) => !isOpen)}
          >
            絞り込み・並び替え
          </button>
          {hasSearchQuery ? (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition-colors duration-150 dark:bg-blue-950 dark:text-blue-200">
              検索中
            </span>
          ) : null}
          {selectedSort !== "created" ? (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 transition-colors duration-150 dark:bg-gray-800 dark:text-gray-300">
              {selectedSortLabel}
            </span>
          ) : null}
        </div>

        <div
          id="todo-control-menu"
          className="grid gap-3 rounded-lg bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto] dark:bg-gray-900"
          hidden={!isControlMenuOpen}
        >
        <label htmlFor="todo-search" className="sr-only">
          Todo 検索
        </label>
        <input
          id="todo-search"
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="検索"
          className="min-w-0 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition-colors duration-150 ease-out placeholder:text-gray-400 focus:border-blue-400 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500"
        />
        <label htmlFor="todo-sort" className="sr-only">
          Todo 並び替え
        </label>
        <select
          id="todo-sort"
          value={selectedSort}
          onChange={(event) => changeSort(event.target.value as TodoSort)}
          className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm outline-none transition-colors duration-150 ease-out focus:border-blue-400 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-blue-500"
        >
          {sortOptions.map((sort) => (
            <option key={sort.value} value={sort.value}>
              {sort.label}
            </option>
          ))}
        </select>
      </div>
      </div>

      <div className="grid gap-5">
        {todoSections.map((section) => {
          const headingId = `todo-section-${section.id}`;
          const isOverdueSection = section.id === "overdue";
          const isCompletedSection = section.id === "completed";

          return (
            <section
              key={section.id}
              aria-labelledby={headingId}
              className={isCompletedSection ? "opacity-80" : undefined}
            >
              <div className="mb-2 flex items-baseline justify-between px-2">
                <h2
                  id={headingId}
                  className={
                    isOverdueSection
                      ? "text-sm font-bold tracking-normal text-red-700 transition-colors duration-150 dark:text-red-300"
                      : isCompletedSection
                        ? "text-sm font-bold tracking-normal text-gray-500 transition-colors duration-150 dark:text-gray-400"
                        : "text-sm font-bold tracking-normal text-gray-700 transition-colors duration-150 dark:text-gray-200"
                  }
                >
                  {section.label}
                </h2>
                <span
                  className={
                    isOverdueSection
                      ? "text-xs font-semibold text-red-500 transition-colors duration-150 dark:text-red-300"
                      : "text-xs font-semibold text-gray-400 transition-colors duration-150 dark:text-gray-500"
                  }
                  aria-label={`${section.label} ${section.todos.length}件`}
                >
                  {section.todos.length}件
                </span>
              </div>

              <div
                className={
                  isOverdueSection
                    ? "overflow-hidden rounded-lg border border-red-100 bg-white shadow-sm ring-1 ring-red-50 dark:border-red-900/70 dark:bg-gray-900 dark:ring-red-900/40"
                    : isCompletedSection
                      ? "overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-900"
                      : "overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-900"
                }
              >
                {section.todos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    title={todo.title}
                    memo={todo.memo}
                    dueDate={todo.dueDate}
                    priority={todo.priority}
                    repeat={todo.repeat}
                    tags={todo.tags}
                    subtasks={todo.subtasks}
                    priorityOptions={priorityOptions}
                    repeatOptions={repeatOptions}
                    completed={todo.completed}
                    onToggle={() => toggleTodoCompleted(todo.id)}
                    onDelete={() => deleteTodo(todo.id)}
                    onUpdateTodo={(title, memo, dueDate, priority, repeat, tags, subtasks) =>
                      updateTodo(todo.id, title, memo, dueDate, priority, repeat, tags, subtasks)
                    }
                    onAddSubtask={(title) => addSubtask(todo.id, title)}
                    onToggleSubtask={(subtaskId) => toggleSubtaskCompleted(todo.id, subtaskId)}
                    onUpdateSubtask={(subtaskId, title) => updateSubtask(todo.id, subtaskId, title)}
                    onDeleteSubtask={(subtaskId) => deleteSubtask(todo.id, subtaskId)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <form onSubmit={addTodo} className="mt-6 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-900">
        <label htmlFor="new-todo-title" className="sr-only">
          追加する Todo
        </label>
        <div className="grid gap-3">
          <input
            id="new-todo-title"
            type="text"
            value={newTodoTitle}
            onChange={(event) => setNewTodoTitle(event.target.value)}
            onKeyDown={handleNewTodoKeyDown}
            placeholder="新しい Todo"
            className="min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition-colors duration-150 ease-out placeholder:text-gray-400 focus:border-blue-400 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              aria-expanded={isNewTodoDetailsOpen}
              aria-controls="new-todo-details"
              aria-label={isNewTodoDetailsOpen ? "Todo追加の詳細を隠す" : "Todo追加の詳細を表示"}
              className="rounded-md px-3 py-2 text-sm font-semibold text-blue-600 transition-colors duration-150 ease-out hover:bg-blue-50 active:translate-y-px dark:text-blue-300 dark:hover:bg-blue-950"
              onClick={() => setIsNewTodoDetailsOpen((isOpen) => !isOpen)}
            >
              {isNewTodoDetailsOpen ? "詳細を隠す" : "詳細を表示"}
            </button>
            <AddButton disabled={newTodoTitle.trim().length === 0} />
          </div>
          <div id="new-todo-details" className="grid gap-3 pt-1" hidden={!isNewTodoDetailsOpen}>
            <label htmlFor="new-todo-memo" className="sr-only">
              追加する Todo メモ
            </label>
            <textarea
              id="new-todo-memo"
              value={newTodoMemo}
              onChange={(event) => setNewTodoMemo(event.target.value)}
              placeholder="メモ"
              rows={3}
              className="min-w-0 resize-y rounded-md border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition-colors duration-150 ease-out placeholder:text-gray-400 focus:border-blue-400 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500"
            />
            <label htmlFor="new-todo-due-date" className="sr-only">
              追加する Todo 期限日
            </label>
            <input
              id="new-todo-due-date"
              type="date"
              value={newTodoDueDate}
              onChange={(event) => setNewTodoDueDate(event.target.value)}
              className="min-w-0 rounded-md border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition-colors duration-150 ease-out focus:border-blue-400 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-blue-500"
            />
            <label htmlFor="new-todo-priority" className="sr-only">
              追加する Todo 優先度
            </label>
            <select
              id="new-todo-priority"
              value={newTodoPriority}
              onChange={(event) => setNewTodoPriority(event.target.value as TodoPriority)}
              className="min-w-0 rounded-md border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition-colors duration-150 ease-out focus:border-blue-400 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-blue-500"
            >
              {priorityOptions.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  優先度: {priority.label}
                </option>
              ))}
            </select>
            <label htmlFor="new-todo-repeat" className="sr-only">
              Todoの繰り返し設定
            </label>
            <select
              id="new-todo-repeat"
              aria-label="Todoの繰り返し設定"
              value={newTodoRepeat}
              onChange={(event) => setNewTodoRepeat(event.target.value as TodoRepeat)}
              className="min-w-0 rounded-md border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition-colors duration-150 ease-out focus:border-blue-400 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-blue-500"
            >
              {repeatOptions.map((repeat) => (
                <option key={repeat.value} value={repeat.value}>
                  繰り返し: {repeat.label}
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
              className="min-w-0 rounded-md border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition-colors duration-150 ease-out placeholder:text-gray-400 focus:border-blue-400 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500"
            />
          </div>
        </div>
      </form>
    </>
  );
}
