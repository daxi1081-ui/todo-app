type AddButtonProps = {
  /** ボタンを無効化するかどうか。 */
  disabled?: boolean;
};

/**
 * Todo 追加用の送信ボタンを表示します。
 *
 * @param props ボタン表示に必要な情報。
 * @param props.disabled ボタンを無効化するかどうか。
 * @returns Todo 追加ボタン。
 */
export function AddButton({ disabled = false }: AddButtonProps) {
  return (
    <button
      type="submit"
      aria-label="Todoを追加"
      className="rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-150 ease-out hover:bg-blue-700 active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:bg-gray-300 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus-visible:outline-blue-300 dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
      disabled={disabled}
    >
      追加
    </button>
  );
}
