module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "<rootDir>/__tests__/__mocks__/styleMock.js",
    "\\.(jpg|jpeg|png|gif|webp|svg)$":
      "<rootDir>/__tests__/__mocks__/fileMock.js",
    "^next/router$": "<rootDir>/__tests__/__mocks__/nextRouter.js",
    "^next/head$": "<rootDir>/__tests__/__mocks__/nextHead.js",
    "^next/navigation$": "<rootDir>/__tests__/__mocks__/nextNavigation.js",
    "^core-lib/(.*)$": "<rootDir>/$1",
  },
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "business/**/*.{ts,tsx}",
    "core/hooks/**/*.{ts,tsx}",
    "core/contexts/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/__mocks__/**",
    "!**/node_modules/**",
  ],
  coverageReporters: ["text", "lcov", "html", "json-summary"],
  testMatch: ["<rootDir>/__tests__/**/*.test.{ts,tsx}"],
  testPathIgnorePatterns: ["/node_modules/", "/__mocks__/"],
  transformIgnorePatterns: ["/node_modules/"],
};
