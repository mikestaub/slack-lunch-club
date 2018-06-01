import TestSuiteUtils from "../utils";

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

import longString from "./longString";

describe("graphql schema", () => {
  test("Email type should lower case email", async () => {
    const params = { email: "ABC@test.slacklunch.club" };
    const input = createUserInput(params);
    const user = await graphQlApi.createUser(input, adminContext);
    expect(user.email).toBe(params.email.toLowerCase());
  });

  test("String type should not allow empty string", async () => {
    const input = createUserInput({ name: "" });
    await expect(graphQlApi.createUser(input, adminContext)).rejects.toThrow();
  });

  test("String type should not allow strings of length more than 5000", async () => {
    const input = createUserInput({ name: longString });
    await expect(graphQlApi.createUser(input, adminContext)).rejects.toThrow();
  });

  test("String type should trim string", async () => {
    const untrimmed = " Name ";
    const trimmed = untrimmed.trim();
    const input = createUserInput({ name: untrimmed });
    const user = await graphQlApi.createUser(input, adminContext);
    expect(user.name).toBe(trimmed);
  });

  test("String type should sanitize string", async () => {
    const name = "<script>alert('xss');</script>";
    const input = createUserInput({ name });
    const user = await graphQlApi.createUser(input, adminContext);
    expect(user.name).not.toBe(name);
  });

  test("Schema should not allow invalid pagination parameters", async () => {
    const input1 = {
      filter: {},
      pagination: {
        first: 0,
      },
    };
    const input2 = {
      filter: {},
      pagination: {
        first: 200,
      },
    };
    await expect(
      graphQlApi.getUsersByProps(input1, adminContext),
    ).rejects.toMatchObject({
      message: expect.stringMatching(/Invalid value 0/),
    });
    await expect(
      graphQlApi.getUsersByProps(input2, adminContext),
    ).rejects.toMatchObject({
      message: expect.stringMatching(/Invalid value 200/),
    });
  });
});
