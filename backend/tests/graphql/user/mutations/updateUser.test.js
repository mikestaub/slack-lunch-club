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

describe("updateUser mutation", () => {
  test("should succeed with valid input", async () => {
    const input1 = createUserInput();
    const user = await graphQlApi.createUser(input1, adminContext);
    const name = "New Name";
    const input2 = { id: user.id, name };
    const updatedUser = await graphQlApi.updateUser(input2, adminContext);
    expect(updatedUser.name).toBe(name);
  });

  test("should fail if not authorized", async () => {
    const input1 = createUserInput();
    const input2 = createUserInput();
    const user1 = await graphQlApi.createUser(input1, adminContext);
    const user2 = await graphQlApi.createUser(input2, adminContext);
    const name = "New Name";
    const input3 = { id: user1.id, name };
    const badContext = { user: user2 };
    await expect(graphQlApi.updateUser(input3, badContext)).rejects.toThrow();
  });

  test("should allow user to update themselves", async () => {
    const input1 = createUserInput();
    const user = await graphQlApi.createUser(input1, adminContext);
    const name = "New Name";
    const input2 = { id: user.id, name };
    const context = { user };
    const updatedUser = await graphQlApi.updateUser(input2, context);
    expect(updatedUser.name).toBe(name);
  });

  test("should not allow user to change their role", async () => {
    const input1 = createUserInput();
    const user = await graphQlApi.createUser(input1, adminContext);
    const role = "ADMIN";
    const input2 = { id: user.id, role };
    const context = { user };
    await expect(graphQlApi.updateUser(input2, context)).rejects.toThrow();
  });

  test("should allow admins to update other users", async () => {
    const input1 = createUserInput();
    const input2 = createUserInput({ role: "ADMIN" });
    const user1 = await graphQlApi.createUser(input1, adminContext);
    const user2 = await graphQlApi.createUser(input2, adminContext);
    const role = "ADMIN";
    const input3 = { id: user1.id, role };
    const context = { user: user2 };
    const updatedUser = await graphQlApi.updateUser(input3, context);
    expect(updatedUser.role).toBe(role);
  });

  test("should fail with invalid input", async () => {
    const input1 = createUserInput();
    const user = await graphQlApi.createUser(input1, adminContext);
    const name = "";
    const input2 = { id: user.id, name };
    await expect(graphQlApi.updateUser(input2, adminContext)).rejects.toThrow();
  });

  test("should fail if user no longer exists", async () => {
    const input1 = createUserInput();
    const user = await graphQlApi.createUser(input1, adminContext);
    const name = "New Name";
    const input2 = { id: user.id };
    await graphQlApi.deleteUser(input2, adminContext);
    const input3 = { id: user.id, name };
    await expect(graphQlApi.updateUser(input3, adminContext)).rejects.toThrow();
  });
});
