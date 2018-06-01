import TestSuiteUtils from "../../../utils";

const utils = new TestSuiteUtils();
utils.setupJest();

let adminContext = null;
let graphQlApi = null;
let createUserInput = null;
beforeAll(() => {
  adminContext = utils.adminContext;
  graphQlApi = utils.graphQlApi;
  createUserInput = utils.createUserInput;
});

describe("createUser mutation", () => {
  test("should work with valid input", async () => {
    const input = createUserInput();
    const user = await graphQlApi.createUser(input, adminContext);
    expect(user.email).toBe(input.email);
  });

  test("should not allow names less than length 2", async () => {
    const input = createUserInput({ name: "A" });
    await expect(graphQlApi.createUser(input, adminContext)).rejects.toThrow();
  });

  test("should not create admin user without auth token secret", async () => {
    const input = createUserInput({ role: "ADMIN" });
    const badContext = {};
    await expect(graphQlApi.createUser(input, badContext)).rejects.toThrow();
  });

  test("should not create user with non-admin credentials", async () => {
    const input = createUserInput();
    const user = await graphQlApi.createUser(input, adminContext);
    const badContext = { user };
    await expect(graphQlApi.createUser(input, badContext)).rejects.toThrow();
  });

  test("should not create user if email already in use", async () => {
    const input = createUserInput();
    const user = await graphQlApi.createUser(input, adminContext);
    expect(user.email).toBe(input.email);
    await expect(graphQlApi.createUser(input, adminContext)).rejects.toThrow();
  });

  test("should not create a user with invalid slack team", async () => {
    const input = createUserInput({ slackTeamId: "BAD_TEAM" });
    await expect(graphQlApi.createUser(input, adminContext)).rejects.toThrow();
  });
});
