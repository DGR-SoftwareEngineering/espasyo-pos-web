import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  endOfDay,
  format,
  isBefore,
  isEqual,
  isSameDay,
  isValid,
  isWithinInterval,
  parse,
  parseISO,
  setDate,
  setMonth,
  startOfDay,
} from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { CmsGlobals } from "../api/content/types/globals";
import { extractLabelByKey } from "./globals";

export const formatDate = (
  date: string | number | Date,
  dateFormat = "dd MMM yyyy"
) => {
  const rawDate = typeof date === "string" && rawDateFromISOString(date);

  if (rawDate) {
    return rawDate;
  }

  try {
    const shouldAddGMT =
      typeof date === "string" && /^\d{1,2} [A-Za-z]+ \d{4}$/.test(date);
    const dateObj = new Date(shouldAddGMT ? date + " GMT" : date);
    const utcDate = utcToZonedTime(dateObj, "UTC");
    return format(utcDate, dateFormat);
  } catch {
    return date?.toString();
  }
};

export const rawDateFromISOString = (isoString: string) => {
  const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;

  const [y, m, d] = match.slice(1, 4) as [string, string, string];

  const year = Number(y);
  const month = Number(m);
  const day = Number(d);

  const monthName = new Date(Date.UTC(year, month - 1, day)).toLocaleString(
    "en-US",
    { month: "short", timeZone: "UTC" }
  );
  const dayString = String(day).padStart(2, "0");

  return `${dayString} ${monthName} ${year}`;
};

export const isoTimeToYears = (isoString: string) =>
  Number(isoString.match(/(\d+)Y/)?.[1]);
export const isoTimeToMonths = (isoString: string) =>
  Number(isoString.match(/(\d+)M/)?.[1]);
export const isoTimeToWeeks = (isoString: string) =>
  Number(isoString.match(/(\d+)W/)?.[1]);
export const isoTimeToDays = (isoString: string) =>
  Number(isoString.match(/(\d+)D/)?.[1]);

export const isoTimeToText = (
  globalsOrGetLabel: CmsGlobals | null | ((key: string) => string),
  isoString: string,
  timeValuesLimit?: number
) => {
  const years = isoTimeToYears(isoString);
  const months = isoTimeToMonths(isoString);
  const weeks = isoTimeToWeeks(isoString);
  const days = isoTimeToDays(isoString);
  const getLabel = (key: string) =>
    typeof globalsOrGetLabel === "function"
      ? globalsOrGetLabel(key)
      : extractLabelByKey(globalsOrGetLabel, key);

  if (!years && !months && !weeks && !days) return null;

  const yearsLabelKey = years && years > 1 ? "years" : "year";
  const monthsLabelKey = months && months > 1 ? "months" : "month";
  const weeksLabelKey = weeks && weeks > 1 ? "weeks" : "week";
  const daysLabelKey = days && days > 1 ? "days" : "day";

  const yearsText = years ? `${years} ${getLabel(yearsLabelKey)}` : "";
  const monthsText = months ? `${months} ${getLabel(monthsLabelKey)}` : "";
  const weeksText = weeks ? `${weeks} ${getLabel(weeksLabelKey)}` : "";
  const daysText = days ? `${days} ${getLabel(daysLabelKey)}` : "";
  const list = [yearsText, monthsText, weeksText, daysText].filter(Boolean);

  return timeValuesLimit
    ? list.slice(0, timeValuesLimit).join(", ")
    : list.join(", ");
};

export function isValidDate(date?: Date): boolean {
  return (date && !isNaN(date.getTime())) || false;
}

/**
 * Locale-aware date-time formatter for table rows / audit displays.
 * Returns "—" for null / undefined / invalid input so callers don't have to
 * special-case it. Use this everywhere instead of inlining `new Date(...).toLocaleString()`.
 */
export const formatDateTime = (
  iso: string | null | undefined,
  fallback: string = "—",
): string => {
  if (!iso) return fallback;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return fallback;
  return d.toLocaleString();
};
