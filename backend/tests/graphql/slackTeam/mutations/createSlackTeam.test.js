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

describe("createSlackTeam mutation", () => {
  test("should work with valid input", async () => {
    const input = createSlackTeamInput();
    const slackTeam = await graphQlApi.createSlackTeam(input, adminContext);
    expect(slackTeam.name).toBe(input.name);
  });

  test("should not allow names less than length 2", async () => {
    const input = createSlackTeamInput({ name: "A" });
    await expect(
      graphQlApi.createSlackTeam(input, adminContext),
    ).rejects.toThrow();
  });

  test("should not allow slackApiIds less than length 6", async () => {
    const input = createSlackTeamInput({ slackApiId: "12345" });
    await expect(
      graphQlApi.createSlackTeam(input, adminContext),
    ).rejects.toThrow();
  });

  test("should not create slackTeam without auth token secret", async () => {
    const input = createSlackTeamInput();
    const badContext = {};
    await expect(
      graphQlApi.createSlackTeam(input, badContext),
    ).rejects.toThrow();
  });

  test("should not create slackTeam with non-admin credentials", async () => {
    const input1 = createUserInput();
    const input2 = createSlackTeamInput();
    const user = await graphQlApi.createUser(input1, adminContext);
    const badContext = { user };
    await expect(
      graphQlApi.createSlackTeam(input2, badContext),
    ).rejects.toThrow();
  });

  test("should create slackTeam with admin credentials", async () => {
    const input1 = createUserInput({ role: "ADMIN" });
    const name = "TEST_TEAM_NAME";
    const input2 = createSlackTeamInput({ name });
    const user = await graphQlApi.createUser(input1, adminContext);
    const badContext = { user };
    const slackTeam = await graphQlApi.createSlackTeam(input2, badContext);
    expect(slackTeam.name).toBe(name);
  });

  test("should not create slackTeam if slackApiId exists", async () => {
    const slackApiId = "123456";
    const input1 = createSlackTeamInput({ slackApiId });
    const input2 = createSlackTeamInput({ slackApiId });
    await graphQlApi.createSlackTeam(input1, adminContext);
    await expect(
      graphQlApi.createSlackTeam(input2, adminContext),
    ).rejects.toThrow();
  });
});
