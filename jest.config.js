const nextJest = require("next/jest");
const createJestConfig = nextJest({ dir: "./" });
const config = {
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^@lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@types/(.*)$": "<rootDir>/src/types/$1",
  },
};
module.exports = createJestConfig(config);
