import TestSuiteUtils from "../../../utils";

const utils = new TestSuiteUtils();
utils.setupJest();

let adminContext = null;
let graphQlApi = null;
let createUserInput = null;
let createSlackTeamInput = null;
beforeAll(() => {
  adminContext = utils.adminContext;
  graphQlApi = utils.graphQlApi;
  createUserInput = utils.createUserInput;
  createSlackTeamInput = utils.createSlackTeamInput;
});

describe("addToSlackTeam mutation", () => {
  test("should allow users to add themselves to slackTeam", async () => {
    const input1 = createUserInput();
    const input2 = createSlackTeamInput();
    const user = await graphQlApi.createUser(input1, adminContext);
    const slackTeam = await graphQlApi.createSlackTeam(input2, adminContext);
    const input3 = {
      userId: user.id,
      slackTeamId: slackTeam.id,
    };
    const context = { user };
    const success = await graphQlApi.addToSlackTeam(input3, context);
    expect(success).toBe(true);
  });

  test("should allow admins to add users to slackTeam", async () => {
    const input1 = createUserInput();
    const input2 = createUserInput({ role: "ADMIN" });
    const input3 = createSlackTeamInput();
    const user1 = await graphQlApi.createUser(input1, adminContext);
    const user2 = await graphQlApi.createUser(input2, adminContext);
    const slackTeam = await graphQlApi.createSlackTeam(input3, adminContext);
    const input4 = {
      userId: user1.id,
      slackTeamId: slackTeam.id,
    };
    const context = { user: user2 };
    const success = await graphQlApi.addToSlackTeam(input4, context);
    expect(success).toBe(true);
  });

  test("should not allow users to add other users to slackTeam", async () => {
    const input1 = createUserInput();
    const input2 = createUserInput();
    const input3 = createSlackTeamInput();
    const user1 = await graphQlApi.createUser(input1, adminContext);
    const user2 = await graphQlApi.createUser(input2, adminContext);
    const slackTeam = await graphQlApi.createSlackTeam(input3, adminContext);
    const input4 = {
      userId: user1.id,
      slackTeamId: slackTeam.id,
    };
    const context = { user: user2 };
    await expect(graphQlApi.addToSlackTeam(input4, context)).rejects.toThrow();
  });

  test("should fail with invalid input", async () => {
    const input = {
      BAD_PROP: "bad_val",
    };
    await expect(
      graphQlApi.addToSlackTeam(input, adminContext),
    ).rejects.toThrow();
  });

  test("should fail if user does not exist", async () => {
    const input1 = createSlackTeamInput();
    const slackTeam = await graphQlApi.createSlackTeam(input1, adminContext);
    const input2 = {
      userId: "SOME_BAD_ID",
      slackTeamId: slackTeam.id,
    };
    await expect(
      graphQlApi.addToSlackTeam(input2, adminContext),
    ).rejects.toThrow();
  });

  test("should fail if slackTeam does not exist", async () => {
    const input1 = createUserInput();
    const user = await graphQlApi.createUser(input1, adminContext);
    const input2 = {
      userId: user.id,
      slackTeamId: "SOME_BAD_ID",
    };
    await expect(
      graphQlApi.addToSlackTeam(input2, adminContext),
    ).rejects.toThrow();
  });

  test("should not fail if user already is member of slackTeam", async () => {
    const input1 = createUserInput();
    const input2 = createSlackTeamInput();
    const user = await graphQlApi.createUser(input1, adminContext);
    const slackTeam = await graphQlApi.createSlackTeam(input2, adminContext);
    const input3 = {
      userId: user.id,
      slackTeamId: slackTeam.id,
    };
    await graphQlApi.addToSlackTeam(input3, adminContext);
    const success = await graphQlApi.addToSlackTeam(input3, adminContext);
    expect(success).toBe(true);
  });
});
