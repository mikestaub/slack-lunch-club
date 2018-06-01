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

describe("user type", () => {
  test("should return correct matchedConnection", async () => {
    const params = {
      matchEveryWeek: true,
      availableDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
      },
      location: {
        lat: 10,
        lng: 10,
        key: "TEST",
        formattedAddress: "TEST",
      },
    };
    const input1 = createUserInput(params);
    const input2 = createUserInput(params);
    const input3 = createUserInput(params);
    const user1 = await graphQlApi.createUser(input1, adminContext);
    const user2 = await graphQlApi.createUser(input2, adminContext);
    const user3 = await graphQlApi.createUser(input3, adminContext);
    const input4 = {
      matches: [[user1.id, user2.id], [user1.id, user3.id]],
    };
    await graphQlApi.matchUsers(input4, adminContext);
    const input5 = {
      filter: {
        id: user1.id,
      },
      pagination: {},
    };
    const page1 = await graphQlApi.getUsersByProps(input5, adminContext);
    expect(page1.edges.length).toBe(1);
    const user = page1.edges[0].node;
    expect(user.id).toBe(user1.id);
    expect(user.matchedConnection.totalCount).toBe(2);
    const hasCorrectMatches = user.matchedConnection.edges.every(edge => {
      return [user2.id, user3.id].includes(edge.node.id);
    });
    expect(hasCorrectMatches).toBe(true);
    expect(user.matchedConnection.pageInfo.hasNextPage).toBe(false);
    expect(user.matchedConnection.pageInfo.hasPreviousPage).toBe(false);
  });

  test("should return correct slackTeamMemberConnection", async () => {
    const input1 = createUserInput();
    const input2 = createSlackTeamInput();
    const input3 = createSlackTeamInput();
    const user1 = await graphQlApi.createUser(input1, adminContext);
    const slackTeam1 = await graphQlApi.createSlackTeam(input2, adminContext);
    const slackTeam2 = await graphQlApi.createSlackTeam(input3, adminContext);
    const input4 = {
      userId: user1.id,
      slackTeamId: slackTeam1.id,
    };
    const input5 = {
      userId: user1.id,
      slackTeamId: slackTeam2.id,
    };
    await graphQlApi.addToSlackTeam(input4, adminContext);
    await graphQlApi.addToSlackTeam(input5, adminContext);
    const input6 = {
      filter: {
        id: user1.id,
      },
      pagination: {},
    };
    const page1 = await graphQlApi.getUsersByProps(input6, adminContext);
    expect(page1.edges.length).toBe(1);
    const user2 = page1.edges[0].node;
    expect(user2.id).toBe(user1.id);
    expect(user2.slackTeamMemberConnection.totalCount).toBe(2);
    const hasCorrectMatches = user1.slackTeamMemberConnection.edges.every(
      edge => {
        return [slackTeam1.id, slackTeam2.id].includes(edge.node.id);
      },
    );
    expect(hasCorrectMatches).toBe(true);
    expect(user2.slackTeamMemberConnection.pageInfo.hasNextPage).toBe(false);
    expect(user2.slackTeamMemberConnection.pageInfo.hasPreviousPage).toBe(
      false,
    );
  });

  test("should be able to paginate matchedConnection", async () => {
    const params = {
      matchEveryWeek: true,
      availableDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
      },
      location: {
        lat: 10,
        lng: 10,
        key: "TEST",
        formattedAddress: "TEST",
      },
    };
    const input1 = createUserInput(params);
    const input2 = createUserInput({
      ...params,
      name: "Adam",
    });
    const input3 = createUserInput({
      ...params,
      name: "Bob",
    });
    const user1 = await graphQlApi.createUser(input1, adminContext);
    const user2 = await graphQlApi.createUser(input2, adminContext);
    const user3 = await graphQlApi.createUser(input3, adminContext);
    const input4 = {
      matches: [[user1.id, user2.id], [user1.id, user3.id]],
    };
    await graphQlApi.matchUsers(input4, adminContext);
    const operationName = "getUsersByProps";
    const query = `
      query getUsersByProps(
        $input: GetUsersByPropsInput!,
        $matchedConnectionInput: MatchedConnectionInput!
      ) {
        getUsersByProps(input: $input) {
          totalCount
          edges {
            cursor
            node {
              id
              matchedConnection(input: $matchedConnectionInput) {
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
      input: {
        filter: {
          id: user1.id,
        },
        pagination: {},
      },
      matchedConnectionInput: {
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
    const user = page1.edges[0].node;
    expect(user.id).toBe(user1.id);
    expect(user.matchedConnection.totalCount).toBe(2);
    expect(user.matchedConnection.edges.length).toBe(1);
    expect(user.matchedConnection.pageInfo.hasNextPage).toBe(true);
    expect(user.matchedConnection.pageInfo.hasPreviousPage).toBe(false);
    const matchedUser = user.matchedConnection.edges[0].node;
    expect(matchedUser.id).toBe(user2.id);
  });

  test("should be able to filter matchedConnection", async () => {
    const params = {
      matchEveryWeek: true,
      availableDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
      },
      location: {
        lat: 10,
        lng: 10,
        key: "TEST",
        formattedAddress: "TEST",
      },
    };
    const input1 = createUserInput(params);
    const input2 = createUserInput({
      ...params,
      name: "Adam",
    });
    const input3 = createUserInput({
      ...params,
      name: "Bob",
    });
    const user1 = await graphQlApi.createUser(input1, adminContext);
    const user2 = await graphQlApi.createUser(input2, adminContext);
    const user3 = await graphQlApi.createUser(input3, adminContext);
    const input4 = {
      matches: [[user1.id, user2.id], [user1.id, user3.id]],
    };
    await graphQlApi.matchUsers(input4, adminContext);
    const operationName = "getUsersByProps";
    const query = `
      query getUsersByProps(
        $input: GetUsersByPropsInput!,
        $matchedConnectionInput: MatchedConnectionInput!
      ) {
        getUsersByProps(input: $input) {
          totalCount
          edges {
            cursor
            node {
              id
              matchedConnection(input: $matchedConnectionInput) {
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
      input: {
        filter: {
          id: user1.id,
        },
        pagination: {},
      },
      matchedConnectionInput: {
        filter: {
          name: user3.name,
        },
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
    const user = page1.edges[0].node;
    expect(user.id).toBe(user1.id);
    expect(user.matchedConnection.totalCount).toBe(1);
    expect(user.matchedConnection.edges.length).toBe(1);
    expect(user.matchedConnection.pageInfo.hasNextPage).toBe(false);
    expect(user.matchedConnection.pageInfo.hasPreviousPage).toBe(false);
    const matchedUser = user.matchedConnection.edges[0].node;
    expect(matchedUser.id).toBe(user3.id);
  });
});
