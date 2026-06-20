"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { AddButton } from "./AddButton";
import { TodoItem } from "./TodoItem";
import type { Todo } from "../types/todo";

type TodoListProps = {
  /** page.tsxから受け取るTODO配列。 */
  todos: Todo[];
};

/**
 * TODO配列を一覧として表示し、完了状態を管理するコンポーネントです。
 * @param {TodoListProps} props TODO一覧の表示に必要な情報
 * @param {Todo[]} props.todos 表示するTODOの初期配列
 * @returns {JSX.Element} TODO一覧の表示
 */
export function TodoList({ todos }: TodoListProps) {
  const [todoItems, setTodoItems] = useState<Todo[]>(todos);
  const [newTodoTitle, setNewTodoTitle] = useState("");

  /**
   * 指定したTODOの完了状態を反転します。
   * @param {number} id 完了状態を切り替えるTODOのID
   */
  function toggleTodoCompleted(id: number) {
    setTodoItems((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  }

  /**
   * 指定したTODOを一覧から削除します。
   * @param {number} id 削除するTODOのID
   */
  function deleteTodo(id: number) {
    setTodoItems((currentTodos) =>
      currentTodos.filter((todo) => todo.id !== id),
    );
  }

  /**
   * 現在のTODO一覧から、画面内で使う簡易的なIDを作成します。
   * @param {Todo[]} currentTodos 現在表示しているTODO配列
   * @returns {number} 新しいTODOに付与するID
   */
  function createTodoId(currentTodos: Todo[]) {
    if (currentTodos.length === 0) {
      return 1;
    }

    return Math.max(...currentTodos.map((todo) => todo.id)) + 1;
  }

  /**
   * 入力されたタイトルで未完了のTODOを追加します。
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
      <div className="rounded-2xl bg-white shadow-sm">
        {todoItems.map((todo) => (
          <TodoItem
            key={todo.id}
            title={todo.title}
            completed={todo.completed}
            onToggle={() => toggleTodoCompleted(todo.id)}
            onDelete={() => deleteTodo(todo.id)}
          />
        ))}
      </div>

      <form onSubmit={addTodo} className="mt-6">
        <label htmlFor="new-todo-title" className="sr-only">
          追加するTODO
        </label>
        <input
          id="new-todo-title"
          type="text"
          value={newTodoTitle}
          onChange={(event) => setNewTodoTitle(event.target.value)}
          placeholder="新しいTODO"
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-blue-400"
        />
        <AddButton disabled={newTodoTitle.trim().length === 0} />
      </form>
    </>
  );
}
