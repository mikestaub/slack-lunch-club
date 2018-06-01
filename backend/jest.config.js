module.exports = {
  testEnvironment: "node",
  collectCoverage: !process.env.WATCH,
  testMatch: ["**/*.test.js"],
  transform: {
    "^.+\\.graphql$": "jest-transform-graphql",
    "^.+\\.aql$": "jest-raw-loader",
    "^.+\\.js$": "babel-jest",
    "^.+\\.html$": "html-loader-jest",
  },
  modulePathIgnorePatterns: ["/build/"],
  collectCoverageFrom: [
    "packages/**/*.{js}",
    "!packages/**/*.transaction.{js}",
    "!**/node_modules/**",
    "!**/build/**",
  ],
};
