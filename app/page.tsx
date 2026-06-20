import { TodoList } from "./components/TodoList";
import type { Todo } from "./types/todo";

/**
 * 画面表示用の仮データです。
 * 将来APIやDBに置き換える場合は、この配列を取得処理に差し替えます。
 */
const todos: Todo[] = [
  { id: 1, title: "筋トレ", completed: false },
  { id: 2, title: "散歩", completed: false },
  { id: 3, title: "買い物", completed: true },
];

/**
 * TODO一覧ページを表示するNext.jsのページコンポーネントです。
 * @returns {JSX.Element} TODO一覧ページの表示
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">すべて</h1>

        {/* Homeは画面の組み立てだけを担当し、TODOの表示詳細はTodoList側に任せる。 */}
        <TodoList todos={todos} />

      </div>
    </main>
  );
}
