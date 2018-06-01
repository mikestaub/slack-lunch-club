import { isPlainObject } from "lodash";

import MatchApiInterface from "../api";

describe("MatchApiInterface", () => {
  test("getUsersRequestingMatch should throw error", async () => {
    const ERROR = new Error();
    const mockGraphqlApi = {
      getUsersRequestingMatch: jest.fn(async () => {
        throw ERROR;
      }),
    };
    const api = new MatchApiInterface(mockGraphqlApi);
    expect(api.getUsersRequestingMatch()).rejects.toBe(ERROR);
  });

  test("getUsersRequestingMatch should return an object", async () => {
    const mockGraphqlApi = {
      getUsersRequestingMatch: jest.fn(() => ({
        possibleMatchesForUsers: [],
      })),
    };
    const api = new MatchApiInterface(mockGraphqlApi);
    const possibleMatchesForUsers = await api.getUsersRequestingMatch();
    expect(isPlainObject(possibleMatchesForUsers)).toBe(true);
  });

  test("matchUsers should return correct response", async () => {
    const input = {
      matches: [],
    };
    const mockGraphqlApi = {
      matchUsers: jest.fn(() => true),
    };
    const api = new MatchApiInterface(mockGraphqlApi);
    const success = await api.matchUsers(input);
    expect(success).toBe(true);
  });

  test("notifyUnmatchedUsers should return correct response", async () => {
    const input = {
      userIds: [],
    };
    const mockGraphqlApi = {
      notifyUnmatchedUsers: jest.fn(() => true),
    };
    const api = new MatchApiInterface(mockGraphqlApi);
    const success = await api.notifyUnmatchedUsers(input);
    expect(success).toBe(true);
  });

  test("getAdminEmails should return correct response", async () => {
    const EMAIL = "admin@test.com";
    const mockGraphqlApi = {
      getUsersByProps: jest.fn(() => {
        return {
          totalCount: 1,
          edges: [
            {
              node: {
                role: "ADMIN",
                email: EMAIL,
              },
              cursor: "TEST",
            },
          ],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
          },
        };
      }),
    };
    const api = new MatchApiInterface(mockGraphqlApi);
    const emails = await api.getAdminEmails();
    const expected = [EMAIL];
    expect(emails).toEqual(expected);
  });
});
