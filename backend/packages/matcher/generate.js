// @flow

import { isPlainObject } from "lodash";
import blossom from "edmonds-blossom";

type GeneratorOutput = {
  matches: Array<Array<string>>,
  unmatchable: Array<string>,
};

// [ to, from, weight ]
type Edge = [number, number, number];

class MatchGenerator {
  userIdToIndex: Object;
  indexToUserId: Object;
  defaultWeight: number;
  unmatchableUsers: Set<string>;

  constructor() {
    this.userIdToIndex = {};
    this.indexToUserId = {};
    // In the future, we could make the generator more intelligent by providing
    // a weight to each edge (how many friends, twitter followers, etc the users
    // share for example)
    this.defaultWeight = 1;
    this.unmatchableUsers = new Set();
  }

  // we use Jack Edmonds Blossom alogrithm O(n^3)
  // https://en.wikipedia.org/wiki/Blossom_algorithm
  generateMatches(input: Object): GeneratorOutput {
    this.validateInput(input);
    const blossomInput = this.processInput(input);
    const blossomOutput = blossom(blossomInput);
    return this.processOutput(blossomOutput);
  }

  processInput(input: Object): Array<?Edge> {
    const edges = [];

    Object.keys(input).forEach((userId, idx) => {
      this.userIdToIndex[userId] = idx;
      this.indexToUserId[idx] = userId;
    });

    Object.keys(input).forEach(userId => {
      const possibleMatches = input[userId];
      const to = this.userIdToIndex[userId];
      const weight = this.defaultWeight;
      possibleMatches.forEach(matchId => {
        const from = this.userIdToIndex[matchId];
        const edge = [to, from, weight];
        edges.push(edge);
      });
      if (!possibleMatches.length) {
        this.unmatchableUsers.add(userId);
      }
    });

    return edges;
  }

  processOutput(output: Array<?Edge>): GeneratorOutput {
    const matches = [];
    const alreadyMatched = new Set();

    output.forEach((index, idx) => {
      if (index === -1) {
        const userId = this.indexToUserId[idx];
        this.unmatchableUsers.add(userId);
        return;
      }
      const userIdA = this.indexToUserId[index];
      const userIdB = this.indexToUserId[idx];

      if (!alreadyMatched.has(userIdA) && !alreadyMatched.has(userIdB)) {
        const match = [userIdA, userIdB];
        matches.push(match);
        alreadyMatched.add(userIdA);
        alreadyMatched.add(userIdB);
      }
    });

    const unmatchable = [...this.unmatchableUsers.values()];
    this.unmatchableUsers.clear();

    return {
      matches,
      unmatchable,
    };
  }

  validateInput(input: Object): void {
    if (!isPlainObject(input)) {
      throw new Error("Invalid input, expected Object");
    }
    const allUserIds = Object.keys(input);
    Object.entries(input).forEach(entry => {
      const [userId, possibleMatches] = entry;
      if (!(possibleMatches instanceof Array)) {
        throw new Error("Invalid response, expected array");
      }
      if (possibleMatches.includes(userId)) {
        throw new Error(`Cannot include self in possible matches, ${userId}`);
      }
      possibleMatches.forEach(possibleMatch => {
        if (!allUserIds.includes(possibleMatch)) {
          throw new Error(
            `Found invalid userId in possible matches, ${possibleMatch}`,
          );
        }
        if (!input[possibleMatch].includes(userId)) {
          throw new Error(
            `Non-symmetric users found in possible matches, ${userId} and ${possibleMatch}`,
          );
        }
      });
    });
  }
}

export default MatchGenerator;
