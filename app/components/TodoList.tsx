import { TodoItem } from "./TodoItem";

export type Todo = {
  /** Reactのkeyに使うため、一覧内で重複しない値にする。 */
  id: number;
  /** 表示するTODO名。 */
  title: string;
  /** 完了済みかどうか。 */
  completed: boolean;
};

type TodoListProps = {
  /** page.tsxから受け取るTODO配列。 */
  todos: Todo[];
};

/**
 * TODO配列を一覧として表示するコンポーネントです。
 * @param {TodoListProps} props TODO一覧の表示に必要な情報
 * @param {Todo[]} props.todos 表示するTODOの配列
 * @returns {JSX.Element} TODO一覧の表示
 */
export function TodoList({ todos }: TodoListProps) {
  return (
    <div className="rounded-2xl bg-white shadow-sm">
      {/* page.tsxから受け取ったTODO配列を、1件ずつ表示用コンポーネントへ渡す。 */}
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          title={todo.title}
          completed={todo.completed}
        />
      ))}
    </div>
  );
}
