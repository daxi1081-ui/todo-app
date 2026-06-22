"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";

type TodoItemProps = {
  /** 一覧に表示する Todo タイトル。 */
  title: string;
  /** 完了済みかどうか。 */
  completed: boolean;
  /** 完了状態を切り替える処理。 */
  onToggle: () => void;
  /** Todo を削除する処理。 */
  onDelete: () => void;
  /** Todo タイトルを更新する処理。 */
  onUpdateTitle: (title: string) => void;
};

/**
 * Todo を 1 件分表示し、完了切り替え、編集、削除を扱います。
 *
 * @param props Todo 表示に必要な情報。
 * @param props.title 表示する Todo タイトル。
 * @param props.completed 完了済みかどうか。
 * @param props.onToggle 完了状態を切り替える処理。
 * @param props.onDelete Todo を削除する処理。
 * @param props.onUpdateTitle Todo タイトルを更新する処理。
 * @returns Todo 1 件分の表示。
 */
export function TodoItem({
  title,
  completed,
  onToggle,
  onDelete,
  onUpdateTitle,
}: TodoItemProps) {
  const editInputId = useId();
  const editInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(title);
  const trimmedEditingTitle = editingTitle.trim();

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    editInputRef.current?.focus();
    editInputRef.current?.select();
  }, [isEditing]);

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
   *
   * @param event フォーム送信イベント。
   */
  function saveEditing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (trimmedEditingTitle.length === 0) {
      return;
    }

    onUpdateTitle(trimmedEditingTitle);
    setIsEditing(false);
  }

  /**
   * 編集中の Enter キー入力で保存し、Esc キー入力でキャンセルします。
   *
   * @param event キーボード入力イベント。
   */
  function handleEditKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
    }
  }

  return (
    <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-4 last:border-b-0">
      <button
        type="button"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gray-300 text-sm font-bold text-blue-600 transition hover:border-blue-400"
        aria-label={completed ? "未完了に戻す" : "完了にする"}
        aria-pressed={completed}
        onClick={onToggle}
      >
        {completed ? "✓" : ""}
      </button>

      {isEditing ? (
        <form className="flex min-w-0 flex-1 items-center gap-2" onSubmit={saveEditing}>
          <label htmlFor={editInputId} className="sr-only">
            Todo タイトルを編集
          </label>
          <input
            ref={editInputRef}
            id={editInputId}
            type="text"
            value={editingTitle}
            onChange={(event) => setEditingTitle(event.target.value)}
            onKeyDown={handleEditKeyDown}
            className="min-w-0 flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-400"
          />
          <button
            type="submit"
            className="rounded-md px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
            disabled={trimmedEditingTitle.length === 0}
          >
            保存
          </button>
          <button
            type="button"
            className="rounded-md px-3 py-2 text-sm font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
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
            className="rounded-md px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
            aria-label={`${title}を編集する`}
            onClick={startEditing}
          >
            編集
          </button>
        </>
      )}

      <button
        type="button"
        className="rounded-md px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-600"
        aria-label={`${title}を削除する`}
        onClick={onDelete}
      >
        削除
      </button>
    </div>
  );
}
