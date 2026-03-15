import { CategoryDataList, ProductDataList } from "../../../api/commons/types";

export const toSelectOptions = (items: ProductDataList[]) =>
  items.map((item) => ({ value: item.productID, label: item.name }));

export const toUnitOptions = (units: CategoryDataList[]) =>
  units
    .filter((u) => u.type === 3)
    .map((unit) => ({ value: unit.categoryID, label: unit.name }));
