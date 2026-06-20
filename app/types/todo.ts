export type Todo = {
  /** Reactのkeyに使うため、一覧内で重複しない値にする。 */
  id: number;
  /** 表示するTODO名。 */
  title: string;
  /** 完了済みかどうか。 */
  completed: boolean;
};

export type TodoFilter = "all" | "active" | "completed";
