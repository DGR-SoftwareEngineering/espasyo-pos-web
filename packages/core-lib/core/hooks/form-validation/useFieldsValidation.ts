import * as React from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

/**
 * Validates a subset of RHF fields and exposes a boolean validity state.
 * - Strongly typed: `fields` are FieldPath<TFieldValues>[] (supports nested/array paths).
 * - Watches only those fields; debounced revalidation.
 * - Provides validateNow() for manual checks (e.g., on our custom button).
 */
export function useFieldsValidation<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  fields: ReadonlyArray<FieldPath<TFieldValues>>,
  options?: {
    enabled?: boolean;
    debounceMs?: number;
    when?: (values: TFieldValues) => boolean;
    shouldFocus?: boolean;
    validateOnMount?: boolean;
  }
) {
  const {
    enabled = true,
    debounceMs = 150,
    when,
    shouldFocus = false,
    validateOnMount = true,
  } = options ?? {};

  const [isValid, setIsValid] = React.useState(false);
  const [validating, setValidating] = React.useState(false);

  const fieldsKey = React.useMemo(() => JSON.stringify(fields), [fields]);

  const pathsRef = React.useRef<FieldPath<TFieldValues>[]>([]);
  React.useEffect(() => {
    // Update when the *content* (fieldsKey) changes.
    pathsRef.current = Array.from(fields) as FieldPath<TFieldValues>[];
  }, [fieldsKey, fields]);

  const validateNow = React.useCallback(async () => {
    if (!enabled) {
      setIsValid(false);
      return false;
    }
    if (when && !when(form.getValues())) {
      setIsValid(false);
      return false;
    }
    setValidating(true);
    try {
      const ok = await form.trigger(pathsRef.current, { shouldFocus });
      setIsValid(ok);
      return ok;
    } finally {
      setValidating(false);
    }
  }, [enabled, when, form, shouldFocus]);

  React.useEffect(() => {
    if (!enabled) {
      setIsValid(false);
      return;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;

    const subscription = form.watch((_values, { name }) => {
      if (!name) return;
      if (!pathsRef.current.includes(name as FieldPath<TFieldValues>)) return;

      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void validateNow();
      }, debounceMs);
    });

    if (validateOnMount) {
      void validateNow();
    }

    return () => {
      subscription.unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, [form, enabled, debounceMs, validateOnMount, validateNow, fieldsKey]);

  return {
    isValid,
    validating,
    validateNow,
    fields,
  };
};
