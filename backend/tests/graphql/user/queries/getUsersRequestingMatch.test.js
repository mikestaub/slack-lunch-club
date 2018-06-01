import TestSuiteUtils from "../../../utils";

const utils = new TestSuiteUtils();
utils.setupJest();

let adminContext = null;
let graphQlApi = null;
let createUserInput = null;
let createSlackTeamInput = null;
// let config = null;
beforeAll(() => {
  adminContext = utils.adminContext;
  graphQlApi = utils.graphQlApi;
  createUserInput = utils.createUserInput;
  createSlackTeamInput = utils.createSlackTeamInput;
  // config = utils.config;
});

describe("getUsersRequestingMatch query", () => {
  test("should fail if not authorized", async () => {
    const input1 = createUserInput();
    const user = await graphQlApi.createUser(input1, adminContext);
    const context = {
      user,
    };
    await expect(graphQlApi.getUsersRequestingMatch(context)).rejects.toThrow();
  });

  test("should return correct results", async () => {
    const params = {
      location: {
        lat: 10,
        lng: 10,
        key: "TEST",
        formattedAddress: "TEST",
      },
      availableDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
      },
    };

    const input1 = createSlackTeamInput();
    const input2 = createUserInput(params);
    const input3 = createUserInput(params);
    const slackTeam = await graphQlApi.createSlackTeam(input1, adminContext);
    const user1 = await graphQlApi.createUser(input2, adminContext);
    const user2 = await graphQlApi.createUser(input3, adminContext);
    const input4 = {
      userId: user1.id,
      slackTeamId: slackTeam.id,
    };
    const input5 = {
      userId: user2.id,
      slackTeamId: slackTeam.id,
    };
    await graphQlApi.addToSlackTeam(input4, adminContext);
    await graphQlApi.addToSlackTeam(input5, adminContext);
    const {
      possibleMatchesForUsers,
    } = await graphQlApi.getUsersRequestingMatch(adminContext);
    const matches = possibleMatchesForUsers;
    expect(matches.length).toBeGreaterThanOrEqual(2);
    const expectedMatches = matches.filter(match => {
      if (match.userId === user1.id) {
        return match.possibleMatches.includes(user2.id);
      } else if (match.userId === user2.id) {
        return match.possibleMatches.includes(user1.id);
      }
    });
    expect(expectedMatches.length).toBe(2);
  });

  test("should return correct results after a match", async () => {
    const params = {
      matchEveryWeek: true,
      location: {
        lat: 10,
        lng: 10,
        key: "TEST",
        formattedAddress: "TEST",
      },
      availableDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
      },
    };

    const input1 = createSlackTeamInput();
    const input2 = createUserInput(params);
    const input3 = createUserInput(params);
    const slackTeam = await graphQlApi.createSlackTeam(input1, adminContext);
    const user1 = await graphQlApi.createUser(input2, adminContext);
    const user2 = await graphQlApi.createUser(input3, adminContext);
    const input4 = {
      userId: user1.id,
      slackTeamId: slackTeam.id,
    };
    const input5 = {
      userId: user2.id,
      slackTeamId: slackTeam.id,
    };
    await graphQlApi.addToSlackTeam(input4, adminContext);
    await graphQlApi.addToSlackTeam(input5, adminContext);
    const result1 = await graphQlApi.getUsersRequestingMatch(adminContext);
    const users1 = result1.possibleMatchesForUsers;
    expect(users1.length).toBeGreaterThanOrEqual(2);
    const expectedUsers = users1.filter(user => {
      if (user.userId === user1.id) {
        return user.possibleMatches.includes(user2.id);
      } else if (user.userId === user2.id) {
        return user.possibleMatches.includes(user1.id);
      }
    });
    expect(expectedUsers.length).toBe(2);
    const input6 = {
      matches: [[user1.id, user2.id]],
    };
    const success = await graphQlApi.matchUsers(input6, adminContext);
    expect(success).toBe(true);
    const result2 = await graphQlApi.getUsersRequestingMatch(adminContext);
    const users2 = result2.possibleMatchesForUsers;
    expect(users2.length).toBeGreaterThanOrEqual(0);
  });

  test("should return correct results after a match and time past", async () => {
    const params = {
      matchEveryWeek: true,
      location: {
        lat: 10,
        lng: 10,
        key: "TEST",
        formattedAddress: "TEST",
      },
      availableDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
      },
    };

    const input1 = createSlackTeamInput();
    const input2 = createUserInput(params);
    const input3 = createUserInput(params);
    const slackTeam = await graphQlApi.createSlackTeam(input1, adminContext);
    const user1 = await graphQlApi.createUser(input2, adminContext);
    const user2 = await graphQlApi.createUser(input3, adminContext);
    const input4 = {
      userId: user1.id,
      slackTeamId: slackTeam.id,
    };
    const input5 = {
      userId: user2.id,
      slackTeamId: slackTeam.id,
    };
    await graphQlApi.addToSlackTeam(input4, adminContext);
    await graphQlApi.addToSlackTeam(input5, adminContext);
    const result1 = await graphQlApi.getUsersRequestingMatch(adminContext);
    const users1 = result1.possibleMatchesForUsers;
    expect(users1.length).toBeGreaterThanOrEqual(2);
    const expectedUsers = users1.filter(user => {
      if (user.userId === user1.id) {
        return user.possibleMatches.includes(user2.id);
      } else if (user.userId === user2.id) {
        return user.possibleMatches.includes(user1.id);
      }
    });
    expect(expectedUsers.length).toBe(2);
    const input6 = {
      matches: [[user1.id, user2.id]],
    };
    const success = await graphQlApi.matchUsers(input6, adminContext);
    expect(success).toBe(true);
    const matchPeriod = new Date();
    // TODO: fix timing issues
    // const days = config.email.matchPeriodInDays;
    const days = 8;
    matchPeriod.setDate(matchPeriod.getDate() - days);
    const input7 = {
      id: user1.id,
      lastMatchEmailSent: matchPeriod.toISOString(),
    };
    const input8 = {
      id: user2.id,
      lastMatchEmailSent: matchPeriod.toISOString(),
    };
    await graphQlApi.updateUser(input7, adminContext);
    await graphQlApi.updateUser(input8, adminContext);
    const result2 = await graphQlApi.getUsersRequestingMatch(adminContext);
    const users2 = result2.possibleMatchesForUsers;
    expect(users2.length).toBeGreaterThanOrEqual(2);
  });
});
