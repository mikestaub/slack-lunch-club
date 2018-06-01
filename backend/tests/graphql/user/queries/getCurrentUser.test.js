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

describe("getCurrentUser query", () => {
  test("should fail with invalid context", async () => {
    const context = {};
    await expect(graphQlApi.getCurrentUser(context)).rejects.toThrow();
  });

  test("should return the correct user", async () => {
    const input1 = createUserInput();
    const user = await graphQlApi.createUser(input1, adminContext);
    const context = { user };
    const currentUser = await graphQlApi.getCurrentUser(context);
    expect(currentUser.id).toBe(user.id);
  });

  test("should fail if user does not exist", async () => {
    const input1 = createUserInput();
    const user = await graphQlApi.createUser(input1, adminContext);
    const context = { user };
    const success = await graphQlApi.deleteUser({ id: user.id }, context);
    expect(success).toBe(true);
    await expect(graphQlApi.getCurrentUser(context)).rejects.toThrow();
  });
});
