import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";

import { TodoList } from "../app/components/TodoList";
import type { Todo } from "../app/types/todo";

const todos: Todo[] = [
  { id: 1, title: "筋トレ", completed: false },
  { id: 2, title: "散歩", completed: false },
  { id: 3, title: "買い物", completed: true },
];

afterEach(() => {
  cleanup();
});

test("初期状態では全件表示される", () => {
  render(<TodoList todos={todos} />);

  expect(screen.getByText("筋トレ")).toBeDefined();
  expect(screen.getByText("散歩")).toBeDefined();
  expect(screen.getByText("買い物")).toBeDefined();
});

test("未完了を選ぶと未完了Todoだけ表示される", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "未完了" }));

  expect(screen.getByText("筋トレ")).toBeDefined();
  expect(screen.getByText("散歩")).toBeDefined();
  expect(screen.queryByText("買い物")).toBeNull();
});

test("完了済みを選ぶと完了済みTodoだけ表示される", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "完了済み" }));

  expect(screen.queryByText("筋トレ")).toBeNull();
  expect(screen.queryByText("散歩")).toBeNull();
  expect(screen.getByText("買い物")).toBeDefined();
});

test("すべてに戻すと全件表示される", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "完了済み" }));
  fireEvent.click(screen.getByRole("button", { name: "すべて" }));

  expect(screen.getByText("筋トレ")).toBeDefined();
  expect(screen.getByText("散歩")).toBeDefined();
  expect(screen.getByText("買い物")).toBeDefined();
});

test("Todoを追加できる", () => {
  render(<TodoList todos={todos} />);

  const input = screen.getByLabelText("追加するTODO") as HTMLInputElement;

  fireEvent.change(input, { target: { value: "読書" } });
  fireEvent.click(screen.getByRole("button", { name: "＋ 追加" }));

  expect(screen.getByText("読書")).toBeDefined();
  expect(input.value).toBe("");
});

test("完了状態を切り替えられる", () => {
  render(<TodoList todos={todos} />);

  expect(screen.getAllByLabelText("未完了に戻す")).toHaveLength(1);

  fireEvent.click(screen.getByText("筋トレ"));

  expect(screen.getAllByLabelText("未完了に戻す")).toHaveLength(2);
});

test("Todoを削除できる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "散歩を削除する" }));

  expect(screen.getByText("筋トレ")).toBeDefined();
  expect(screen.queryByText("散歩")).toBeNull();
  expect(screen.getByText("買い物")).toBeDefined();
});
