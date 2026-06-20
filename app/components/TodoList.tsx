"use client";

import { useState } from "react";

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

  return (
    <div className="rounded-2xl bg-white shadow-sm">
      {todoItems.map((todo) => (
        <TodoItem
          key={todo.id}
          title={todo.title}
          completed={todo.completed}
          onToggle={() => toggleTodoCompleted(todo.id)}
        />
      ))}
    </div>
  );
}
