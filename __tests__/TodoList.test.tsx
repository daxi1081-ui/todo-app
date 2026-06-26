import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test } from "vitest";

import { TodoList } from "../app/components/TodoList";
import type { Todo } from "../app/types/todo";

function createDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createRelativeDateInputValue(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);

  return createDateInputValue(date);
}

function formatDueDate(dueDate: string) {
  return dueDate.replaceAll("-", "/");
}

const today = createRelativeDateInputValue(0);
const tomorrow = createRelativeDateInputValue(1);
const yesterday = createRelativeDateInputValue(-1);

const todos: Todo[] = [
  {
    id: 1,
    title: "筋トレ",
    memo: "腕立てを20回",
    dueDate: today,
    priority: "low",
    repeat: "none",
    tags: ["#健康"],
    subtasks: [],
    completed: false,
  },
  {
    id: 2,
    title: "散歩",
    memo: "公園を一周",
    dueDate: tomorrow,
    priority: "high",
    repeat: "none",
    tags: ["#外出"],
    subtasks: [],
    completed: false,
  },
  {
    id: 3,
    title: "買い物",
    memo: "",
    dueDate: "",
    priority: "medium",
    repeat: "none",
    tags: ["#生活"],
    subtasks: [],
    completed: true,
  },
];

const todoStorageKey = "todo-app.todos";
const todoSortStorageKey = "todo-app.sort";

function getVisibleTodoTitles() {
  return screen
    .getAllByRole("button", { name: /を削除する$/ })
    .map((button) => button.getAttribute("aria-label")?.replace("を削除する", ""));
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

test("localStorage が空の場合、初期 Todo が表示される", () => {
  render(<TodoList todos={todos} />);

  expect(screen.getByText("筋トレ")).toBeDefined();
  expect(screen.getByText("散歩")).toBeDefined();
  expect(screen.getByText("買い物")).toBeDefined();
});

test("localStorage に Todo がある場合、その Todo が表示される", async () => {
  localStorage.setItem(
    todoStorageKey,
    JSON.stringify([
      {
        id: 10,
        title: "保存済み Todo",
        memo: "",
        dueDate: "",
        priority: "none",
        repeat: "none",
        tags: [],
        subtasks: [],
        completed: false,
      },
    ]),
  );

  render(<TodoList todos={todos} />);

  await waitFor(() => {
    expect(screen.getByText("保存済み Todo")).toBeDefined();
  });

  expect(screen.queryByText("筋トレ")).toBeNull();
});

test("壊れた JSON が localStorage に入っていても初期 Todo が表示される", async () => {
  localStorage.setItem(todoStorageKey, "{壊れたJSON");

  render(<TodoList todos={todos} />);

  await waitFor(() => {
    expect(screen.getByText("筋トレ")).toBeDefined();
  });

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

test("今日を選ぶと今日期限の Todo だけ表示される", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "今日" }));

  expect(screen.getByText("筋トレ")).toBeDefined();
  expect(screen.queryByText("散歩")).toBeNull();
  expect(screen.queryByText("買い物")).toBeNull();
});

test("今日フィルタに毎日繰り返しTodoが表示される", () => {
  const todosWithDailyRepeat: Todo[] = [
    ...todos,
    {
      id: 4,
      title: "英単語",
      memo: "",
      dueDate: "",
      priority: "none",
      repeat: "daily",
      tags: [],
      subtasks: [],
      completed: false,
    },
  ];

  render(<TodoList todos={todosWithDailyRepeat} />);

  fireEvent.click(screen.getByRole("button", { name: "今日" }));

  expect(screen.getByText("筋トレ")).toBeDefined();
  expect(screen.getByText("英単語")).toBeDefined();
  expect(screen.queryByText("散歩")).toBeNull();
});

test("予定を選ぶと期限日付き未完了 Todo だけ表示される", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "予定" }));

  expect(screen.getByText("筋トレ")).toBeDefined();
  expect(screen.getByText("散歩")).toBeDefined();
  expect(screen.queryByText("買い物")).toBeNull();
});

test("すべてに戻すと全件表示される", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "完了済み" }));
  fireEvent.click(screen.getByRole("button", { name: "すべて" }));

  expect(screen.getByText("筋トレ")).toBeDefined();
  expect(screen.getByText("散歩")).toBeDefined();
  expect(screen.getByText("買い物")).toBeDefined();
});

test("初期表示で優先度が高いTodoから表示される", () => {
  render(<TodoList todos={todos} />);

  expect(getVisibleTodoTitles()).toEqual(["散歩", "買い物", "筋トレ"]);
});

test("優先度が同じ場合は作成順で表示される", () => {
  const samePriorityTodos: Todo[] = [
    { ...todos[0], priority: "medium" },
    { ...todos[1], priority: "high" },
    { ...todos[2], priority: "high", completed: false },
  ];

  render(<TodoList todos={samePriorityTodos} />);

  expect(getVisibleTodoTitles()).toEqual(["散歩", "買い物", "筋トレ"]);
});

test("デフォルト順で並び替えできる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("Todo 並び替え"), {
    target: { value: "dueDate" },
  });
  fireEvent.change(screen.getByLabelText("Todo 並び替え"), {
    target: { value: "created" },
  });

  expect(getVisibleTodoTitles()).toEqual(["散歩", "買い物", "筋トレ"]);
});

test("期限日が近い順で並び替えできる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("Todo 並び替え"), {
    target: { value: "dueDate" },
  });

  expect(getVisibleTodoTitles()).toEqual(["筋トレ", "散歩", "買い物"]);
});

test("優先度が高い順で並び替えできる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("Todo 並び替え"), {
    target: { value: "priority" },
  });

  expect(getVisibleTodoTitles()).toEqual(["散歩", "買い物", "筋トレ"]);
});

test("メニューを開くと検索欄が表示される", () => {
  render(<TodoList todos={todos} />);

  const menuButton = screen.getByRole("button", { name: "絞り込み・並び替えメニューを開く" });

  expect(menuButton.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(menuButton);

  expect(screen.getByRole("button", { name: "絞り込み・並び替えメニューを閉じる" }).getAttribute("aria-expanded")).toBe(
    "true",
  );
  expect(screen.getByLabelText("Todo 検索")).toBeDefined();
});

test("メニュー内の検索欄で検索できる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "絞り込み・並び替えメニューを開く" }));
  fireEvent.change(screen.getByLabelText("Todo 検索"), {
    target: { value: "散歩" },
  });

  expect(screen.queryByText("筋トレ")).toBeNull();
  expect(screen.getByText("散歩")).toBeDefined();
  expect(screen.queryByText("買い物")).toBeNull();
  expect(screen.getByText("検索中")).toBeDefined();
});

test("メニューを開くと表示順序を選択できる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "絞り込み・並び替えメニューを開く" }));

  expect(screen.getByLabelText("Todo 並び替え")).toBeDefined();
});

test("メニュー内の表示順序変更で並び替えが動作する", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "絞り込み・並び替えメニューを開く" }));
  fireEvent.change(screen.getByLabelText("Todo 並び替え"), {
    target: { value: "priority" },
  });

  expect(getVisibleTodoTitles()).toEqual(["散歩", "買い物", "筋トレ"]);
  expect(screen.getByText("優先度が高い順", { selector: "span" })).toBeDefined();
});

test("並び替え状態が localStorage に保存される", async () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("Todo 並び替え"), {
    target: { value: "priority" },
  });

  await waitFor(() => {
    expect(localStorage.getItem(todoSortStorageKey)).toBe("priority");
  });
});

test("localStorage から並び替え状態が復元される", async () => {
  localStorage.setItem(todoSortStorageKey, "priority");

  render(<TodoList todos={todos} />);

  await waitFor(() => {
    expect((screen.getByLabelText("Todo 並び替え") as HTMLSelectElement).value).toBe(
      "priority",
    );
  });
  expect(getVisibleTodoTitles()).toEqual(["散歩", "買い物", "筋トレ"]);
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
  const memoInput = screen.getByLabelText("追加する Todo メモ") as HTMLTextAreaElement;
  const dueDateInput = screen.getByLabelText("追加する Todo 期限日") as HTMLInputElement;
  const priorityInput = screen.getByLabelText("追加する Todo 優先度") as HTMLSelectElement;
  const repeatInput = screen.getByLabelText("Todoの繰り返し設定") as HTMLSelectElement;
  const tagsInput = screen.getByLabelText("追加する Todo タグ") as HTMLInputElement;

  fireEvent.change(input, { target: { value: "読書" } });
  fireEvent.click(screen.getByRole("button", { name: "Todoを追加" }));

  expect(screen.getByText("読書")).toBeDefined();
  expect(input.value).toBe("");
  expect(memoInput.value).toBe("");
  expect(dueDateInput.value).toBe("");
  expect(priorityInput.value).toBe("none");
  expect(repeatInput.value).toBe("none");
  expect(tagsInput.value).toBe("");
});

test("Todo追加フォームの詳細項目を開閉できる", () => {
  render(<TodoList todos={todos} />);

  const openButton = screen.getByRole("button", { name: "Todo追加の詳細を表示" });

  expect(openButton.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(openButton);

  const closeButton = screen.getByRole("button", { name: "Todo追加の詳細を隠す" });

  expect(closeButton.getAttribute("aria-expanded")).toBe("true");
  fireEvent.click(closeButton);

  expect(screen.getByRole("button", { name: "Todo追加の詳細を表示" }).getAttribute("aria-expanded")).toBe(
    "false",
  );
});

test("詳細項目を閉じた状態でTodoを追加できる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("追加する Todo"), {
    target: { value: "水を飲む" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを追加" }));

  expect(screen.getByText("水を飲む")).toBeDefined();
});

test("詳細項目を開いた状態でTodoを追加できる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "Todo追加の詳細を表示" }));
  fireEvent.change(screen.getByLabelText("追加する Todo"), {
    target: { value: "読書" },
  });
  fireEvent.change(screen.getByLabelText("追加する Todo メモ"), {
    target: { value: "寝る前に読む" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを追加" }));

  expect(screen.getByText("読書")).toBeDefined();
  expect(screen.getByText("寝る前に読む")).toBeDefined();
});

test("メモ付き Todo を追加できる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("追加する Todo"), {
    target: { value: "読書" },
  });
  fireEvent.change(screen.getByLabelText("追加する Todo メモ"), {
    target: { value: "2章まで読む" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを追加" }));

  expect(screen.getByText("読書")).toBeDefined();
  expect(screen.getByText("2章まで読む")).toBeDefined();
});

test("期限日付き Todo を追加できる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("追加する Todo"), {
    target: { value: "読書" },
  });
  fireEvent.change(screen.getByLabelText("追加する Todo 期限日"), {
    target: { value: tomorrow },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを追加" }));

  expect(screen.getByText("読書")).toBeDefined();
  expect(screen.getAllByText(formatDueDate(tomorrow)).length).toBeGreaterThan(0);
});

test("期限切れ未完了Todoの期限日が赤色で表示される", () => {
  const overdueTodos: Todo[] = [
    {
      id: 1,
      title: "期限切れ Todo",
      memo: "",
      dueDate: yesterday,
      priority: "none",
      repeat: "none",
      tags: [],
      subtasks: [],
      completed: false,
    },
  ];

  render(<TodoList todos={overdueTodos} />);

  const dueDateLabel = screen.getByText(formatDueDate(yesterday), {
    selector: "span",
  });

  expect(dueDateLabel.className).toContain("text-red-700");
});

test("完了済みTodoは期限切れでも赤色表示にならない", () => {
  const completedOverdueTodos: Todo[] = [
    {
      id: 1,
      title: "完了済み期限切れ Todo",
      memo: "",
      dueDate: yesterday,
      priority: "none",
      repeat: "none",
      tags: [],
      subtasks: [],
      completed: true,
    },
  ];

  render(<TodoList todos={completedOverdueTodos} />);

  const dueDateLabel = screen.getByText(formatDueDate(yesterday), {
    selector: "span",
  });

  expect(dueDateLabel.className).not.toContain("text-red-700");
  expect(dueDateLabel.className).toContain("text-gray-400");
});

test("期限日表示に「期限日:」が表示されない", () => {
  render(<TodoList todos={todos} />);

  expect(screen.getAllByText(formatDueDate(today)).length).toBeGreaterThan(0);
  expect(screen.queryByText(/期限日:/)).toBeNull();
});

test("期限日なし Todo も追加できる", async () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("追加する Todo"), {
    target: { value: "読書" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを追加" }));

  expect(screen.getByText("読書")).toBeDefined();

  await waitFor(() => {
    const storedTodos = JSON.parse(localStorage.getItem(todoStorageKey) ?? "[]") as Todo[];

    expect(storedTodos.find((todo) => todo.title === "読書")?.dueDate).toBe("");
  });
});

test("優先度付き Todo を追加できる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("追加する Todo"), {
    target: { value: "読書" },
  });
  fireEvent.change(screen.getByLabelText("追加する Todo 優先度"), {
    target: { value: "high" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを追加" }));

  expect(screen.getByText("読書")).toBeDefined();
  expect(screen.getAllByText("優先度: 高").length).toBeGreaterThan(0);
});

test("優先度なし Todo も追加できる", async () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("追加する Todo"), {
    target: { value: "読書" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを追加" }));

  expect(screen.getByText("読書")).toBeDefined();

  await waitFor(() => {
    const storedTodos = JSON.parse(localStorage.getItem(todoStorageKey) ?? "[]") as Todo[];

    expect(storedTodos.find((todo) => todo.title === "読書")?.priority).toBe("none");
  });
});

test("繰り返しなしのTodoを追加できる", async () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("追加する Todo"), {
    target: { value: "読書" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを追加" }));

  expect(screen.getByText("読書")).toBeDefined();
  expect(screen.queryByText("繰り返し: なし", { selector: "span" })).toBeNull();

  await waitFor(() => {
    const storedTodos = JSON.parse(localStorage.getItem(todoStorageKey) ?? "[]") as Todo[];

    expect(storedTodos.find((todo) => todo.title === "読書")?.repeat).toBe("none");
  });
});

test("毎日の繰り返しTodoを追加できる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("追加する Todo"), {
    target: { value: "読書" },
  });
  fireEvent.change(screen.getByLabelText("Todoの繰り返し設定"), {
    target: { value: "daily" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを追加" }));

  expect(screen.getByText("読書")).toBeDefined();
  expect(screen.getByText("毎日", { selector: "span" })).toBeDefined();
});

test("毎週の繰り返しTodoを追加できる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("追加する Todo"), {
    target: { value: "読書" },
  });
  fireEvent.change(screen.getByLabelText("Todoの繰り返し設定"), {
    target: { value: "weekly" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを追加" }));

  expect(screen.getByText("読書")).toBeDefined();
  expect(screen.getByText("毎週", { selector: "span" })).toBeDefined();
});

test("毎月の繰り返しTodoを追加できる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("追加する Todo"), {
    target: { value: "読書" },
  });
  fireEvent.change(screen.getByLabelText("Todoの繰り返し設定"), {
    target: { value: "monthly" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを追加" }));

  expect(screen.getByText("読書")).toBeDefined();
  expect(screen.getByText("毎月", { selector: "span" })).toBeDefined();
});

test("繰り返し表示に「繰り返し:」が表示されない", () => {
  render(<TodoList todos={[{ ...todos[0], repeat: "daily" }]} />);

  expect(screen.getByText("毎日", { selector: "span" })).toBeDefined();
  expect(screen.queryByText(/繰り返し:/, { selector: "span" })).toBeNull();
});

test("タグ付き Todo を追加できる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("追加する Todo"), {
    target: { value: "読書" },
  });
  fireEvent.change(screen.getByLabelText("追加する Todo タグ"), {
    target: { value: "学習, 趣味" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを追加" }));

  expect(screen.getByText("読書")).toBeDefined();
  expect(screen.getByText("#学習")).toBeDefined();
  expect(screen.getByText("#趣味")).toBeDefined();
});

test("test と入力したタグが #test として保存・表示される", async () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("追加する Todo"), {
    target: { value: "タグ確認" },
  });
  fireEvent.change(screen.getByLabelText("追加する Todo タグ"), {
    target: { value: "test" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを追加" }));

  expect(screen.getByText("#test")).toBeDefined();

  await waitFor(() => {
    const storedTodos = JSON.parse(localStorage.getItem(todoStorageKey) ?? "[]") as Todo[];

    expect(storedTodos.find((todo) => todo.title === "タグ確認")?.tags).toEqual(["#test"]);
  });
});

test("#test と入力したタグが #test として保存・表示される", async () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("追加する Todo"), {
    target: { value: "タグ確認" },
  });
  fireEvent.change(screen.getByLabelText("追加する Todo タグ"), {
    target: { value: "#test" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを追加" }));

  expect(screen.getByText("#test")).toBeDefined();

  await waitFor(() => {
    const storedTodos = JSON.parse(localStorage.getItem(todoStorageKey) ?? "[]") as Todo[];

    expect(storedTodos.find((todo) => todo.title === "タグ確認")?.tags).toEqual(["#test"]);
  });
});

test("##test と入力したタグが #test として保存・表示される", async () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("追加する Todo"), {
    target: { value: "タグ確認" },
  });
  fireEvent.change(screen.getByLabelText("追加する Todo タグ"), {
    target: { value: "##test" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを追加" }));

  expect(screen.getByText("#test")).toBeDefined();

  await waitFor(() => {
    const storedTodos = JSON.parse(localStorage.getItem(todoStorageKey) ?? "[]") as Todo[];

    expect(storedTodos.find((todo) => todo.title === "タグ確認")?.tags).toEqual(["#test"]);
  });
});

test("Todo 追加後に localStorage へ保存される", async () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("追加する Todo"), {
    target: { value: "読書" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを追加" }));

  await waitFor(() => {
    expect(localStorage.getItem(todoStorageKey)).toContain("読書");
  });
});

test("Todo 追加後に localStorage へメモも保存される", async () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("追加する Todo"), {
    target: { value: "読書" },
  });
  fireEvent.change(screen.getByLabelText("追加する Todo メモ"), {
    target: { value: "2章まで読む" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを追加" }));

  await waitFor(() => {
    const storedTodos = JSON.parse(localStorage.getItem(todoStorageKey) ?? "[]") as Todo[];

    expect(storedTodos.find((todo) => todo.title === "読書")?.memo).toBe("2章まで読む");
  });
});

test("Todo 追加後に localStorage へ期限日も保存される", async () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("追加する Todo"), {
    target: { value: "読書" },
  });
  fireEvent.change(screen.getByLabelText("追加する Todo 期限日"), {
    target: { value: tomorrow },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを追加" }));

  await waitFor(() => {
    const storedTodos = JSON.parse(localStorage.getItem(todoStorageKey) ?? "[]") as Todo[];

    expect(storedTodos.find((todo) => todo.title === "読書")?.dueDate).toBe(tomorrow);
  });
});

test("Todo 追加後に localStorage へ優先度も保存される", async () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("追加する Todo"), {
    target: { value: "読書" },
  });
  fireEvent.change(screen.getByLabelText("追加する Todo 優先度"), {
    target: { value: "medium" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを追加" }));

  await waitFor(() => {
    const storedTodos = JSON.parse(localStorage.getItem(todoStorageKey) ?? "[]") as Todo[];

    expect(storedTodos.find((todo) => todo.title === "読書")?.priority).toBe("medium");
  });
});

test("localStorageにrepeatが保存される", async () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("追加する Todo"), {
    target: { value: "読書" },
  });
  fireEvent.change(screen.getByLabelText("Todoの繰り返し設定"), {
    target: { value: "weekly" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを追加" }));

  await waitFor(() => {
    const storedTodos = JSON.parse(localStorage.getItem(todoStorageKey) ?? "[]") as Todo[];

    expect(storedTodos.find((todo) => todo.title === "読書")?.repeat).toBe("weekly");
  });
});

test("Todo 追加後に localStorage へタグも保存される", async () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("追加する Todo"), {
    target: { value: "読書" },
  });
  fireEvent.change(screen.getByLabelText("追加する Todo タグ"), {
    target: { value: "学習, 趣味" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを追加" }));

  await waitFor(() => {
    const storedTodos = JSON.parse(localStorage.getItem(todoStorageKey) ?? "[]") as Todo[];

    expect(storedTodos.find((todo) => todo.title === "読書")?.tags).toEqual([
      "#学習",
      "#趣味",
    ]);
  });
});

test("localStorage からメモも復元できる", async () => {
  localStorage.setItem(
    todoStorageKey,
    JSON.stringify([
      { id: 10, title: "保存済み Todo", memo: "保存済みメモ", completed: false },
    ]),
  );

  render(<TodoList todos={todos} />);

  await waitFor(() => {
    expect(screen.getByText("保存済み Todo")).toBeDefined();
    expect(screen.getByText("保存済みメモ")).toBeDefined();
  });
});

test("localStorage から優先度も復元できる", async () => {
  localStorage.setItem(
    todoStorageKey,
    JSON.stringify([
      {
        id: 10,
        title: "保存済み Todo",
        memo: "",
        dueDate: "",
        priority: "high",
        completed: false,
      },
    ]),
  );

  render(<TodoList todos={todos} />);

  await waitFor(() => {
    expect(screen.getByText("保存済み Todo")).toBeDefined();
    expect(screen.getAllByText("優先度: 高").length).toBeGreaterThan(0);
  });
});

test("localStorageからrepeatが復元される", async () => {
  localStorage.setItem(
    todoStorageKey,
    JSON.stringify([
      {
        id: 10,
        title: "保存済み Todo",
        memo: "",
        dueDate: "",
        priority: "none",
        repeat: "monthly",
        tags: [],
        subtasks: [],
        completed: false,
      },
    ]),
  );

  render(<TodoList todos={todos} />);

  await waitFor(() => {
    expect(screen.getByText("保存済み Todo")).toBeDefined();
    expect(screen.getByText("毎月", { selector: "span" })).toBeDefined();
  });
});

test("localStorage からタグも復元できる", async () => {
  localStorage.setItem(
    todoStorageKey,
    JSON.stringify([
      {
        id: 10,
        title: "保存済み Todo",
        memo: "",
        dueDate: "",
        priority: "none",
        tags: ["#保存タグ"],
        completed: false,
      },
    ]),
  );

  render(<TodoList todos={todos} />);

  await waitFor(() => {
    expect(screen.getByText("保存済み Todo")).toBeDefined();
    expect(screen.getByText("#保存タグ")).toBeDefined();
  });
});

test("localStorage から期限日も復元できる", async () => {
  localStorage.setItem(
    todoStorageKey,
    JSON.stringify([
      {
        id: 10,
        title: "保存済み Todo",
        memo: "",
        dueDate: tomorrow,
        completed: false,
      },
    ]),
  );

  render(<TodoList todos={todos} />);

  await waitFor(() => {
    expect(screen.getByText("保存済み Todo")).toBeDefined();
    expect(screen.getByText(formatDueDate(tomorrow))).toBeDefined();
  });
});

test("dueDate がない既存データでも画面が壊れない", async () => {
  localStorage.setItem(
    todoStorageKey,
    JSON.stringify([{ id: 10, title: "古い Todo", memo: "", completed: false }]),
  );

  render(<TodoList todos={todos} />);

  await waitFor(() => {
    expect(screen.getByText("古い Todo")).toBeDefined();
  });
});

test("priority がない既存データでも画面が壊れない", async () => {
  localStorage.setItem(
    todoStorageKey,
    JSON.stringify([
      { id: 10, title: "古い Todo", memo: "", dueDate: "", completed: false },
    ]),
  );

  render(<TodoList todos={todos} />);

  await waitFor(() => {
    expect(screen.getByText("古い Todo")).toBeDefined();
  });
});

test("tags がない既存データでも画面が壊れない", async () => {
  localStorage.setItem(
    todoStorageKey,
    JSON.stringify([
      {
        id: 10,
        title: "古い Todo",
        memo: "",
        dueDate: "",
        priority: "none",
        completed: false,
      },
    ]),
  );

  render(<TodoList todos={todos} />);

  await waitFor(() => {
    expect(screen.getByText("古い Todo")).toBeDefined();
  });
});

test("subtasks がない既存データでも画面が壊れない", async () => {
  localStorage.setItem(
    todoStorageKey,
    JSON.stringify([
      {
        id: 10,
        title: "古い Todo",
        memo: "",
        dueDate: "",
        priority: "none",
        tags: [],
        completed: false,
      },
    ]),
  );

  render(<TodoList todos={todos} />);

  await waitFor(() => {
    expect(screen.getByText("古い Todo")).toBeDefined();
    expect(screen.getByText("サブタスク: 0/0")).toBeDefined();
  });
});

test("repeatがない古いlocalStorageデータでも画面が壊れない", async () => {
  localStorage.setItem(
    todoStorageKey,
    JSON.stringify([
      {
        id: 10,
        title: "古い Todo",
        memo: "",
        dueDate: "",
        priority: "none",
        tags: [],
        subtasks: [],
        completed: false,
      },
    ]),
  );

  render(<TodoList todos={todos} />);

  await waitFor(() => {
    expect(screen.getByText("古い Todo")).toBeDefined();
    expect(screen.queryByText("繰り返し: なし", { selector: "span" })).toBeNull();
  });
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
  const addButton = screen.getByRole("button", { name: "Todoを追加" }) as HTMLButtonElement;

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

test("Todo 完了切り替え後に localStorage へ保存される", async () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByText("筋トレ"));

  await waitFor(() => {
    const storedTodos = JSON.parse(localStorage.getItem(todoStorageKey) ?? "[]") as Todo[];

    expect(storedTodos.find((todo) => todo.title === "筋トレ")?.completed).toBe(true);
  });
});

test("Todo を削除できる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "散歩を削除する" }));

  expect(screen.getByText("筋トレ")).toBeDefined();
  expect(screen.queryByText("散歩")).toBeNull();
  expect(screen.getByText("買い物")).toBeDefined();
});

test("Todo 削除後に localStorage へ保存される", async () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "散歩を削除する" }));

  await waitFor(() => {
    expect(localStorage.getItem(todoStorageKey)).not.toContain("散歩");
  });
});

test("Todo を編集できる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "筋トレを編集する" }));
  fireEvent.change(screen.getByLabelText("Todo タイトルを編集"), {
    target: { value: "朝の筋トレ" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを保存" }));

  expect(screen.getByText("朝の筋トレ")).toBeDefined();
  expect(screen.queryByText("筋トレ")).toBeNull();
});

test("編集ボタンを押すと詳細項目が表示された状態になる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "筋トレを編集する" }));

  const closeButton = screen.getByRole("button", { name: "筋トレの編集詳細を隠す" });

  expect(closeButton.getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByLabelText("Todo メモを編集")).toBeDefined();
  expect(screen.getByLabelText("Todo 期限日を編集")).toBeDefined();
  expect(screen.getByLabelText("Todo 優先度を編集")).toBeDefined();
  expect(screen.getByLabelText("Todo タグを編集")).toBeDefined();
  expect(screen.getByLabelText("筋トレの繰り返し設定を変更")).toBeDefined();
  fireEvent.change(screen.getByLabelText("Todo メモを編集"), {
    target: { value: "フォーム詳細から更新" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを保存" }));

  expect(screen.getByText("フォーム詳細から更新")).toBeDefined();
});

test("メモを編集できる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "筋トレを編集する" }));
  fireEvent.change(screen.getByLabelText("Todo メモを編集"), {
    target: { value: "腕立てを20回" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを保存" }));

  expect(screen.getByText("腕立てを20回")).toBeDefined();
});

test("編集時に詳細表示ボタンを押さずに期限日を変更できる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "筋トレを編集する" }));
  fireEvent.change(screen.getByLabelText("Todo 期限日を編集"), {
    target: { value: tomorrow },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを保存" }));

  expect(screen.getAllByText(formatDueDate(tomorrow)).length).toBeGreaterThan(0);
});

test("期限日を削除できる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "筋トレを編集する" }));
  fireEvent.change(screen.getByLabelText("Todo 期限日を編集"), {
    target: { value: "" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを保存" }));

  expect(screen.queryByText(formatDueDate(today))).toBeNull();
});

test("編集時に詳細表示ボタンを押さずに優先度を変更できる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "筋トレを編集する" }));
  fireEvent.change(screen.getByLabelText("Todo 優先度を編集"), {
    target: { value: "high" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを保存" }));

  expect(screen.getAllByText("優先度: 高").length).toBeGreaterThan(0);
});

test("編集時に詳細表示ボタンを押さずに繰り返し設定を変更できる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "筋トレを編集する" }));
  fireEvent.change(screen.getByLabelText("筋トレの繰り返し設定を変更"), {
    target: { value: "daily" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを保存" }));

  expect(screen.getByText("毎日", { selector: "span" })).toBeDefined();
});

test("編集時に詳細表示ボタンを押さずにタグを変更できる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "筋トレを編集する" }));
  fireEvent.change(screen.getByLabelText("Todo タグを編集"), {
    target: { value: "運動, 朝" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを保存" }));

  expect(screen.getByText("#運動")).toBeDefined();
  expect(screen.getByText("#朝")).toBeDefined();
  expect(screen.queryByText("#健康")).toBeNull();
});

test("サブタスクを追加できる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("筋トレ のサブタスクを追加"), {
    target: { value: "腹筋をする" },
  });
  fireEvent.click(screen.getByRole("button", { name: "筋トレのサブタスクを追加" }));

  expect(screen.getByText("腹筋をする")).toBeDefined();
  expect(screen.getByText("サブタスク: 0/1")).toBeDefined();
});

test("サブタスクを編集できる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("筋トレ のサブタスクを追加"), {
    target: { value: "腹筋をする" },
  });
  fireEvent.click(screen.getByRole("button", { name: "筋トレのサブタスクを追加" }));
  fireEvent.click(screen.getByRole("button", { name: "腹筋をするを編集する" }));
  fireEvent.change(screen.getByLabelText("サブタスクを編集"), {
    target: { value: "背筋をする" },
  });
  fireEvent.click(screen.getByRole("button", { name: "サブタスクを保存" }));

  expect(screen.getByText("背筋をする")).toBeDefined();
  expect(screen.queryByText("腹筋をする")).toBeNull();
});

test("サブタスクを削除できる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("筋トレ のサブタスクを追加"), {
    target: { value: "腹筋をする" },
  });
  fireEvent.click(screen.getByRole("button", { name: "筋トレのサブタスクを追加" }));
  fireEvent.click(screen.getByRole("button", { name: "腹筋をするを削除する" }));

  expect(screen.queryByText("腹筋をする")).toBeNull();
  expect(screen.getAllByText("サブタスク: 0/0").length).toBeGreaterThan(0);
});

test("サブタスクの完了状態を変更できる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("筋トレ のサブタスクを追加"), {
    target: { value: "腹筋をする" },
  });
  fireEvent.click(screen.getByRole("button", { name: "筋トレのサブタスクを追加" }));
  fireEvent.click(screen.getByRole("button", { name: "サブタスクを完了にする" }));

  expect(screen.getByRole("button", { name: "サブタスクを未完了に戻す" })).toBeDefined();
  expect(screen.getByText("サブタスク: 1/1")).toBeDefined();
});

test("サブタスクがある親Todoを完了にすると、全サブタスクも完了になる", async () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("筋トレ のサブタスクを追加"), {
    target: { value: "腹筋をする" },
  });
  fireEvent.click(screen.getByRole("button", { name: "筋トレのサブタスクを追加" }));
  fireEvent.change(screen.getByLabelText("筋トレ のサブタスクを追加"), {
    target: { value: "背筋をする" },
  });
  fireEvent.click(screen.getByRole("button", { name: "筋トレのサブタスクを追加" }));
  fireEvent.click(screen.getByText("筋トレ"));

  expect(screen.getByText("サブタスク: 2/2")).toBeDefined();

  await waitFor(() => {
    const storedTodos = JSON.parse(localStorage.getItem(todoStorageKey) ?? "[]") as Todo[];

    expect(storedTodos.find((todo) => todo.title === "筋トレ")?.subtasks).toEqual([
      { id: 1, title: "腹筋をする", completed: true },
      { id: 2, title: "背筋をする", completed: true },
    ]);
  });
});

test("親Todoを完了から未完了に戻しても、サブタスクは勝手に未完了へ戻らない", () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("筋トレ のサブタスクを追加"), {
    target: { value: "腹筋をする" },
  });
  fireEvent.click(screen.getByRole("button", { name: "筋トレのサブタスクを追加" }));
  fireEvent.click(screen.getByText("筋トレ"));
  fireEvent.click(screen.getByText("筋トレ"));

  expect(screen.getByText("サブタスク: 1/1")).toBeDefined();
  expect(screen.getByRole("button", { name: "サブタスクを未完了に戻す" })).toBeDefined();
});

test("サブタスク数と完了数が正しく表示される", () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("筋トレ のサブタスクを追加"), {
    target: { value: "腹筋をする" },
  });
  fireEvent.click(screen.getByRole("button", { name: "筋トレのサブタスクを追加" }));
  fireEvent.change(screen.getByLabelText("筋トレ のサブタスクを追加"), {
    target: { value: "背筋をする" },
  });
  fireEvent.click(screen.getByRole("button", { name: "筋トレのサブタスクを追加" }));
  fireEvent.click(screen.getAllByRole("button", { name: "サブタスクを完了にする" })[0]);

  expect(screen.getByText("サブタスク: 1/2")).toBeDefined();
});

test("localStorage にサブタスクが保存される", async () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("筋トレ のサブタスクを追加"), {
    target: { value: "腹筋をする" },
  });
  fireEvent.click(screen.getByRole("button", { name: "筋トレのサブタスクを追加" }));

  await waitFor(() => {
    const storedTodos = JSON.parse(localStorage.getItem(todoStorageKey) ?? "[]") as Todo[];

    expect(storedTodos.find((todo) => todo.title === "筋トレ")?.subtasks).toEqual([
      { id: 1, title: "腹筋をする", completed: false },
    ]);
  });
});

test("localStorage からサブタスクが復元される", async () => {
  localStorage.setItem(
    todoStorageKey,
    JSON.stringify([
      {
        id: 10,
        title: "保存済み Todo",
        memo: "",
        dueDate: "",
        priority: "none",
        tags: [],
        subtasks: [{ id: 1, title: "保存済みサブタスク", completed: true }],
        completed: false,
      },
    ]),
  );

  render(<TodoList todos={todos} />);

  await waitFor(() => {
    expect(screen.getByText("保存済み Todo")).toBeDefined();
    expect(screen.getByText("保存済みサブタスク")).toBeDefined();
    expect(screen.getByText("サブタスク: 1/1")).toBeDefined();
  });
});

test("タイトル検索ができる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("Todo 検索"), {
    target: { value: "散歩" },
  });

  expect(screen.queryByText("筋トレ")).toBeNull();
  expect(screen.getByText("散歩")).toBeDefined();
  expect(screen.queryByText("買い物")).toBeNull();
});

test("メモ検索ができる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("Todo 検索"), {
    target: { value: "公園" },
  });

  expect(screen.queryByText("筋トレ")).toBeNull();
  expect(screen.getByText("散歩")).toBeDefined();
  expect(screen.queryByText("買い物")).toBeNull();
});

test("タグ検索ができる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("Todo 検索"), {
    target: { value: "生活" },
  });

  expect(screen.queryByText("筋トレ")).toBeNull();
  expect(screen.queryByText("散歩")).toBeNull();
  expect(screen.getByText("買い物")).toBeDefined();
});

test("#付きタグ検索ができる", () => {
  render(<TodoList todos={todos} />);

  fireEvent.change(screen.getByLabelText("Todo 検索"), {
    target: { value: "#生活" },
  });

  expect(screen.queryByText("筋トレ")).toBeNull();
  expect(screen.queryByText("散歩")).toBeNull();
  expect(screen.getByText("買い物")).toBeDefined();
});

test("サブタスク名で検索すると、その親Todoが表示される", () => {
  const todosWithSubtask = todos.map((todo) =>
    todo.title === "筋トレ"
      ? { ...todo, subtasks: [{ id: 1, title: "腹筋をする", completed: false }] }
      : todo,
  );

  render(<TodoList todos={todosWithSubtask} />);

  fireEvent.change(screen.getByLabelText("Todo 検索"), {
    target: { value: "腹筋" },
  });

  expect(screen.getByText("筋トレ")).toBeDefined();
});

test("サブタスク名で検索しても関係ないTodoは表示されない", () => {
  const todosWithSubtask = todos.map((todo) =>
    todo.title === "筋トレ"
      ? { ...todo, subtasks: [{ id: 1, title: "腹筋をする", completed: false }] }
      : todo,
  );

  render(<TodoList todos={todosWithSubtask} />);

  fireEvent.change(screen.getByLabelText("Todo 検索"), {
    target: { value: "腹筋" },
  });

  expect(screen.queryByText("散歩")).toBeNull();
  expect(screen.queryByText("買い物")).toBeNull();
});

test("Todo 編集後に localStorage へ保存される", async () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "筋トレを編集する" }));
  fireEvent.change(screen.getByLabelText("Todo タイトルを編集"), {
    target: { value: "朝の筋トレ" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを保存" }));

  await waitFor(() => {
    expect(localStorage.getItem(todoStorageKey)).toContain("朝の筋トレ");
  });
});

test("Todo 編集後に localStorage へメモも保存される", async () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "筋トレを編集する" }));
  fireEvent.change(screen.getByLabelText("Todo メモを編集"), {
    target: { value: "腕立てを20回" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを保存" }));

  await waitFor(() => {
    const storedTodos = JSON.parse(localStorage.getItem(todoStorageKey) ?? "[]") as Todo[];

    expect(storedTodos.find((todo) => todo.title === "筋トレ")?.memo).toBe("腕立てを20回");
  });
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

  const saveButton = screen.getByRole("button", { name: "Todoを保存" }) as HTMLButtonElement;

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
  fireEvent.click(screen.getByRole("button", { name: "Todoを保存" }));
  fireEvent.click(screen.getByText("朝の筋トレ"));

  expect(screen.getAllByLabelText("未完了に戻す")).toHaveLength(2);
});

test("編集後も削除が動作する", () => {
  render(<TodoList todos={todos} />);

  fireEvent.click(screen.getByRole("button", { name: "散歩を編集する" }));
  fireEvent.change(screen.getByLabelText("Todo タイトルを編集"), {
    target: { value: "夕方の散歩" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Todoを保存" }));
  fireEvent.click(screen.getByRole("button", { name: "夕方の散歩を削除する" }));

  expect(screen.queryByText("夕方の散歩")).toBeNull();
  expect(screen.getByText("筋トレ")).toBeDefined();
  expect(screen.getByText("買い物")).toBeDefined();
});
