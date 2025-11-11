export function findKeysWithAsterisk(
  items: any[]
): { item: any; key: string }[] {
  return items.flatMap((item) =>
    Object.entries(item).flatMap(([key, value]) =>
      value?.toString().includes("*") ? [{ key, item }] : []
    )
  );
}
