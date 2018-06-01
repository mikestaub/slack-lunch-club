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

describe("deleteUser mutation", () => {
  test("should succeed with valid input", async () => {
    const input1 = createUserInput();
    const { id } = await graphQlApi.createUser(input1, adminContext);
    const success = await graphQlApi.deleteUser({ id }, adminContext);
    expect(success).toBe(true);
  });

  test("should fail with invalid input", async () => {
    const id = "BAD_ID";
    await expect(graphQlApi.deleteUser({ id })).rejects.toThrow();
  });

  test("should not delete user if not authorized", async () => {
    const input1 = createUserInput();
    const input2 = createUserInput();
    const user1 = await graphQlApi.createUser(input1, adminContext);
    const user2 = await graphQlApi.createUser(input2, adminContext);
    const badContext = { user: user1 };
    await expect(
      graphQlApi.deleteUser({ id: user2.id }, badContext),
    ).rejects.toThrow();
  });

  test("should allow users to delete themselves", async () => {
    const input1 = createUserInput();
    const user = await graphQlApi.createUser(input1, adminContext);
    const context = { user };
    const success = await graphQlApi.deleteUser({ id: user.id }, context);
    expect(success).toBe(true);
  });

  test("should allow admins to delete other users", async () => {
    const input1 = createUserInput();
    const input2 = createUserInput({ role: "ADMIN" });
    const user1 = await graphQlApi.createUser(input1, adminContext);
    const user2 = await graphQlApi.createUser(input2, adminContext);
    const context = { user: user2 };
    const success = await graphQlApi.deleteUser({ id: user1.id }, context);
    expect(success).toBe(true);
  });
});
