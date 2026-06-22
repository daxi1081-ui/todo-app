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

test("未完了を選ぶと未完了 Todo だけ表示される", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "未完了" }));

  expect(screen.getByText("筋トレ")).toBeDefined();
  expect(screen.getByText("散歩")).toBeDefined();
  expect(screen.queryByText("買い物")).toBeNull();
});

test("完了済みを選ぶと完了済み Todo だけ表示される", () => {
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

test("選択中のフィルタは aria-pressed で分かる", () => {
  render(<TodoList todos={todos} />);

  const allFilterButton = screen.getByRole("button", { name: "すべて" });
  const activeFilterButton = screen.getByRole("button", { name: "未完了" });

  expect(allFilterButton.getAttribute("aria-pressed")).toBe("true");
  expect(activeFilterButton.getAttribute("aria-pressed")).toBe("false");

  fireEvent.click(activeFilterButton);

  expect(allFilterButton.getAttribute("aria-pressed")).toBe("false");
  expect(activeFilterButton.getAttribute("aria-pressed")).toBe("true");
});

test("Todo を追加できる", () => {
  render(<TodoList todos={todos} />);

  const input = screen.getByLabelText("追加する Todo") as HTMLInputElement;

  fireEvent.change(input, { target: { value: "読書" } });
  fireEvent.click(screen.getByRole("button", { name: "追加" }));

  expect(screen.getByText("読書")).toBeDefined();
  expect(input.value).toBe("");
});

test("Todo 追加時に Enter キーで追加できる", () => {
  render(<TodoList todos={todos} />);

  const input = screen.getByLabelText("追加する Todo") as HTMLInputElement;

  fireEvent.change(input, { target: { value: "日記を書く" } });
  fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

  expect(screen.getByText("日記を書く")).toBeDefined();
  expect(input.value).toBe("");
});

test("空文字では Todo を追加できない", () => {
  render(<TodoList todos={todos} />);

  const input = screen.getByLabelText("追加する Todo") as HTMLInputElement;
  const addButton = screen.getByRole("button", { name: "追加" }) as HTMLButtonElement;

  fireEvent.change(input, { target: { value: "   " } });

  expect(addButton.disabled).toBe(true);
  fireEvent.submit(input.closest("form") as HTMLFormElement);

  expect(screen.queryByText("   ")).toBeNull();
  expect(screen.getAllByRole("button", { name: /を削除する$/ })).toHaveLength(3);
});

test("完了状態を切り替えられる", () => {
  render(<TodoList todos={todos} />);

  expect(screen.getAllByLabelText("未完了に戻す")).toHaveLength(1);

  fireEvent.click(screen.getByText("筋トレ"));

  expect(screen.getAllByLabelText("未完了に戻す")).toHaveLength(2);
});

test("Todo を削除できる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "散歩を削除する" }));

  expect(screen.getByText("筋トレ")).toBeDefined();
  expect(screen.queryByText("散歩")).toBeNull();
  expect(screen.getByText("買い物")).toBeDefined();
});

test("Todo を編集できる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "筋トレを編集する" }));
  fireEvent.change(screen.getByLabelText("Todo タイトルを編集"), {
    target: { value: "朝の筋トレ" },
  });
  fireEvent.click(screen.getByRole("button", { name: "保存" }));

  expect(screen.getByText("朝の筋トレ")).toBeDefined();
  expect(screen.queryByText("筋トレ")).toBeNull();
});

test("編集をキャンセルすると元のタイトルに戻る", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "筋トレを編集する" }));
  fireEvent.change(screen.getByLabelText("Todo タイトルを編集"), {
    target: { value: "朝の筋トレ" },
  });
  fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));

  expect(screen.getByText("筋トレ")).toBeDefined();
  expect(screen.queryByText("朝の筋トレ")).toBeNull();
});

test("空文字では編集内容を保存できない", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "筋トレを編集する" }));
  fireEvent.change(screen.getByLabelText("Todo タイトルを編集"), {
    target: { value: "   " },
  });

  const saveButton = screen.getByRole("button", { name: "保存" }) as HTMLButtonElement;

  expect(saveButton.disabled).toBe(true);
  fireEvent.submit(saveButton.closest("form") as HTMLFormElement);

  expect(screen.getByLabelText("Todo タイトルを編集")).toBeDefined();
  expect(screen.queryByText("   ")).toBeNull();
});

test("Todo 編集時に Enter キーで保存できる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "筋トレを編集する" }));

  const input = screen.getByLabelText("Todo タイトルを編集") as HTMLInputElement;

  fireEvent.change(input, { target: { value: "夜の筋トレ" } });
  fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

  expect(screen.getByText("夜の筋トレ")).toBeDefined();
  expect(screen.queryByText("筋トレ")).toBeNull();
});

test("Todo 編集時に Esc キーでキャンセルできる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "筋トレを編集する" }));

  const input = screen.getByLabelText("Todo タイトルを編集");

  fireEvent.change(input, { target: { value: "夜の筋トレ" } });
  fireEvent.keyDown(input, { key: "Escape", code: "Escape" });

  expect(screen.getByText("筋トレ")).toBeDefined();
  expect(screen.queryByText("夜の筋トレ")).toBeNull();
});

test("編集後も完了切り替えが動作する", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "筋トレを編集する" }));
  fireEvent.change(screen.getByLabelText("Todo タイトルを編集"), {
    target: { value: "朝の筋トレ" },
  });
  fireEvent.click(screen.getByRole("button", { name: "保存" }));
  fireEvent.click(screen.getByText("朝の筋トレ"));

  expect(screen.getAllByLabelText("未完了に戻す")).toHaveLength(2);
});

test("編集後も削除が動作する", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "散歩を編集する" }));
  fireEvent.change(screen.getByLabelText("Todo タイトルを編集"), {
    target: { value: "夕方の散歩" },
  });
  fireEvent.click(screen.getByRole("button", { name: "保存" }));
  fireEvent.click(screen.getByRole("button", { name: "夕方の散歩を削除する" }));

  expect(screen.queryByText("夕方の散歩")).toBeNull();
  expect(screen.getByText("筋トレ")).toBeDefined();
  expect(screen.getByText("買い物")).toBeDefined();
});
