"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";

type TodoItemProps = {
  /** 一覧に表示する Todo 名。 */
  title: string;
  /** 完了済みかどうか。 */
  completed: boolean;
  /** 完了状態を切り替える処理。 */
  onToggle: () => void;
  /** Todo を削除する処理。 */
  onDelete: () => void;
  /** Todo 名を更新する処理。 */
  onUpdateTitle: (title: string) => void;
};

/**
 * TODO を 1 件分表示し、タイトル編集も扱うコンポーネントです。
 * @param {TodoItemProps} props TODO 表示に必要な情報
 * @param {string} props.title 表示する TODO 名
 * @param {boolean} props.completed 完了済みかどうか
 * @param {() => void} props.onToggle 完了状態を切り替える処理
 * @param {() => void} props.onDelete TODO を削除する処理
 * @param {(title: string) => void} props.onUpdateTitle TODO 名を更新する処理
 * @returns {JSX.Element} TODO 1 件分の表示
 */
export function TodoItem({
  title,
  completed,
  onToggle,
  onDelete,
  onUpdateTitle,
}: TodoItemProps) {
  const editInputId = useId();
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(title);
  const trimmedEditingTitle = editingTitle.trim();

  /**
   * 編集モードを開始し、現在のタイトルを入力欄に反映します。
   */
  function startEditing() {
    setEditingTitle(title);
    setIsEditing(true);
  }

  /**
   * 編集内容を破棄し、表示モードに戻します。
   */
  function cancelEditing() {
    setEditingTitle(title);
    setIsEditing(false);
  }

  /**
   * 空文字でない場合だけ編集内容を保存します。
   * @param {FormEvent<HTMLFormElement>} event フォーム送信イベント
   */
  function saveEditing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (trimmedEditingTitle.length === 0) {
      return;
    }

    onUpdateTitle(trimmedEditingTitle);
    setIsEditing(false);
  }

  return (
    <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-4 last:border-b-0">
      <button
        type="button"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-300"
        aria-label={completed ? "未完了に戻す" : "完了にする"}
        aria-pressed={completed}
        onClick={onToggle}
      >
        {completed ? "✓" : ""}
      </button>

      {isEditing ? (
        <form className="flex min-w-0 flex-1 items-center gap-2" onSubmit={saveEditing}>
          <label htmlFor={editInputId} className="sr-only">
            編集タイトル
          </label>
          <input
            id={editInputId}
            type="text"
            value={editingTitle}
            onChange={(event) => setEditingTitle(event.target.value)}
            className="min-w-0 flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-400"
          />
          <button
            type="submit"
            className="text-sm font-semibold text-blue-500 disabled:cursor-not-allowed disabled:text-gray-300"
            disabled={trimmedEditingTitle.length === 0}
          >
            保存
          </button>
          <button
            type="button"
            className="text-sm font-semibold text-gray-500 hover:text-gray-700"
            onClick={cancelEditing}
          >
            キャンセル
          </button>
        </form>
      ) : (
        <>
          <button type="button" className="min-w-0 flex-1 text-left" onClick={onToggle}>
            <span
              className={
                completed
                  ? "block truncate text-gray-400 line-through"
                  : "block truncate text-gray-900"
              }
            >
              {title}
            </span>
          </button>

          <button
            type="button"
            className="text-sm font-semibold text-blue-500 hover:text-blue-600"
            aria-label={`${title}を編集する`}
            onClick={startEditing}
          >
            編集
          </button>
        </>
      )}

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
