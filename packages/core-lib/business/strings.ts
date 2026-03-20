import {
  REGEX_ALPHA,
  REGEX_ALPHA_NUMBER,
  REGEX_CHAR_DOT,
  REGEX_NUMBER_BETWEEN,
  REGEX_WORDS,
} from "./regex";

export function toTitleCase(text: string) {
  return text?.toLowerCase().replace(REGEX_WORDS, (m) => m.toUpperCase()) ?? "";
}

export function parseDelimitedList(
  value: string | undefined,
  delimiter = ";",
): string[] {
  if (!value) return [];
  return value
    .split(delimiter)
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Replaces all dot characters (.) in the input string with spaces.
 *
 * @param {string} key - The input string to transform.
 * @returns {string} The transformed string with dots replaced by spaces.
 */
export function replaceDotsWithSpaces(key: string): string {
  return key.replace(REGEX_CHAR_DOT, " ") ?? key;
}

/**
 * Inserts a space before each capital letter that follows a lowercase letter or digit.
 * Useful for converting camelCase or PascalCase to space-separated words.
 *
 * @param {string} key - The input string to transform.
 * @returns {string} The transformed string with spaces before capital letters.
 */
export function addSpaceBeforeCapital(key: string): string {
  return key.replace(REGEX_ALPHA_NUMBER, "$1 $2") ?? key;
}

/**
 * Inserts a space between acronyms and regular words in PascalCase strings.
 * For example, "HTMLParser" becomes "HTML Parser".
 *
 * @param {string} key - The input string to transform.
 * @returns {string} The transformed string with acronyms separated.
 */
export function toWordedAcronyms(key: string): string {
  return key.replace(REGEX_ALPHA, "$1 $2") ?? key;
}

/**
 * Finds standalone numbers in the string and increments each by 1.
 *
 * @param {string} key - The input string containing numbers.
 * @returns {string} The transformed string with incremented numbers.
 */
export function incrementNumberInText(key: string): string {
  return (
    key.replace(REGEX_NUMBER_BETWEEN, (num) => `${parseInt(num) + 1}`) ?? key
  );
}

/**
 * Converts a property key into a human-readable label.
 *
 * The transformation includes:
 * - Replacing dots with spaces
 * - Adding spaces before capital letters
 * - Separating acronyms from words
 * - Incrementing standalone numbers
 * - Converting to title case, preserving acronyms if detected
 *
 * @param {string} key - The property key to transform.
 * @returns {string} A human-readable label.
 */
export function propertyToLabel(key: string): string {
  if (!key) {
    return key;
  }

  const transformed = replaceDotsWithSpaces(key);
  const spaced = addSpaceBeforeCapital(transformed);
  const withAcronyms = toWordedAcronyms(spaced);
  const incremented = incrementNumberInText(withAcronyms);

  return toTitleCase(incremented);
}

export function caseInsensitiveEquals(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  return a.toUpperCase() === b.toUpperCase();
}

export const formatCurrency = (amount: number | null): string => {
  if (!amount) return "₱0.00";
  return `₱${amount.toFixed(2)}`;
};
export const truncateId = (id: string, length: number = 6): string =>
  `${id.substring(0, length)}...`;
