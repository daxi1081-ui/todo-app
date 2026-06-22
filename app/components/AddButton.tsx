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
      className="rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      disabled={disabled}
    >
      追加
    </button>
  );
}
