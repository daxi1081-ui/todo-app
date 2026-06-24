export type Todo = {
  /** React の key に使う、一意な Todo ID。 */
  id: number;
  /** 画面に表示する Todo タイトル。 */
  title: string;
  /** Todo の補足メモ。 */
  memo: string;
  /** Todo の期限日。未設定の場合は空文字。 */
  dueDate: string;
  /** Todo の優先度。 */
  priority: TodoPriority;
  /** Todo に付けるタグ一覧。 */
  tags: string[];
  /** Todo に紐づくサブタスク一覧。 */
  subtasks: TodoSubtask[];
  /** Todo が完了済みかどうか。 */
  completed: boolean;
};

export type TodoSubtask = {
  /** サブタスクの一意な ID。 */
  id: number;
  /** サブタスクのタイトル。 */
  title: string;
  /** サブタスクが完了済みかどうか。 */
  completed: boolean;
};

export type TodoPriority = "none" | "low" | "medium" | "high";

export type TodoFilter = "all" | "active" | "completed" | "today" | "scheduled";

export type TodoSort = "created" | "dueDate" | "priority";

export type TodoFilterOption = {
  /** フィルタボタンに表示するラベル。 */
  label: string;
  /** 絞り込みに使うフィルタ値。 */
  value: TodoFilter;
};

export type TodoSortOption = {
  /** 並び替えセレクトに表示するラベル。 */
  label: string;
  /** 並び替えに使う値。 */
  value: TodoSort;
};

export type TodoPriorityOption = {
  /** 優先度セレクトや表示に使うラベル。 */
  label: string;
  /** 優先度の値。 */
  value: TodoPriority;
};
