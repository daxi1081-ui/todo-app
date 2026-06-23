/**
 * タグ文字列を # 付きの保存形式に整えます。
 *
 * @param tag タグ文字列。
 * @returns # 付きタグ、または空文字。
 */
export function normalizeTag(tag: string) {
  const tagName = tag.trim().replace(/^#+/, "");

  return tagName.length > 0 ? `#${tagName}` : "";
}

/**
 * タグ入力を Todo に保存するタグ一覧へ変換します。
 *
 * @param value カンマ区切りのタグ入力。
 * @returns # 付きに正規化し、空文字と重複を取り除いたタグ一覧。
 */
export function parseTags(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map(normalizeTag)
        .filter((tag) => tag.length > 0),
    ),
  );
}
