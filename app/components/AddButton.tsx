type AddButtonProps = {
  /** ボタンを押せるかどうか。 */
  disabled?: boolean;
};

/**
 * TODO追加用の送信ボタンを表示するコンポーネントです。
 * @param {AddButtonProps} props ボタン表示に必要な情報
 * @param {boolean} props.disabled ボタンを押せるかどうか
 * @returns {JSX.Element} TODO追加ボタンの見た目
 */
export function AddButton({ disabled = false }: AddButtonProps) {
  return (
    <button
      type="submit"
      className="mt-6 text-lg font-semibold text-blue-500 disabled:cursor-not-allowed disabled:text-gray-300"
      disabled={disabled}
    >
      ＋ 追加
    </button>
  );
}
