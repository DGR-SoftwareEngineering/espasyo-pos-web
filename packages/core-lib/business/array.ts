import { CategoryDataList } from "../api/commons/types";
import { SelectOption } from "../components/form/SelectField";

export function replaceCharacter<T>(
  arr: T[],
  key: string,
  index: number,
  initialChar: string,
  newChar: string,
): T[] {
  if (arr.length === 0) return arr;
  const item = { ...arr[index] } as any;
  if (key in item) {
    item[key] = item[key].replace(initialChar, newChar);
  }
  arr[index] = item as T;
  return arr;
}

export const toSelectOptionsWithField = <T extends Record<string, any>>(
  items: T[],
  valueField: keyof T,
  labelField: keyof T = "name" as keyof T,
): SelectOption[] => {
  if (!items || !Array.isArray(items)) return [];

  return items.map((item) => ({
    value: String(item[valueField]),
    label: String(item[labelField]),
  }));
};

export const toUnitOptions = (units: CategoryDataList[]) =>
  units
    .filter((u) => u.type === 3)
    .map((unit) => ({ value: unit.categoryID, label: unit.name }));

export function findLongestArrayInArray<T extends Array<any>>(arr: T[]): T {
  let longest = 0;
  let longestArr: T = [] as unknown as T;

  arr.forEach((item) => {
    if (item.length > longest) {
      longest = item.length;
      longestArr = item;
    }
  });

  return longestArr;
}
