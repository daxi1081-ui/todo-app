export type Todo = {
  /** React の key に使うため、一覧内で重複しない値にする。 */
  id: number;
  /** 表示する Todo 名。 */
  title: string;
  /** 完了済みかどうか。 */
  completed: boolean;
};

export type TodoFilter = "all" | "active" | "completed";

export type TodoFilterOption = {
  /** フィルタボタンに表示するラベル。 */
  label: string;
  /** 絞り込みに使うフィルタ値。 */
  value: TodoFilter;
};
