type AddButtonProps = {
  /** ボタンを押せるかどうか。 */
  disabled?: boolean;
};

/**
 * TODO 追加用の送信ボタンを表示するコンポーネントです。
 * @param {AddButtonProps} props ボタン表示に必要な情報
 * @param {boolean} props.disabled ボタンを無効化するかどうか
 * @returns {JSX.Element} TODO 追加ボタン
 */
export function AddButton({ disabled = false }: AddButtonProps) {
  return (
    <button
      type="submit"
      className="mt-6 text-lg font-semibold text-blue-500 disabled:cursor-not-allowed disabled:text-gray-300"
      disabled={disabled}
    >
      追加
    </button>
  );
}
