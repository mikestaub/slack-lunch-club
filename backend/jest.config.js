module.exports = {
  testEnvironment: "node",
  collectCoverage: !process.env.WATCH,
  testMatch: ["**/*.test.js"],
  transform: {
    "^.+\\.graphql$": "jest-transform-graphql",
    "^.+\\.aql$": "jest-raw-loader",
    "^.+\\.html$": "html-loader-jest",
    "^.+\\.js?$": "babel-jest",
    "^.+\\.jsx?$": "babel-jest",
  },
  modulePathIgnorePatterns: ["/build/"],
  collectCoverageFrom: [
    "packages/**/*.{js}",
    "!packages/**/*.transaction.{js}",
    "!**/node_modules/**",
    "!**/build/**",
  ],
};
