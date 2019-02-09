module.exports = {
  roots: [
    "<rootDir>"
  ],
  transform: {
    "^.+\\.ts$": "ts-jest"
  },
  testRegex: "(/test/specs/.*|(\\.|/)(test|spec))\\.tsx?$",
  moduleFileExtensions: [
    "ts",
    "js",
    "json",
    "node"
  ],
};