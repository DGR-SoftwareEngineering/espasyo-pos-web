import { useCallback, useEffect, useRef, useState } from "react";
import { replaceCharacter } from "../../../business/array";

interface UseCardTableRowLimitParams<T> {
  isCard: boolean;
  data: T[];
  loading?: boolean;
}

interface UseCardTableRowLimitResult<T> {
  containerRef: (ref: HTMLDivElement) => void;
  limitedData: T[];
}

const MAX_ROWS = 3;

export const useCardTableRowLimit = <T>({
  isCard,
  data,
  loading,
}: UseCardTableRowLimitParams<T>): UseCardTableRowLimitResult<T> => {
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [limitedData, setLimitedData] = useState<T[]>(data);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const calculationAttempted = useRef(false);

  const calculateRowLimit = useCallback(() => {
    if (!containerRef) return;
    calculationAttempted.current = true;
    const rowLimit = calculateOptimalRowLimit(containerRef);
    const newData = rowLimit ? applyRowLimit(data, rowLimit) : data;
    setLimitedData(newData);
  }, [data, containerRef]);

  useEffect(() => {
    if (data.length > 0 && (!isCard || !containerRef)) {
      setLimitedData(data);
      return;
    }

    if (isCard && containerRef && !loading) {
      calculateRowLimit();
    }
  }, [data, calculateRowLimit, isCard, containerRef, loading]);

  useEffect(() => {
    if (!isCard || !containerRef || loading) return;

    const initialTimeout = setTimeout(calculateRowLimit, 50);
    observerRef.current = new MutationObserver(() => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(calculateRowLimit, 50);
    });
    observerRef.current.observe(containerRef, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    const handleResize = () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(calculateRowLimit, 50);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(initialTimeout);
      observerRef.current?.disconnect();
      window.removeEventListener("resize", handleResize);
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [containerRef, isCard, loading, calculateRowLimit]);

  return {
    containerRef: setContainerRef,
    limitedData: limitedData.length > 0 ? limitedData : data,
  };
};

const getTableElements = (containerRef: HTMLDivElement | null) => {
  if (!containerRef) return null;

  const tbody = containerRef.querySelector("tbody");
  const trElements = tbody?.querySelectorAll("tr");
  const tableHeadElement = containerRef.querySelector("thead") as HTMLElement;
  const cardContent = containerRef.closest(".card-content") as HTMLElement;

  if (!tbody || !trElements || trElements.length === 0) return null;

  return {
    tbody,
    trElements,
    tableHeadElement,
    cardContent,
    tableRowElement: trElements[0] as HTMLElement,
  };
};

const calculateOptimalRowLimit = (
  containerRef: HTMLDivElement | null
): number | null => {
  const elements = getTableElements(containerRef);
  if (!elements) return null;

  const { tableHeadElement, tableRowElement, cardContent } = elements;
  const tableHeadHeight = tableHeadElement?.offsetHeight ?? 0;
  const tableRowHeight = tableRowElement?.offsetHeight ?? 0;
  const containerHeight = cardContent?.clientHeight || 0;

  if (tableRowHeight <= 0) return null;

  return Math.max(
    Math.floor((containerHeight - tableHeadHeight) / tableRowHeight),
    1
  );
};

const applyRowLimit = <T>(data: T[], rowLimit: number): T[] => {
  const reducedData = [...data].slice(-Math.min(rowLimit, MAX_ROWS));
  return replaceCharacter(
    [...reducedData],
    "age",
    reducedData.length - 1,
    "*",
    ""
  );
};
