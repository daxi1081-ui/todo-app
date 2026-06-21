"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { AddButton } from "./AddButton";
import { TodoItem } from "./TodoItem";
import type { Todo, TodoFilter, TodoFilterOption } from "../types/todo";

type TodoListProps = {
  /** page.tsx から受け取る TODO 配列。 */
  todos: Todo[];
};

const filterOptions: TodoFilterOption[] = [
  { label: "すべて", value: "all" },
  { label: "未完了", value: "active" },
  { label: "完了済み", value: "completed" },
];

/**
 * TODO 配列を選択中のフィルタに合わせて絞り込みます。
 * @param {Todo[]} todos 絞り込み対象の TODO 配列
 * @param {TodoFilter} filter 選択中のフィルタ
 * @returns {Todo[]} 表示対象の TODO 配列
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
 * TODO 配列を一覧として表示し、追加・完了切り替え・削除・編集・表示フィルタを管理するコンポーネントです。
 * @param {TodoListProps} props TODO 一覧の表示に必要な情報
 * @param {Todo[]} props.todos 表示する TODO の初期配列
 * @returns {JSX.Element} TODO 一覧
 */
export function TodoList({ todos }: TodoListProps) {
  const [todoItems, setTodoItems] = useState<Todo[]>(todos);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<TodoFilter>("all");

  const filteredTodoItems = filterTodos(todoItems, selectedFilter);

  /**
   * 指定した TODO の完了状態を反転します。
   * @param {number} id 完了状態を切り替える TODO の ID
   */
  function toggleTodoCompleted(id: number) {
    setTodoItems((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  }

  /**
   * 指定した TODO のタイトルを更新します。
   * @param {number} id タイトルを更新する TODO の ID
   * @param {string} title 更新後のタイトル
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
   * 指定した TODO を一覧から削除します。
   * @param {number} id 削除する TODO の ID
   */
  function deleteTodo(id: number) {
    setTodoItems((currentTodos) =>
      currentTodos.filter((todo) => todo.id !== id),
    );
  }

  /**
   * 現在の TODO 一覧から、画面内で使う簡易的な ID を作成します。
   * @param {Todo[]} currentTodos 現在表示している TODO 配列
   * @returns {number} 新しい TODO に付与する ID
   */
  function createTodoId(currentTodos: Todo[]) {
    if (currentTodos.length === 0) {
      return 1;
    }

    return Math.max(...currentTodos.map((todo) => todo.id)) + 1;
  }

  /**
   * 入力されたタイトルで未完了の TODO を追加します。
   * @param {FormEvent<HTMLFormElement>} event フォーム送信イベント
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
                  : "rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm hover:text-gray-900"
              }
              aria-pressed={isSelected}
              onClick={() => setSelectedFilter(filter.value)}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl bg-white shadow-sm">
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

      <form onSubmit={addTodo} className="mt-6">
        <label htmlFor="new-todo-title" className="sr-only">
          追加する TODO
        </label>
        <input
          id="new-todo-title"
          type="text"
          value={newTodoTitle}
          onChange={(event) => setNewTodoTitle(event.target.value)}
          placeholder="新しい TODO"
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-blue-400"
        />
        <AddButton disabled={newTodoTitle.trim().length === 0} />
      </form>
    </>
  );
}
