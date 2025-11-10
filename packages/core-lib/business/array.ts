export function replaceCharacter<T>(
  arr: T[],
  key: string,
  index: number,
  initialChar: string,
  newChar: string
): T[] {
  if (arr.length === 0) return arr;
  const item = { ...arr[index] } as any;
  if (key in item) {
    item[key] = item[key].replace(initialChar, newChar);
  }
  arr[index] = item as T;
  return arr;
}
