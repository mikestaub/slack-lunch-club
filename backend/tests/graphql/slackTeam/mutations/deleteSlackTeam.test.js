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

describe("deleteSlackTeam mutation", () => {
  test("should succeed with valid input", async () => {
    const input1 = createSlackTeamInput();
    const { id } = await graphQlApi.createSlackTeam(input1, adminContext);
    const success = await graphQlApi.deleteSlackTeam({ id }, adminContext);
    expect(success).toBe(true);
  });

  test("should fail with invalid input", async () => {
    const id = "BAD_ID";
    await expect(graphQlApi.deleteSlackTeam({ id })).rejects.toThrow();
  });

  test("should not delete slackTeam if not authorized", async () => {
    const input1 = createUserInput();
    const input2 = createSlackTeamInput();
    const user = await graphQlApi.createUser(input1, adminContext);
    const slackTeam = await graphQlApi.createSlackTeam(input2, adminContext);
    const badContext = { user };
    await expect(
      graphQlApi.deleteSlackTeam({ id: slackTeam.id }, badContext),
    ).rejects.toThrow();
  });

  test("should allow admins to delete slackTeams", async () => {
    const input1 = createUserInput({ role: "ADMIN" });
    const input2 = createSlackTeamInput();
    const user = await graphQlApi.createUser(input1, adminContext);
    const slackTeam = await graphQlApi.createSlackTeam(input2, adminContext);
    const context = { user };
    const success = await graphQlApi.deleteSlackTeam(
      { id: slackTeam.id },
      context,
    );
    expect(success).toBe(true);
  });

  test("should delete slackTeam with auth token secret", async () => {
    const input = createSlackTeamInput();
    const slackTeam = await graphQlApi.createSlackTeam(input, adminContext);
    const success = await graphQlApi.deleteSlackTeam(
      { id: slackTeam.id },
      adminContext,
    );
    expect(success).toBe(true);
  });
});
