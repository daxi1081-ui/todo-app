"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";

import { parseTags } from "../utils/tags";
import type {
  TodoPriority,
  TodoPriorityOption,
  TodoRepeat,
  TodoRepeatOption,
  TodoSubtask,
} from "../types/todo";

type TodoItemProps = {
  /** 一覧に表示する Todo タイトル。 */
  title: string;
  /** 一覧に表示する Todo メモ。 */
  memo: string;
  /** 一覧に表示する Todo 期限日。 */
  dueDate: string;
  /** 一覧に表示する Todo 優先度。 */
  priority: TodoPriority;
  /** 一覧に表示する Todo 繰り返し設定。 */
  repeat: TodoRepeat;
  /** 一覧に表示する Todo タグ一覧。 */
  tags: string[];
  /** 一覧に表示するサブタスク一覧。 */
  subtasks: TodoSubtask[];
  /** 優先度の選択肢。 */
  priorityOptions: TodoPriorityOption[];
  /** 繰り返し設定の選択肢。 */
  repeatOptions: TodoRepeatOption[];
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
    repeat: TodoRepeat,
    tags: string[],
  ) => void;
  /** サブタスクを追加する処理。 */
  onAddSubtask: (title: string) => void;
  /** サブタスクの完了状態を切り替える処理。 */
  onToggleSubtask: (subtaskId: number) => void;
  /** サブタスクのタイトルを更新する処理。 */
  onUpdateSubtask: (subtaskId: number, title: string) => void;
  /** サブタスクを削除する処理。 */
  onDeleteSubtask: (subtaskId: number) => void;
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
 * 日付入力と比較するためのローカル日付文字列を返します。
 *
 * @param date 変換する日付。
 * @returns YYYY-MM-DD 形式の日付文字列。
 */
function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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
 * 繰り返し設定の表示ラベルを返します。
 *
 * @param repeat 繰り返し設定。
 * @param options 繰り返し設定の選択肢。
 * @returns 繰り返し設定の表示ラベル。
 */
function getRepeatLabel(repeat: TodoRepeat, options: TodoRepeatOption[]) {
  return options.find((option) => option.value === repeat)?.label ?? "なし";
}

/**
 * Todo を 1 件分表示し、完了切り替え、編集、削除を扱います。
 *
 * @param props Todo 表示に必要な情報。
 * @param props.title 表示する Todo タイトル。
 * @param props.memo 表示する Todo メモ。
 * @param props.dueDate 表示する Todo 期限日。
 * @param props.priority 表示する Todo 優先度。
 * @param props.repeat 表示する Todo 繰り返し設定。
 * @param props.tags 表示する Todo タグ一覧。
 * @param props.subtasks 表示するサブタスク一覧。
 * @param props.priorityOptions 優先度の選択肢。
 * @param props.repeatOptions 繰り返し設定の選択肢。
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
  repeat,
  tags,
  subtasks,
  priorityOptions,
  repeatOptions,
  completed,
  onToggle,
  onDelete,
  onUpdateTodo,
  onAddSubtask,
  onToggleSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
}: TodoItemProps) {
  const editTitleInputId = useId();
  const editMemoInputId = useId();
  const editDueDateInputId = useId();
  const editPriorityInputId = useId();
  const editRepeatInputId = useId();
  const editTagsInputId = useId();
  const editInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingDetailsOpen, setIsEditingDetailsOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(title);
  const [editingMemo, setEditingMemo] = useState(memo);
  const [editingDueDate, setEditingDueDate] = useState(dueDate);
  const [editingPriority, setEditingPriority] = useState<TodoPriority>(priority);
  const [editingRepeat, setEditingRepeat] = useState<TodoRepeat>(repeat);
  const [editingTags, setEditingTags] = useState(tags.join(", "));
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingSubtaskId, setEditingSubtaskId] = useState<number | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState("");
  const trimmedEditingTitle = editingTitle.trim();
  const priorityLabel = getPriorityLabel(priority, priorityOptions);
  const repeatLabel = getRepeatLabel(repeat, repeatOptions);
  const completedSubtaskCount = subtasks.filter((subtask) => subtask.completed).length;
  const isOverdue = !completed && dueDate.length > 0 && dueDate < toDateInputValue(new Date());
  const subtaskProgressPercent =
    subtasks.length > 0 ? Math.round((completedSubtaskCount / subtasks.length) * 100) : 0;

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
    setEditingRepeat(repeat);
    setEditingTags(tags.join(", "));
    setIsEditingDetailsOpen(false);
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
    setEditingRepeat(repeat);
    setEditingTags(tags.join(", "));
    setIsEditingDetailsOpen(false);
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

    onUpdateTodo(
      trimmedEditingTitle,
      editingMemo.trim(),
      editingDueDate,
      editingPriority,
      editingRepeat,
      parseTags(editingTags),
    );
    setIsEditingDetailsOpen(false);
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

  /**
   * サブタスクを追加します。
   *
   * @param event フォーム送信イベント。
   */
  function addSubtask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = newSubtaskTitle.trim();

    if (trimmedTitle.length === 0) {
      return;
    }

    onAddSubtask(trimmedTitle);
    setNewSubtaskTitle("");
  }

  /**
   * サブタスクの編集を開始します。
   *
   * @param subtask 編集するサブタスク。
   */
  function startSubtaskEditing(subtask: TodoSubtask) {
    setEditingSubtaskId(subtask.id);
    setEditingSubtaskTitle(subtask.title);
  }

  /**
   * サブタスク編集を保存します。
   *
   * @param event フォーム送信イベント。
   */
  function saveSubtaskEditing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingSubtaskId === null || editingSubtaskTitle.trim().length === 0) {
      return;
    }

    onUpdateSubtask(editingSubtaskId, editingSubtaskTitle);
    setEditingSubtaskId(null);
    setEditingSubtaskTitle("");
  }

  /**
   * サブタスク編集をキャンセルします。
   */
  function cancelSubtaskEditing() {
    setEditingSubtaskId(null);
    setEditingSubtaskTitle("");
  }

  return (
    <div className="border-b border-gray-100 px-4 py-5 transition hover:bg-gray-50/70 last:border-b-0">
      <div className="flex items-start gap-4">
      <button
        type="button"
        className={
          completed
            ? "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-blue-500 bg-blue-500 text-sm font-bold text-white transition hover:bg-blue-600"
            : "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-300 text-sm font-bold text-blue-600 transition hover:border-blue-400 hover:bg-blue-50"
        }
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
          <button
            type="button"
            aria-expanded={isEditingDetailsOpen}
            aria-controls={`edit-todo-details-${editTitleInputId}`}
            aria-label={isEditingDetailsOpen ? `${title}の編集詳細を隠す` : `${title}の編集詳細を表示`}
            className="w-fit rounded-md px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
            onClick={() => setIsEditingDetailsOpen((isOpen) => !isOpen)}
          >
            {isEditingDetailsOpen ? "詳細を隠す" : "詳細を表示"}
          </button>
          <div
            id={`edit-todo-details-${editTitleInputId}`}
            className="grid gap-2"
            hidden={!isEditingDetailsOpen}
          >
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
            <label htmlFor={editRepeatInputId} className="sr-only">
              Todo 繰り返し設定を編集
            </label>
            <select
              id={editRepeatInputId}
              aria-label={`${title}の繰り返し設定を変更`}
              value={editingRepeat}
              onChange={(event) => setEditingRepeat(event.target.value as TodoRepeat)}
              className="min-w-0 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-400"
            >
              {repeatOptions.map((repeatOption) => (
                <option key={repeatOption.value} value={repeatOption.value}>
                  繰り返し: {repeatOption.label}
                </option>
              ))}
            </select>
            <label htmlFor={editTagsInputId} className="sr-only">
              Todo タグを編集
            </label>
            <input
              id={editTagsInputId}
              type="text"
              value={editingTags}
              onChange={(event) => setEditingTags(event.target.value)}
              className="min-w-0 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-400"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              aria-label="Todoを保存"
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
          <button type="button" className="grid min-w-0 flex-1 gap-2 text-left" onClick={onToggle}>
            <span
              className={
                completed
                  ? "block truncate text-base font-semibold leading-6 text-gray-400 line-through"
                  : "block truncate text-base font-semibold leading-6 text-gray-950"
              }
            >
              {title}
            </span>
            {memo.length > 0 ? (
              <span
                className={
                  completed
                    ? "block max-h-10 overflow-hidden whitespace-pre-wrap break-words text-sm leading-5 text-gray-400"
                    : "block max-h-10 overflow-hidden whitespace-pre-wrap break-words text-sm leading-5 text-gray-500"
                }
              >
                {memo}
              </span>
            ) : null}
            <span className="flex flex-wrap items-center gap-2">
              {dueDate.length > 0 ? (
                <span
                  className={
                    completed
                      ? "inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-400"
                      : isOverdue
                        ? "inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-100"
                        : "inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100"
                  }
                >
                  <span aria-hidden="true">📅</span>
                  <span
                    className={
                      completed
                        ? "text-gray-400"
                        : isOverdue
                          ? "text-red-700"
                          : "text-blue-700"
                    }
                  >
                    期限日: {formatDueDate(dueDate)}
                  </span>
                  {isOverdue ? <span className="font-bold">期限切れ</span> : null}
                </span>
              ) : null}
              {priority !== "none" ? (
                <span
                  className={
                    completed
                      ? "inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-400"
                      : "inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-100"
                  }
                >
                  <span
                    aria-hidden="true"
                    className={
                      completed
                        ? "h-1.5 w-1.5 rounded-full bg-gray-300"
                        : "h-1.5 w-1.5 rounded-full bg-amber-500"
                    }
                  />
                  優先度: {priorityLabel}
                </span>
              ) : null}
              {repeat !== "none" ? (
                <span
                  className={
                    completed
                      ? "inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-400"
                      : "inline-flex rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-100"
                  }
                >
                  繰り返し: {repeatLabel}
                </span>
              ) : null}
            </span>
            {tags.length > 0 ? (
              <span className="mt-2 flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className={
                      completed
                        ? "inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-400"
                        : "inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100"
                    }
                  >
                    {tag}
                  </span>
                ))}
              </span>
            ) : null}
            <span className="mt-1 grid gap-1 text-xs font-semibold text-gray-500">
              <span>サブタスク: {completedSubtaskCount}/{subtasks.length}</span>
              {subtasks.length > 0 ? (
                <span className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <span
                    className="block h-full rounded-full bg-blue-500"
                    style={{ width: `${subtaskProgressPercent}%` }}
                  />
                </span>
              ) : null}
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

      {!isEditing ? (
        <div className="ml-10 mt-3 grid gap-2">
          {subtasks.map((subtask) =>
            editingSubtaskId === subtask.id ? (
              <form
                key={subtask.id}
                className="flex min-w-0 gap-2"
                onSubmit={saveSubtaskEditing}
              >
                <label htmlFor={`subtask-edit-${subtask.id}`} className="sr-only">
                  サブタスクを編集
                </label>
                <input
                  id={`subtask-edit-${subtask.id}`}
                  type="text"
                  value={editingSubtaskTitle}
                  onChange={(event) => setEditingSubtaskTitle(event.target.value)}
                  className="min-w-0 flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-400"
                />
                <button
                  type="submit"
                  aria-label="サブタスクを保存"
                  className="rounded-md px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
                  disabled={editingSubtaskTitle.trim().length === 0}
                >
                  保存
                </button>
                <button
                  type="button"
                  className="rounded-md px-3 py-2 text-sm font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                  onClick={cancelSubtaskEditing}
                >
                  キャンセル
                </button>
              </form>
            ) : (
              <div key={subtask.id} className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-300 text-xs font-bold text-blue-600 transition hover:border-blue-400"
                  aria-label={subtask.completed ? "サブタスクを未完了に戻す" : "サブタスクを完了にする"}
                  aria-pressed={subtask.completed}
                  onClick={() => onToggleSubtask(subtask.id)}
                >
                  {subtask.completed ? "✓" : ""}
                </button>
                <span
                  className={
                    subtask.completed
                      ? "min-w-0 flex-1 truncate text-sm text-gray-400 line-through"
                      : "min-w-0 flex-1 truncate text-sm text-gray-700"
                  }
                >
                  {subtask.title}
                </span>
                <button
                  type="button"
                  className="rounded-md px-2 py-1 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                  aria-label={`${subtask.title}を編集する`}
                  onClick={() => startSubtaskEditing(subtask)}
                >
                  編集
                </button>
                <button
                  type="button"
                  className="rounded-md px-2 py-1 text-sm font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-600"
                  aria-label={`${subtask.title}を削除する`}
                  onClick={() => onDeleteSubtask(subtask.id)}
                >
                  削除
                </button>
              </div>
            ),
          )}

          <form className="flex min-w-0 gap-2" onSubmit={addSubtask}>
            <label htmlFor={`new-subtask-${title}`} className="sr-only">
              {title} のサブタスクを追加
            </label>
            <input
              id={`new-subtask-${title}`}
              type="text"
              value={newSubtaskTitle}
              onChange={(event) => setNewSubtaskTitle(event.target.value)}
              placeholder="サブタスク"
              className="min-w-0 flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-400"
            />
            <button
              type="submit"
              aria-label={`${title}のサブタスクを追加`}
              className="rounded-md px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
              disabled={newSubtaskTitle.trim().length === 0}
            >
              追加
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
