export const formatCurrency = (
  value: number | null | undefined,
  currencyCode: string = "PHP",
): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currencyCode} ${value.toFixed(2)}`;
  }
};

export const formatQuantity = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return "0";
  const fixed = Math.abs(value) >= 1000 ? 0 : value % 1 === 0 ? 0 : 2;
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: fixed,
    minimumFractionDigits: 0,
    useGrouping: true,
  }).format(value);
};

export const formatShortDate = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  const d = new Date(iso.includes("T") || iso.endsWith("Z") ? iso : `${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatRelative = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  const hasTz = /Z$|[+-]\d{2}:?\d{2}$/.test(iso);
  const then = new Date(hasTz ? iso : iso + "Z").getTime();
  if (Number.isNaN(then)) return "—";
  const diffMs = Date.now() - then;
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatShortDate(iso);
};

export const todayIsoDate = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const addDaysIsoDate = (isoDate: string, days: number): string => {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
