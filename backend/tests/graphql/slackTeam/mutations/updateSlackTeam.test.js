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

describe("updateSlackTeam mutation", () => {
  test("should succeed with valid input", async () => {
    const input1 = createSlackTeamInput();
    const slackTeam = await graphQlApi.createSlackTeam(input1, adminContext);
    const name = "New Team Name";
    const input2 = { id: slackTeam.id, name };
    const updatedSlackTeam = await graphQlApi.updateSlackTeam(
      input2,
      adminContext,
    );
    expect(updatedSlackTeam.name).toBe(name);
  });

  test("should fail if not authorized", async () => {
    const input1 = createUserInput();
    const input2 = createSlackTeamInput();
    const user = await graphQlApi.createUser(input1, adminContext);
    const slackTeam = await graphQlApi.createSlackTeam(input2, adminContext);
    const name = "New Team Name";
    const input3 = { id: slackTeam.id, name };
    const badContext = { user };
    await expect(
      graphQlApi.updateSlackTeam(input3, badContext),
    ).rejects.toThrow();
  });

  test("should allow admins to update slackTeam", async () => {
    const input1 = createUserInput({ role: "ADMIN" });
    const input2 = createSlackTeamInput();
    const user = await graphQlApi.createUser(input1, adminContext);
    const slackTeam = await graphQlApi.createSlackTeam(input2, adminContext);
    const name = "New Team Name";
    const input3 = { id: slackTeam.id, name };
    const context = { user };
    const updatedSlackTeam = await graphQlApi.updateSlackTeam(input3, context);
    expect(updatedSlackTeam.name).toBe(name);
  });

  test("should update slackTeam with auth token secret", async () => {
    const input1 = createSlackTeamInput();
    const slackTeam = await graphQlApi.createSlackTeam(input1, adminContext);
    const name = "New Team Name";
    const input2 = { id: slackTeam.id, name };
    const updatedSlackTeam = await graphQlApi.updateSlackTeam(
      input2,
      adminContext,
    );
    expect(updatedSlackTeam.name).toBe(name);
  });

  test("should fail with invalid input", async () => {
    const input1 = createSlackTeamInput();
    const slackTeam = await graphQlApi.createSlackTeam(input1, adminContext);
    const name = "";
    const input2 = { id: slackTeam.id, name };
    await expect(
      graphQlApi.updateSlackTeam(input2, adminContext),
    ).rejects.toThrow();
  });

  test("should fail if slackTeam no longer exists", async () => {
    const input1 = createSlackTeamInput();
    const slackTeam = await graphQlApi.createSlackTeam(input1, adminContext);
    const input2 = { id: slackTeam.id };
    await graphQlApi.deleteSlackTeam(input2, adminContext);
    const name = "New Team Name";
    const input3 = { id: slackTeam.id, name };
    await expect(
      graphQlApi.updateSlackTeam(input3, adminContext),
    ).rejects.toThrow();
  });
});
