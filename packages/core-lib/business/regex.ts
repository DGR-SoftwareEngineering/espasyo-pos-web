const REGEX_CHAR_DOT = /\./g;
const REGEX_ALPHA_NUMBER = /([a-z0-9])([A-Z])/g;
const REGEX_ALPHA = /([A-Z])([A-Z][a-z])/g;
const REGEX_NUMBER_BETWEEN = /\b\d+\b/g;
const REGEX_WORDS = /\b\w/g;
const MATCH_HTML_HEADINGS = /<h\d>(.+)<\/h\d>/gi;
const MATCH_LI_WITH_DOUBLE_BRACKETS =
  /<li>(?:(?!<\/li>).)*?\[\[.*?\]\](?:(?!<\/li>).)*?<\/li>/g;
const MATCH_EMPTY_LI = /<li>\s*<\/li>/g;
const MATCH_BLANK_P_TAG = /<p>\s<\/p>/gi;

export {
  REGEX_CHAR_DOT,
  REGEX_ALPHA_NUMBER,
  REGEX_ALPHA,
  REGEX_NUMBER_BETWEEN,
  REGEX_WORDS,
  MATCH_BLANK_P_TAG,
  MATCH_EMPTY_LI,
  MATCH_LI_WITH_DOUBLE_BRACKETS,
  MATCH_HTML_HEADINGS,
};
