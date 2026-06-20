import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { TodoList } from "../app/components/TodoList";
import type { Todo } from "../app/types/todo";

test("Todo一覧が表示される", () => {
  const todos: Todo[] = [
    { id: 1, title: "筋トレ", completed: false },
    { id: 2, title: "散歩", completed: false },
    { id: 3, title: "買い物", completed: true },
  ];

  render(<TodoList todos={todos} />);

  expect(screen.getByText("筋トレ")).toBeDefined();
  expect(screen.getByText("散歩")).toBeDefined();
  expect(screen.getByText("買い物")).toBeDefined();
});
