"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";

import type { TodoPriority, TodoPriorityOption } from "../types/todo";

type TodoItemProps = {
  /** 一覧に表示する Todo タイトル。 */
  title: string;
  /** 一覧に表示する Todo メモ。 */
  memo: string;
  /** 一覧に表示する Todo 期限日。 */
  dueDate: string;
  /** 一覧に表示する Todo 優先度。 */
  priority: TodoPriority;
  /** 優先度の選択肢。 */
  priorityOptions: TodoPriorityOption[];
  /** 完了済みかどうか。 */
  completed: boolean;
  /** 完了状態を切り替える処理。 */
  onToggle: () => void;
  /** Todo を削除する処理。 */
  onDelete: () => void;
  /** Todo のタイトル、メモ、期限日、優先度を更新する処理。 */
  onUpdateTodo: (
    title: string,
    memo: string,
    dueDate: string,
    priority: TodoPriority,
  ) => void;
};

/**
 * 期限日を画面表示用の文字列に変換します。
 *
 * @param dueDate YYYY-MM-DD 形式の期限日。
 * @returns YYYY/MM/DD 形式の期限日。
 */
function formatDueDate(dueDate: string) {
  return dueDate.replaceAll("-", "/");
}

/**
 * 優先度の表示ラベルを返します。
 *
 * @param priority 優先度。
 * @param options 優先度の選択肢。
 * @returns 優先度の表示ラベル。
 */
function getPriorityLabel(priority: TodoPriority, options: TodoPriorityOption[]) {
  return options.find((option) => option.value === priority)?.label ?? "なし";
}

/**
 * Todo を 1 件分表示し、完了切り替え、編集、削除を扱います。
 *
 * @param props Todo 表示に必要な情報。
 * @param props.title 表示する Todo タイトル。
 * @param props.memo 表示する Todo メモ。
 * @param props.dueDate 表示する Todo 期限日。
 * @param props.priority 表示する Todo 優先度。
 * @param props.priorityOptions 優先度の選択肢。
 * @param props.completed 完了済みかどうか。
 * @param props.onToggle 完了状態を切り替える処理。
 * @param props.onDelete Todo を削除する処理。
 * @param props.onUpdateTodo Todo のタイトル、メモ、期限日、優先度を更新する処理。
 * @returns Todo 1 件分の表示。
 */
export function TodoItem({
  title,
  memo,
  dueDate,
  priority,
  priorityOptions,
  completed,
  onToggle,
  onDelete,
  onUpdateTodo,
}: TodoItemProps) {
  const editTitleInputId = useId();
  const editMemoInputId = useId();
  const editDueDateInputId = useId();
  const editPriorityInputId = useId();
  const editInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(title);
  const [editingMemo, setEditingMemo] = useState(memo);
  const [editingDueDate, setEditingDueDate] = useState(dueDate);
  const [editingPriority, setEditingPriority] = useState<TodoPriority>(priority);
  const trimmedEditingTitle = editingTitle.trim();
  const priorityLabel = getPriorityLabel(priority, priorityOptions);

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
    setEditingMemo(memo);
    setEditingDueDate(dueDate);
    setEditingPriority(priority);
    setIsEditing(true);
  }

  /**
   * 編集内容を破棄し、表示モードに戻します。
   */
  function cancelEditing() {
    setEditingTitle(title);
    setEditingMemo(memo);
    setEditingDueDate(dueDate);
    setEditingPriority(priority);
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

    onUpdateTodo(trimmedEditingTitle, editingMemo.trim(), editingDueDate, editingPriority);
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
    <div className="flex items-start gap-3 border-b border-gray-100 px-4 py-4 last:border-b-0">
      <button
        type="button"
        className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gray-300 text-sm font-bold text-blue-600 transition hover:border-blue-400"
        aria-label={completed ? "未完了に戻す" : "完了にする"}
        aria-pressed={completed}
        onClick={onToggle}
      >
        {completed ? "✓" : ""}
      </button>

      {isEditing ? (
        <form className="grid min-w-0 flex-1 gap-2" onSubmit={saveEditing}>
          <label htmlFor={editTitleInputId} className="sr-only">
            Todo タイトルを編集
          </label>
          <input
            ref={editInputRef}
            id={editTitleInputId}
            type="text"
            value={editingTitle}
            onChange={(event) => setEditingTitle(event.target.value)}
            onKeyDown={handleEditKeyDown}
            className="min-w-0 flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-400"
          />
          <label htmlFor={editMemoInputId} className="sr-only">
            Todo メモを編集
          </label>
          <textarea
            id={editMemoInputId}
            value={editingMemo}
            onChange={(event) => setEditingMemo(event.target.value)}
            rows={3}
            className="min-w-0 resize-y rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-400"
          />
          <label htmlFor={editDueDateInputId} className="sr-only">
            Todo 期限日を編集
          </label>
          <input
            id={editDueDateInputId}
            type="date"
            value={editingDueDate}
            onChange={(event) => setEditingDueDate(event.target.value)}
            className="min-w-0 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-400"
          />
          <label htmlFor={editPriorityInputId} className="sr-only">
            Todo 優先度を編集
          </label>
          <select
            id={editPriorityInputId}
            value={editingPriority}
            onChange={(event) => setEditingPriority(event.target.value as TodoPriority)}
            className="min-w-0 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-400"
          >
            {priorityOptions.map((priorityOption) => (
              <option key={priorityOption.value} value={priorityOption.value}>
                優先度: {priorityOption.label}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2">
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
          </div>
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
            {memo.length > 0 ? (
              <span
                className={
                  completed
                    ? "mt-1 block whitespace-pre-wrap break-words text-sm text-gray-400"
                    : "mt-1 block whitespace-pre-wrap break-words text-sm text-gray-500"
                }
              >
                {memo}
              </span>
            ) : null}
            {dueDate.length > 0 ? (
              <span
                className={
                  completed
                    ? "mt-2 inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-400"
                    : "mt-2 inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700"
                }
              >
                期限日: {formatDueDate(dueDate)}
              </span>
            ) : null}
            {priority !== "none" ? (
              <span
                className={
                  completed
                    ? "ml-2 mt-2 inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-400"
                    : "ml-2 mt-2 inline-flex rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700"
                }
              >
                優先度: {priorityLabel}
              </span>
            ) : null}
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
