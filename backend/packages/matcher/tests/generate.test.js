import MatchGenerator from "../generate";

describe("generate.js", () => {
  test("generateMatches should fail with invalid input", () => {
    const userMatchesObj = [];
    const generator = new MatchGenerator();
    expect(() => generator.generateMatches(userMatchesObj)).toThrow();
  });

  test("generateMatches should fail with invalid input", () => {
    const userMatchesObj = {
      a: "bad",
    };
    const generator = new MatchGenerator();
    expect(() => generator.generateMatches(userMatchesObj)).toThrow();
  });

  test("generateMatches should fail with invalid input", () => {
    const userMatchesObj = {
      a: ["a", "b"],
      b: ["a"],
    };
    const generator = new MatchGenerator();
    expect(() => generator.generateMatches(userMatchesObj)).toThrow();
  });

  test("generateMatches should fail with invalid input", () => {
    const userMatchesObj = {
      a: ["b", "c"],
      b: ["a"],
    };
    const generator = new MatchGenerator();
    expect(() => generator.generateMatches(userMatchesObj)).toThrow();
  });

  test("generateMatches should fail with invalid input", () => {
    const userMatchesObj = {
      a: ["b"],
      b: ["c"],
      c: ["b"],
    };
    const generator = new MatchGenerator();
    expect(() => generator.generateMatches(userMatchesObj)).toThrow();
  });

  test("generateMatches should return an object", () => {
    const userMatchesObj = {
      a: ["b"],
      b: ["a"],
    };
    const generator = new MatchGenerator();
    const results = generator.generateMatches(userMatchesObj);
    const isObject = results instanceof Object;
    expect(isObject).toEqual(true);
  });

  test("generateMatches should return an object with correct keys", () => {
    const userMatchesObj = {
      a: ["b"],
      b: ["a"],
    };
    const generator = new MatchGenerator();
    const results = generator.generateMatches(userMatchesObj);
    const expected = ["matches", "unmatchable"];
    expect(Object.keys(results)).toEqual(expected);
  });

  test("generateMatches should return matches with valid input", () => {
    const userMatchesObj = {
      a: ["b"],
      b: ["a"],
    };
    const generator = new MatchGenerator();
    const results = generator.generateMatches(userMatchesObj);
    const hasMatches = results.matches.length > 0;
    expect(hasMatches).toEqual(true);
  });

  test("generateMatches return correct unmatchable result", () => {
    const userMatchesObj = {
      a: ["b"],
      b: ["a"],
      c: [],
    };
    const generator = new MatchGenerator();
    const results = generator.generateMatches(userMatchesObj);
    expect(results.matches.length).toEqual(1);
    expect(results.unmatchable.length).toEqual(1);
  });

  test("generateMatches should return correct results with valid input", () => {
    const userMatchesObj = {
      a: ["b", "d", "c"],
      b: ["a"],
      c: ["a"],
      d: ["a"],
    };
    const generator = new MatchGenerator();
    const results = generator.generateMatches(userMatchesObj);
    expect(results.matches.length).toEqual(1);
    expect(results.unmatchable.length).toEqual(2);
  });

  test("generateMatches should return matches with valid input", () => {
    const userMatchesObj = {
      a: ["c", "b"],
      b: ["a"],
      c: ["a"],
    };
    const generator = new MatchGenerator();
    const results = generator.generateMatches(userMatchesObj);
    const hasMatches = results.matches.length > 0;
    expect(hasMatches).toEqual(true);
  });

  test("generateMatches should return matches with valid input", () => {
    const userMatchesObj = {
      a: ["b", "d"],
      b: ["c", "a"],
      c: ["b"],
      d: ["a"],
    };
    const generator = new MatchGenerator();
    const results = generator.generateMatches(userMatchesObj);
    const hasMatches = results.matches.length > 0;
    expect(hasMatches).toEqual(true);
  });

  test("generateMatches should return unmatchable with valid input", () => {
    const userMatchesObj = {
      a: ["b", "c"],
      b: ["a"],
      c: ["a"],
    };
    const generator = new MatchGenerator();
    const results = generator.generateMatches(userMatchesObj);
    expect(results.unmatchable.length).toEqual(1);
  });

  test("generateMatches should return unique matches with valid input", () => {
    const userMatchesObj = {
      a: ["b"],
      b: ["a", "c"],
      c: ["b", "d", "e"],
      d: ["c", "e"],
      e: ["c", "f", "d"],
      f: ["e"],
    };
    function matchesAreUnique(matches) {
      const set = new Set();
      return matches.every(match => {
        const userA = match[0];
        const userB = match[1];
        if (set.has(userA) || set.has(userB)) {
          return false;
        }
        set.add(userA);
        set.add(userB);
        return true;
      });
    }
    const generator = new MatchGenerator();
    const results = generator.generateMatches(userMatchesObj);
    expect(matchesAreUnique(results.matches)).toEqual(true);
  });

  test("generateMatches should return correct result with valid input", () => {
    const userMatchesObj = {
      a: ["b"],
      b: ["a", "c", "d"],
      c: ["b", "d", "e"],
      d: ["c", "e", "b"],
      e: ["c", "d", "f"],
      f: ["e"],
    };
    const expected = [["b", "a"], ["d", "c"], ["f", "e"]];
    const generator = new MatchGenerator();
    const actual = generator.generateMatches(userMatchesObj);
    expect(actual.matches).toEqual(expected);
  });

  test("generateMatches should return correct result with valid input (complex case)", () => {
    const userMatchesObj = {
      a: ["d", "b", "c", "e", "f", "g"],
      b: ["a", "c", "d"],
      c: ["a", "b", "e"],
      d: ["b", "a"],
      e: ["a", "c"],
      f: ["a"],
      g: ["a"],
    };
    const expectedMatches = [["g", "a"], ["d", "b"], ["e", "c"]];
    const expectedUnmatchable = ["f"];
    const generator = new MatchGenerator();
    const actual = generator.generateMatches(userMatchesObj);
    expect(actual.matches).toEqual(expectedMatches);
    expect(actual.unmatchable).toEqual(expectedUnmatchable);
  });
});
