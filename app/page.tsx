import { TodoList } from "./components/TodoList";
import type { Todo } from "./types/todo";

/**
 * 画面表示用の仮データです。
 * 将来 API や DB に置き換える場合は、この一覧の取得処理を差し替えます。
 */
const todos: Todo[] = [
  { id: 1, title: "筋トレ", memo: "", dueDate: "", priority: "none", completed: false },
  { id: 2, title: "散歩", memo: "", dueDate: "", priority: "none", completed: false },
  { id: 3, title: "買い物", memo: "", dueDate: "", priority: "none", completed: true },
];

/**
 * Todo 一覧ページを表示する Next.js のページコンポーネントです。
 *
 * @returns Todo 一覧ページ。
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Todo</h1>

        <TodoList todos={todos} />
      </div>
    </main>
  );
}
