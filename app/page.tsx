const todos = [
  { id: 1, title: "筋トレ", completed: false },
  { id: 2, title: "散歩", completed: false },
  { id: 3, title: "買い物", completed: true },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">すべて</h1>

        <div className="rounded-2xl bg-white shadow-sm">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-3 border-b border-gray-100 px-4 py-4 last:border-b-0"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-300">
                {todo.completed ? "✓" : ""}
              </span>
              <span
                className={
                  todo.completed
                    ? "text-gray-400 line-through"
                    : "text-gray-900"
                }
              >
                {todo.title}
              </span>
            </div>
          ))}
        </div>

        <button className="mt-6 text-lg font-semibold text-blue-500">
          ＋ 追加
        </button>
      </div>
    </main>
  );
}