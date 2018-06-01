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

describe("slackTeam type", () => {
  test("should return correct userMemberConnection", async () => {
    const input1 = createUserInput();
    const input2 = createSlackTeamInput();
    const user = await graphQlApi.createUser(input1, adminContext);
    const slackTeam1 = await graphQlApi.createSlackTeam(input2, adminContext);
    const input3 = {
      userId: user.id,
      slackTeamId: slackTeam1.id,
    };
    await graphQlApi.addToSlackTeam(input3, adminContext);
    const input5 = {
      filter: { id: slackTeam1.id },
      pagination: {},
    };
    const page1 = await graphQlApi.getSlackTeamsByProps(input5, adminContext);
    expect(page1.edges.length).toBe(1);
    const slackTeam2 = page1.edges[0].node;
    expect(slackTeam1.id).toBe(slackTeam2.id);
    expect(slackTeam2.userMemberConnection.totalCount).toBe(1);
    const hasCorrectMatches = slackTeam2.userMemberConnection.edges.every(
      edge => {
        return [user.id].includes(edge.node.id);
      },
    );
    expect(hasCorrectMatches).toBe(true);
    expect(slackTeam2.userMemberConnection.pageInfo.hasNextPage).toBe(false);
    expect(slackTeam2.userMemberConnection.pageInfo.hasPreviousPage).toBe(
      false,
    );
  });

  test("should be able to paginate userMemberConnection", async () => {
    const input1 = createUserInput();
    const input2 = createUserInput();
    const input3 = createSlackTeamInput();
    const user1 = await graphQlApi.createUser(input1, adminContext);
    const user2 = await graphQlApi.createUser(input2, adminContext);
    const slackTeam1 = await graphQlApi.createSlackTeam(input3, adminContext);
    const input4 = {
      userId: user1.id,
      slackTeamId: slackTeam1.id,
    };
    const input5 = {
      userId: user2.id,
      slackTeamId: slackTeam1.id,
    };
    await graphQlApi.addToSlackTeam(input4, adminContext);
    await graphQlApi.addToSlackTeam(input5, adminContext);
    const operationName = "getSlackTeamsByProps";
    const query = `
      query getSlackTeamsByProps(
        $input: GetSlackTeamsByPropsInput!,
        $userMemberConnectionInput: UserMemberConnectionInput!
      ) {
        getSlackTeamsByProps(input: $input) {
          totalCount
          edges {
            cursor
            node {
              id
              userMemberConnection(input: $userMemberConnectionInput) {
                totalCount
                edges {
                  node {
                    id
                    name
                  }
                }
                pageInfo {
                  hasNextPage
                  hasPreviousPage
                }
              }
            }
          }
        }
      }
    `;
    const variables = {
      input: { filter: { id: slackTeam1.id }, pagination: {} },
      userMemberConnectionInput: {
        filter: {},
        pagination: {
          first: 1,
          orderBy: "name",
          sortType: "ASCENDING",
        },
      },
    };
    const page1 = await graphQlApi.graphqlRequest({
      operationName,
      query,
      variables,
      context: adminContext,
    });
    expect(page1.edges.length).toBe(1);
    const slackTeam2 = page1.edges[0].node;
    expect(slackTeam2.id).toBe(slackTeam1.id);
    expect(slackTeam2.userMemberConnection.totalCount).toBe(2);
    expect(slackTeam2.userMemberConnection.edges.length).toBe(1);
    expect(slackTeam2.userMemberConnection.pageInfo.hasNextPage).toBe(true);
    expect(slackTeam2.userMemberConnection.pageInfo.hasPreviousPage).toBe(
      false,
    );
  });

  test("should be able to filter userMemberConnection", async () => {
    const input1 = createSlackTeamInput();
    const input2 = createUserInput({ name: "Adam" });
    const input3 = createUserInput({ name: "Bob" });
    const slackTeam1 = await graphQlApi.createSlackTeam(input1, adminContext);
    const user1 = await graphQlApi.createUser(input2, adminContext);
    const user2 = await graphQlApi.createUser(input3, adminContext);
    const input4 = {
      userId: user1.id,
      slackTeamId: slackTeam1.id,
    };
    const input5 = {
      userId: user2.id,
      slackTeamId: slackTeam1.id,
    };
    await graphQlApi.addToSlackTeam(input4, adminContext);
    await graphQlApi.addToSlackTeam(input5, adminContext);
    const operationName = "getSlackTeamsByProps";
    const query = `
      query getSlackTeamsByProps(
        $input: GetSlackTeamsByPropsInput!,
        $userMemberConnectionInput: UserMemberConnectionInput!
      ) {
        getSlackTeamsByProps(input: $input) {
          totalCount
          edges {
            cursor
            node {
              id
              userMemberConnection(input: $userMemberConnectionInput) {
                totalCount
                edges {
                  node {
                    id
                    name
                  }
                }
                pageInfo {
                  hasNextPage
                  hasPreviousPage
                }
              }
            }
          }
        }
      }
    `;
    const variables = {
      input: { filter: { id: slackTeam1.id }, pagination: {} },
      userMemberConnectionInput: {
        filter: { name: user1.name },
        pagination: {},
      },
    };
    const page1 = await graphQlApi.graphqlRequest({
      operationName,
      query,
      variables,
      context: adminContext,
    });
    expect(page1.edges.length).toBe(1);
    const slackTeam2 = page1.edges[0].node;
    expect(slackTeam2.id).toBe(slackTeam1.id);
    expect(slackTeam2.userMemberConnection.totalCount).toBe(1);
    expect(slackTeam2.userMemberConnection.edges.length).toBe(1);
    expect(slackTeam2.userMemberConnection.pageInfo.hasNextPage).toBe(false);
    expect(slackTeam2.userMemberConnection.pageInfo.hasPreviousPage).toBe(
      false,
    );
    const user3 = slackTeam2.userMemberConnection.edges[0].node;
    expect(user3.id).toBe(user1.id);
  });
});
