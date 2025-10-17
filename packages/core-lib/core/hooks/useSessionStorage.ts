import { useState, useEffect, useCallback } from "react";
import { clear, getItem, removeItem, setItem } from "../session-storage";

export type SetValue<T> = (value: T | ((storedValue: T) => T)) => void;

export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, SetValue<T>, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    return getItem<T>(key) ?? initialValue;
  });

  const setValue: SetValue<T> = (value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setItem<T>(key, valueToStore);
    setStoredValue(valueToStore);
  };

  const clearValue = useCallback(() => {
    removeItem(key);
    setStoredValue(initialValue);
  }, [key, initialValue]);

  useEffect(() => {
    const handleStorageChange = () => {
      const newValue = getItem<T>(key) ?? initialValue;
      setStoredValue(newValue);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue, clearValue];
}

export const clearSession = () => clear();
