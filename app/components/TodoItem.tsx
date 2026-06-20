type TodoItemProps = {
  /** 一覧から渡されたTODO名。表示専用なので、このコンポーネント内では更新しない。 */
  title: string;
  /** 完了済みかどうか。チェック表示と取り消し線の有無を切り替える。 */
  completed: boolean;
  /** 完了状態を切り替える処理。 */
  onToggle: () => void;
  /** TODOを削除する処理。 */
  onDelete: () => void;
};

/**
 * TODOを1件分表示するコンポーネントです。
 * @param {TodoItemProps} props TODO表示に必要な情報
 * @param {string} props.title 表示するTODO名
 * @param {boolean} props.completed 完了済みかどうか
 * @param {() => void} props.onToggle 完了状態を切り替える処理
 * @param {() => void} props.onDelete TODOを削除する処理
 * @returns {JSX.Element} TODO1件分の表示
 */
export function TodoItem({ title, completed, onToggle, onDelete }: TodoItemProps) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-4 last:border-b-0">
      <button
        type="button"
        className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-300"
        aria-label={completed ? "未完了に戻す" : "完了にする"}
        aria-pressed={completed}
        onClick={onToggle}
      >
        {completed ? "✓" : ""}
      </button>

      <button type="button" className="flex-1 text-left" onClick={onToggle}>
        <span className={completed ? "text-gray-400 line-through" : "text-gray-900"}>
          {title}
        </span>
      </button>

      <button
        type="button"
        className="text-sm font-semibold text-red-400 hover:text-red-500"
        aria-label={`${title}を削除する`}
        onClick={onDelete}
      >
        削除
      </button>
    </div>
  );
}
