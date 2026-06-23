export type Todo = {
  /** React の key に使う、一意な Todo ID。 */
  id: number;
  /** 画面に表示する Todo タイトル。 */
  title: string;
  /** Todo の補足メモ。 */
  memo: string;
  /** Todo の期限日。未設定の場合は空文字。 */
  dueDate: string;
  /** Todo が完了済みかどうか。 */
  completed: boolean;
};

export type TodoFilter = "all" | "active" | "completed" | "today" | "scheduled";

export type TodoFilterOption = {
  /** フィルタボタンに表示するラベル。 */
  label: string;
  /** 絞り込みに使うフィルタ値。 */
  value: TodoFilter;
};
