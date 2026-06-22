export type Todo = {
  /** React の key に使う、一意な Todo ID。 */
  id: number;
  /** 画面に表示する Todo タイトル。 */
  title: string;
  /** Todo が完了済みかどうか。 */
  completed: boolean;
};

export type TodoFilter = "all" | "active" | "completed";

export type TodoFilterOption = {
  /** フィルタボタンに表示するラベル。 */
  label: string;
  /** 絞り込みに使うフィルタ値。 */
  value: TodoFilter;
};
