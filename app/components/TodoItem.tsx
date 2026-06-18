type TodoItemProps = {
  /** 一覧から渡されるTODO名。表示専用なので、このコンポーネント内では更新しない。 */
  title: string;
  /** 完了済みかどうか。チェック表示と取り消し線の有無を切り替える。 */
  completed: boolean;
};

/**
 * TODOを1件分表示するコンポーネントです。
 * @param {TodoItemProps} props TODO表示に必要な情報
 * @param {string} props.title 表示するTODO名
 * @param {boolean} props.completed 完了済みかどうか
 * @returns {JSX.Element} TODO1件分の表示
 */
export function TodoItem({ title, completed }: TodoItemProps) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-4 last:border-b-0">
      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-300">
        {completed ? "✓" : ""}
      </span>

      {/* 完了済みのTODOは薄い色と取り消し線で、状態が一目で分かるようにする。 */}
      <span className={completed ? "text-gray-400 line-through" : "text-gray-900"}>
        {title}
      </span>
    </div>
  );
}
