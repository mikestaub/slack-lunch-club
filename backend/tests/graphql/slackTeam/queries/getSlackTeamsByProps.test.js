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

function createUniqueName() {
  return "TEST_SLACK_TEAM_NAME." + Date.now() + "." + Math.random() * 10;
}

describe("getSlackTeamsByProps query", () => {
  test("should fail if not authorized", async () => {
    const input = createUserInput();
    const user = await graphQlApi.createUser(input, adminContext);
    const context = { user };
    await expect(
      graphQlApi.getSlackTeamsByProps({}, context),
    ).rejects.toThrow();
  });

  test("should fail with invalid input", async () => {
    const input = { filter: { BAD_PROP: "some_val" } };
    await expect(
      graphQlApi.getSlackTeamsByProps(input, adminContext),
    ).rejects.toThrow();
  });

  test("should return correct slackTeams", async () => {
    const name = createUniqueName();
    const input1 = createSlackTeamInput({ name });
    const input2 = createSlackTeamInput({ name });
    await graphQlApi.createSlackTeam(input1, adminContext);
    await graphQlApi.createSlackTeam(input2, adminContext);
    const input3 = {
      filter: { name },
      pagination: {},
    };
    const result = await graphQlApi.getSlackTeamsByProps(input3, adminContext);
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
    const input1 = createSlackTeamInput();
    await graphQlApi.createSlackTeam(input1, adminContext);
    const input2 = {};
    const result = await graphQlApi.getSlackTeamsByProps(input2, adminContext);
    expect(result.totalCount >= 1).toBe(true);
    expect(result.edges.length >= 1).toBe(true);
  });

  test("forward ASCENDING pagination should work", async () => {
    const name = createUniqueName();
    const input1 = createSlackTeamInput({
      // TODO: sorting fails with this format: TEAM_API_A, TEAM_API_B, etc
      slackApiId: "AAAAAA",
      name,
    });
    const input2 = createSlackTeamInput({
      slackApiId: "BBBBBB",
      name,
    });
    const input3 = createSlackTeamInput({
      slackApiId: "CCCCCC",
      name,
    });
    const input4 = createSlackTeamInput({
      slackApiId: "DDDDDD",
      name,
    });
    await graphQlApi.createSlackTeam(input1, adminContext);
    await graphQlApi.createSlackTeam(input2, adminContext);
    await graphQlApi.createSlackTeam(input3, adminContext);
    await graphQlApi.createSlackTeam(input4, adminContext);
    const input5 = {
      filter: { name },
      pagination: {
        first: 2,
        orderBy: "slackApiId",
        sortType: "ASCENDING",
      },
    };
    const page1 = await graphQlApi.getSlackTeamsByProps(input5, adminContext);
    expect(page1.totalCount).toBe(4);
    expect(page1.edges.length).toBe(2);
    expect(page1.pageInfo.hasNextPage).toBe(true);
    expect(page1.pageInfo.hasPreviousPage).toBe(false);
    expect(page1.edges[0].node.slackApiId).toBe("AAAAAA");
    expect(page1.edges[1].node.slackApiId).toBe("BBBBBB");
    const input6 = {
      filter: { name },
      pagination: {
        first: 1,
        orderBy: "slackApiId",
        sortType: "ASCENDING",
        after: page1.pageInfo.endCursor,
      },
    };
    const page2 = await graphQlApi.getSlackTeamsByProps(input6, adminContext);
    expect(page2.totalCount).toBe(4);
    expect(page2.edges.length).toBe(1);
    expect(page2.edges[0].node.slackApiId).toBe("CCCCCC");
    expect(page2.pageInfo.hasNextPage).toBe(true);
    expect(page2.pageInfo.hasPreviousPage).toBe(false);
  });

  test("forward DESCENDING pagination should work", async () => {
    const name = createUniqueName();
    const input1 = createSlackTeamInput({
      slackApiId: "AAAAAA",
      name,
    });
    const input2 = createSlackTeamInput({
      slackApiId: "BBBBBB",
      name,
    });
    const input3 = createSlackTeamInput({
      slackApiId: "CCCCCC",
      name,
    });
    const input4 = createSlackTeamInput({
      slackApiId: "DDDDDD",
      name,
    });
    await graphQlApi.createSlackTeam(input1, adminContext);
    await graphQlApi.createSlackTeam(input2, adminContext);
    await graphQlApi.createSlackTeam(input3, adminContext);
    await graphQlApi.createSlackTeam(input4, adminContext);
    const input5 = {
      filter: { name },
      pagination: {
        first: 2,
        orderBy: "slackApiId",
        sortType: "DESCENDING",
      },
    };
    const page1 = await graphQlApi.getSlackTeamsByProps(input5, adminContext);
    expect(page1.totalCount).toBe(4);
    expect(page1.edges.length).toBe(2);
    expect(page1.pageInfo.hasNextPage).toBe(true);
    expect(page1.pageInfo.hasPreviousPage).toBe(false);
    expect(page1.edges[0].node.slackApiId).toBe("DDDDDD");
    expect(page1.edges[1].node.slackApiId).toBe("CCCCCC");
    const input6 = {
      filter: { name },
      pagination: {
        first: 1,
        orderBy: "slackApiId",
        sortType: "DESCENDING",
        after: page1.pageInfo.endCursor,
      },
    };
    const page2 = await graphQlApi.getSlackTeamsByProps(input6, adminContext);
    expect(page2.totalCount).toBe(4);
    expect(page2.edges.length).toBe(1);
    expect(page2.edges[0].node.slackApiId).toBe("BBBBBB");
    expect(page2.pageInfo.hasNextPage).toBe(true);
    expect(page2.pageInfo.hasPreviousPage).toBe(false);
  });

  test("backward ASCENDING pagination should work", async () => {
    const name = createUniqueName();
    const input1 = createSlackTeamInput({
      slackApiId: "AAAAAA",
      name,
    });
    const input2 = createSlackTeamInput({
      slackApiId: "BBBBBB",
      name,
    });
    const input3 = createSlackTeamInput({
      slackApiId: "CCCCCC",
      name,
    });
    const input4 = createSlackTeamInput({
      slackApiId: "DDDDDD",
      name,
    });
    await graphQlApi.createSlackTeam(input1, adminContext);
    await graphQlApi.createSlackTeam(input2, adminContext);
    await graphQlApi.createSlackTeam(input3, adminContext);
    await graphQlApi.createSlackTeam(input4, adminContext);
    const input5 = {
      filter: { name },
      pagination: {
        last: 2,
        orderBy: "slackApiId",
        sortType: "ASCENDING",
      },
    };
    const page1 = await graphQlApi.getSlackTeamsByProps(input5, adminContext);
    expect(page1.totalCount).toBe(4);
    expect(page1.edges.length).toBe(2);
    expect(page1.pageInfo.hasNextPage).toBe(false);
    expect(page1.pageInfo.hasPreviousPage).toBe(true);
    expect(page1.edges[0].node.slackApiId).toBe("CCCCCC");
    expect(page1.edges[1].node.slackApiId).toBe("DDDDDD");
    const input6 = {
      filter: { name },
      pagination: {
        last: 1,
        orderBy: "slackApiId",
        sortType: "ASCENDING",
        before: page1.pageInfo.startCursor,
      },
    };
    const page2 = await graphQlApi.getSlackTeamsByProps(input6, adminContext);
    expect(page2.totalCount).toBe(4);
    expect(page2.edges.length).toBe(1);
    expect(page2.edges[0].node.slackApiId).toBe("BBBBBB");
    expect(page2.pageInfo.hasNextPage).toBe(false);
    expect(page2.pageInfo.hasPreviousPage).toBe(true);
  });

  test("backward DESCENDING pagination should work", async () => {
    const name = createUniqueName();
    const input1 = createSlackTeamInput({
      slackApiId: "AAAAAA",
      name,
    });
    const input2 = createSlackTeamInput({
      slackApiId: "BBBBBB",
      name,
    });
    const input3 = createSlackTeamInput({
      slackApiId: "CCCCCC",
      name,
    });
    const input4 = createSlackTeamInput({
      slackApiId: "DDDDDD",
      name,
    });
    await graphQlApi.createSlackTeam(input1, adminContext);
    await graphQlApi.createSlackTeam(input2, adminContext);
    await graphQlApi.createSlackTeam(input3, adminContext);
    await graphQlApi.createSlackTeam(input4, adminContext);
    const input5 = {
      filter: { name },
      pagination: {
        last: 2,
        orderBy: "slackApiId",
        sortType: "DESCENDING",
      },
    };
    const page1 = await graphQlApi.getSlackTeamsByProps(input5, adminContext);
    expect(page1.totalCount).toBe(4);
    expect(page1.edges.length).toBe(2);
    expect(page1.pageInfo.hasNextPage).toBe(false);
    expect(page1.pageInfo.hasPreviousPage).toBe(true);
    expect(page1.edges[0].node.slackApiId).toBe("BBBBBB");
    expect(page1.edges[1].node.slackApiId).toBe("AAAAAA");
    const input6 = {
      filter: { name },
      pagination: {
        last: 1,
        orderBy: "slackApiId",
        sortType: "DESCENDING",
        before: page1.pageInfo.startCursor,
      },
    };
    const page2 = await graphQlApi.getSlackTeamsByProps(input6, adminContext);
    expect(page2.totalCount).toBe(4);
    expect(page2.edges.length).toBe(1);
    expect(page2.edges[0].node.slackApiId).toBe("CCCCCC");
    expect(page2.pageInfo.hasNextPage).toBe(false);
    expect(page2.pageInfo.hasPreviousPage).toBe(true);
  });

  test("all pagination params should work together", async () => {
    const name = createUniqueName();
    const input1 = createSlackTeamInput({
      slackApiId: "AAAAAA",
      name,
    });
    const input2 = createSlackTeamInput({
      slackApiId: "BBBBBB",
      name,
    });
    const input3 = createSlackTeamInput({
      slackApiId: "CCCCCC",
      name,
    });
    const input4 = createSlackTeamInput({
      slackApiId: "DDDDDD",
      name,
    });
    await graphQlApi.createSlackTeam(input1, adminContext);
    await graphQlApi.createSlackTeam(input2, adminContext);
    await graphQlApi.createSlackTeam(input3, adminContext);
    await graphQlApi.createSlackTeam(input4, adminContext);
    const input5 = {
      filter: { name },
      pagination: {
        first: 4,
        orderBy: "slackApiId",
        sortType: "ASCENDING",
      },
    };
    const page1 = await graphQlApi.getSlackTeamsByProps(input5, adminContext);
    expect(page1.totalCount).toBe(4);
    expect(page1.edges.length).toBe(4);
    expect(page1.pageInfo.hasNextPage).toBe(false);
    expect(page1.pageInfo.hasPreviousPage).toBe(false);
    expect(page1.edges[0].node.slackApiId).toBe("AAAAAA");
    expect(page1.edges[1].node.slackApiId).toBe("BBBBBB");
    expect(page1.edges[2].node.slackApiId).toBe("CCCCCC");
    expect(page1.edges[3].node.slackApiId).toBe("DDDDDD");
    const input6 = {
      filter: { name },
      pagination: {
        first: 3, // Note: using both first and last is an anti-pattern
        last: 1,
        orderBy: "slackApiId",
        sortType: "ASCENDING",
        before: page1.pageInfo.endCursor,
        after: page1.pageInfo.startCursor,
      },
    };
    const page2 = await graphQlApi.getSlackTeamsByProps(input6, adminContext);
    expect(page2.totalCount).toBe(4);
    expect(page2.edges.length).toBe(1);
    expect(page2.edges[0].node.slackApiId).toBe("CCCCCC");
    expect(page2.pageInfo.hasNextPage).toBe(false);
    expect(page2.pageInfo.hasPreviousPage).toBe(true);
  });
});
