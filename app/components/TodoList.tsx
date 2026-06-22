"use client";

import { useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";

import { AddButton } from "./AddButton";
import { TodoItem } from "./TodoItem";
import type { Todo, TodoFilter, TodoFilterOption } from "../types/todo";

type TodoListProps = {
  /** page.tsx から受け取る初期 Todo 一覧。 */
  todos: Todo[];
};

const filterOptions: TodoFilterOption[] = [
  { label: "すべて", value: "all" },
  { label: "未完了", value: "active" },
  { label: "完了済み", value: "completed" },
];

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

  return todos;
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
  const [selectedFilter, setSelectedFilter] = useState<TodoFilter>("all");

  const filteredTodoItems = filterTodos(todoItems, selectedFilter);

  /**
   * 指定した Todo の完了状態を反転します。
   *
   * @param id 完了状態を切り替える Todo の ID。
   */
  function toggleTodoCompleted(id: number) {
    setTodoItems((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  }

  /**
   * 指定した Todo のタイトルを更新します。
   *
   * @param id タイトルを更新する Todo の ID。
   * @param title 更新後のタイトル。
   */
  function updateTodoTitle(id: number, title: string) {
    const trimmedTitle = title.trim();

    if (trimmedTitle.length === 0) {
      return;
    }

    setTodoItems((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, title: trimmedTitle } : todo,
      ),
    );
  }

  /**
   * 指定した Todo を一覧から削除します。
   *
   * @param id 削除する Todo の ID。
   */
  function deleteTodo(id: number) {
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
   * 入力されたタイトルで未完了の Todo を追加します。
   *
   * @param event フォーム送信イベント。
   */
  function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = newTodoTitle.trim();

    if (title.length === 0) {
      return;
    }

    setTodoItems((currentTodos) => [
      ...currentTodos,
      {
        id: createTodoId(currentTodos),
        title,
        completed: false,
      },
    ]);
    setNewTodoTitle("");
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

  return (
    <>
      <div className="mb-4 flex gap-2" aria-label="Todo 表示フィルタ" role="group">
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

      <div className="rounded-lg bg-white shadow-sm">
        {filteredTodoItems.map((todo) => (
          <TodoItem
            key={todo.id}
            title={todo.title}
            completed={todo.completed}
            onToggle={() => toggleTodoCompleted(todo.id)}
            onDelete={() => deleteTodo(todo.id)}
            onUpdateTitle={(title) => updateTodoTitle(todo.id, title)}
          />
        ))}
      </div>

      <form onSubmit={addTodo} className="mt-6 flex gap-3">
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
        <AddButton disabled={newTodoTitle.trim().length === 0} />
      </form>
    </>
  );
}
