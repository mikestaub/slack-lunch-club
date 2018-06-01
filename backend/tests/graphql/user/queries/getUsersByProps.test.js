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

function createUniqueName() {
  return "TEST_USER_NAME." + Date.now() + "." + Math.random() * 10;
}

describe("getUsersByProps query", () => {
  test("should fail if not authorized", async () => {
    const input = createUserInput();
    const user = await graphQlApi.createUser(input, adminContext);
    const context = { user };
    await expect(graphQlApi.getUsersByProps({}, context)).rejects.toThrow();
  });

  test("should fail with invalid input", async () => {
    const input = { filter: { BAD_PROP: "some_val" } };
    await expect(
      graphQlApi.getUsersByProps(input, adminContext),
    ).rejects.toThrow();
  });

  test("should return correct users", async () => {
    const name = createUniqueName();
    const input1 = createUserInput({ name });
    const input2 = createUserInput({ name });
    await graphQlApi.createUser(input1, adminContext);
    await graphQlApi.createUser(input2, adminContext);
    const input3 = {
      filter: { name },
      pagination: {},
    };
    const result = await graphQlApi.getUsersByProps(input3, adminContext);
    expect(result.totalCount).toBe(2);
    expect(result.edges.length).toBe(2);
    const users = result.edges.filter(edge => edge.node.name === name);
    expect(users.length).toBe(2);
    expect(result.pageInfo.hasNextPage).toBe(false);
    expect(result.pageInfo.hasPreviousPage).toBe(false);
    expect(result.pageInfo.startCursor).toBe(users[0].cursor);
    expect(result.pageInfo.endCursor).toBe(users[users.length - 1].cursor);
  });

  test("should work with empty input", async () => {
    const input1 = createUserInput();
    await graphQlApi.createUser(input1, adminContext);
    const input2 = {};
    const result = await graphQlApi.getUsersByProps(input2, adminContext);
    expect(result.totalCount >= 1).toBe(true);
    expect(result.edges.length >= 1).toBe(true);
  });

  test("forward ASCENDING pagination should work", async () => {
    const name = createUniqueName();
    const input1 = createUserInput({ name, email: "a@test.slacklunch.club" });
    const input2 = createUserInput({ name, email: "b@test.slacklunch.club" });
    const input3 = createUserInput({ name, email: "c@test.slacklunch.club" });
    const input4 = createUserInput({ name, email: "d@test.slacklunch.club" });
    await graphQlApi.createUser(input1, adminContext);
    await graphQlApi.createUser(input2, adminContext);
    await graphQlApi.createUser(input3, adminContext);
    await graphQlApi.createUser(input4, adminContext);
    const input5 = {
      filter: { name },
      pagination: {
        first: 2,
        orderBy: "email",
        sortType: "ASCENDING",
      },
    };
    const page1 = await graphQlApi.getUsersByProps(input5, adminContext);
    expect(page1.totalCount).toBe(4);
    expect(page1.edges.length).toBe(2);
    expect(page1.pageInfo.hasNextPage).toBe(true);
    expect(page1.pageInfo.hasPreviousPage).toBe(false);
    expect(page1.edges[0].node.email).toBe("a@test.slacklunch.club");
    expect(page1.edges[1].node.email).toBe("b@test.slacklunch.club");
    const input6 = {
      filter: { name },
      pagination: {
        first: 1,
        orderBy: "email",
        sortType: "ASCENDING",
        after: page1.pageInfo.endCursor,
      },
    };
    const page2 = await graphQlApi.getUsersByProps(input6, adminContext);
    expect(page2.totalCount).toBe(4);
    expect(page2.edges.length).toBe(1);
    expect(page2.edges[0].node.email).toBe("c@test.slacklunch.club");
    expect(page2.pageInfo.hasNextPage).toBe(true);
    expect(page2.pageInfo.hasPreviousPage).toBe(false);
  });

  test("forward DESCENDING pagination should work", async () => {
    const name = createUniqueName();
    const input1 = createUserInput({ name, email: "a@test.slacklunch.club" });
    const input2 = createUserInput({ name, email: "b@test.slacklunch.club" });
    const input3 = createUserInput({ name, email: "c@test.slacklunch.club" });
    const input4 = createUserInput({ name, email: "d@test.slacklunch.club" });
    await graphQlApi.createUser(input1, adminContext);
    await graphQlApi.createUser(input2, adminContext);
    await graphQlApi.createUser(input3, adminContext);
    await graphQlApi.createUser(input4, adminContext);
    const input5 = {
      filter: { name },
      pagination: {
        first: 2,
        orderBy: "email",
        sortType: "DESCENDING",
      },
    };
    const page1 = await graphQlApi.getUsersByProps(input5, adminContext);
    expect(page1.totalCount).toBe(4);
    expect(page1.edges.length).toBe(2);
    expect(page1.pageInfo.hasNextPage).toBe(true);
    expect(page1.pageInfo.hasPreviousPage).toBe(false);
    expect(page1.edges[0].node.email).toBe("d@test.slacklunch.club");
    expect(page1.edges[1].node.email).toBe("c@test.slacklunch.club");
    const input6 = {
      filter: { name },
      pagination: {
        first: 1,
        orderBy: "email",
        sortType: "DESCENDING",
        after: page1.pageInfo.endCursor,
      },
    };
    const page2 = await graphQlApi.getUsersByProps(input6, adminContext);
    expect(page2.totalCount).toBe(4);
    expect(page2.edges.length).toBe(1);
    expect(page2.edges[0].node.email).toBe("b@test.slacklunch.club");
    expect(page2.pageInfo.hasNextPage).toBe(true);
    expect(page2.pageInfo.hasPreviousPage).toBe(false);
  });

  test("backward ASCENDING pagination should work", async () => {
    const name = createUniqueName();
    const input1 = createUserInput({ name, email: "a@test.slacklunch.club" });
    const input2 = createUserInput({ name, email: "b@test.slacklunch.club" });
    const input3 = createUserInput({ name, email: "c@test.slacklunch.club" });
    const input4 = createUserInput({ name, email: "d@test.slacklunch.club" });
    await graphQlApi.createUser(input1, adminContext);
    await graphQlApi.createUser(input2, adminContext);
    await graphQlApi.createUser(input3, adminContext);
    await graphQlApi.createUser(input4, adminContext);
    const input5 = {
      filter: { name },
      pagination: {
        last: 2,
        orderBy: "email",
        sortType: "ASCENDING",
      },
    };
    const page1 = await graphQlApi.getUsersByProps(input5, adminContext);
    expect(page1.totalCount).toBe(4);
    expect(page1.edges.length).toBe(2);
    expect(page1.pageInfo.hasNextPage).toBe(false);
    expect(page1.pageInfo.hasPreviousPage).toBe(true);
    expect(page1.edges[0].node.email).toBe("c@test.slacklunch.club");
    expect(page1.edges[1].node.email).toBe("d@test.slacklunch.club");
    const input6 = {
      filter: { name },
      pagination: {
        last: 1,
        orderBy: "email",
        sortType: "ASCENDING",
        before: page1.pageInfo.startCursor,
      },
    };
    const page2 = await graphQlApi.getUsersByProps(input6, adminContext);
    expect(page2.totalCount).toBe(4);
    expect(page2.edges.length).toBe(1);
    expect(page2.edges[0].node.email).toBe("b@test.slacklunch.club");
    expect(page2.pageInfo.hasNextPage).toBe(false);
    expect(page2.pageInfo.hasPreviousPage).toBe(true);
  });

  test("backward DESCENDING pagination should work", async () => {
    const name = createUniqueName();
    const input1 = createUserInput({ name, email: "a@test.slacklunch.club" });
    const input2 = createUserInput({ name, email: "b@test.slacklunch.club" });
    const input3 = createUserInput({ name, email: "c@test.slacklunch.club" });
    const input4 = createUserInput({ name, email: "d@test.slacklunch.club" });
    await graphQlApi.createUser(input1, adminContext);
    await graphQlApi.createUser(input2, adminContext);
    await graphQlApi.createUser(input3, adminContext);
    await graphQlApi.createUser(input4, adminContext);
    const input5 = {
      filter: { name },
      pagination: {
        last: 2,
        orderBy: "email",
        sortType: "DESCENDING",
      },
    };
    const page1 = await graphQlApi.getUsersByProps(input5, adminContext);
    expect(page1.totalCount).toBe(4);
    expect(page1.edges.length).toBe(2);
    expect(page1.pageInfo.hasNextPage).toBe(false);
    expect(page1.pageInfo.hasPreviousPage).toBe(true);
    expect(page1.edges[0].node.email).toBe("b@test.slacklunch.club");
    expect(page1.edges[1].node.email).toBe("a@test.slacklunch.club");
    const input6 = {
      filter: { name },
      pagination: {
        last: 1,
        orderBy: "email",
        sortType: "DESCENDING",
        before: page1.pageInfo.startCursor,
      },
    };
    const page2 = await graphQlApi.getUsersByProps(input6, adminContext);
    expect(page2.totalCount).toBe(4);
    expect(page2.edges.length).toBe(1);
    expect(page2.edges[0].node.email).toBe("c@test.slacklunch.club");
    expect(page2.pageInfo.hasNextPage).toBe(false);
    expect(page2.pageInfo.hasPreviousPage).toBe(true);
  });

  test("all pagination params should work together", async () => {
    const name = createUniqueName();
    const input1 = createUserInput({ name, email: "a@test.slacklunch.club" });
    const input2 = createUserInput({ name, email: "b@test.slacklunch.club" });
    const input3 = createUserInput({ name, email: "c@test.slacklunch.club" });
    const input4 = createUserInput({ name, email: "d@test.slacklunch.club" });
    await graphQlApi.createUser(input1, adminContext);
    await graphQlApi.createUser(input2, adminContext);
    await graphQlApi.createUser(input3, adminContext);
    await graphQlApi.createUser(input4, adminContext);
    const input5 = {
      filter: { name },
      pagination: {
        first: 4,
        orderBy: "email",
        sortType: "ASCENDING",
      },
    };
    const page1 = await graphQlApi.getUsersByProps(input5, adminContext);
    expect(page1.totalCount).toBe(4);
    expect(page1.edges.length).toBe(4);
    expect(page1.pageInfo.hasNextPage).toBe(false);
    expect(page1.pageInfo.hasPreviousPage).toBe(false);
    expect(page1.edges[0].node.email).toBe("a@test.slacklunch.club");
    expect(page1.edges[1].node.email).toBe("b@test.slacklunch.club");
    expect(page1.edges[2].node.email).toBe("c@test.slacklunch.club");
    expect(page1.edges[3].node.email).toBe("d@test.slacklunch.club");
    const input6 = {
      filter: { name },
      pagination: {
        first: 3, // Note: using both first and last is an anti-pattern
        last: 1,
        orderBy: "email",
        sortType: "ASCENDING",
        before: page1.pageInfo.endCursor,
        after: page1.pageInfo.startCursor,
      },
    };
    const page2 = await graphQlApi.getUsersByProps(input6, adminContext);
    expect(page2.totalCount).toBe(4);
    expect(page2.edges.length).toBe(1);
    expect(page2.edges[0].node.email).toBe("c@test.slacklunch.club");
    expect(page2.pageInfo.hasNextPage).toBe(false);
    expect(page2.pageInfo.hasPreviousPage).toBe(true);
  });
});
