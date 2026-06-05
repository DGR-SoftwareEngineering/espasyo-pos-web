import type { FieldPath, FieldValues } from "react-hook-form";

export const fieldsOf =
  <TFieldValues extends FieldValues>() =>
  <P extends ReadonlyArray<FieldPath<TFieldValues>>>(...p: P) =>
    p;

export function makeFields<TFieldValues extends FieldValues>() {
  function fromVarargs<P extends ReadonlyArray<FieldPath<TFieldValues>>>(
    ...p: P
  ) {
    return p;
  }
  function fromArray<P extends ReadonlyArray<FieldPath<TFieldValues>>>(p: P) {
    return p;
  }
  return Object.assign(fromVarargs, { fromArray });
}

export function asPaths<
  TFieldValues extends FieldValues,
  P extends ReadonlyArray<FieldPath<TFieldValues>>
>(p: P) {
  return p;
}
