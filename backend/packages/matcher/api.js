// @flow

import GraphQLApi from "../graphql";

import type {
  GetUsersRequestingMatchResult,
  MatchUsersInput,
  NotifyUnmatchedUsersInput,
} from "graphql-types";

class MatchApiAdapter {
  graphqlApi: GraphQLApi;
  authTokenSecret: string;

  constructor(graphqlApi: GraphQLApi, authTokenSecret: string): void {
    this.graphqlApi = graphqlApi;
    this.authTokenSecret = authTokenSecret;
  }

  async getUsersRequestingMatch(): Promise<Object> {
    const adminContext = { authTokenSecret: this.authTokenSecret };
    const result = await this.graphqlApi.getUsersRequestingMatch(adminContext);
    return createMap(result);
  }

  async matchUsers(input: MatchUsersInput): Promise<boolean> {
    const adminContext = { authTokenSecret: this.authTokenSecret };
    return this.graphqlApi.matchUsers(input, adminContext);
  }

  async notifyUnmatchedUsers(
    input: NotifyUnmatchedUsersInput,
  ): Promise<boolean> {
    const adminContext = { authTokenSecret: this.authTokenSecret };
    return this.graphqlApi.notifyUnmatchedUsers(input, adminContext);
  }

  async getAdminEmails(): Promise<Array<string>> {
    const input = { filter: { role: "ADMIN" }, pagination: { first: 100 } };
    const adminContext = { authTokenSecret: this.authTokenSecret };
    const result = await this.graphqlApi.getUsersByProps(input, adminContext);
    const emails = result.edges.map(edge => edge.node.email);
    return emails;
  }
}

// TODO: We have to do this because we cannot return a map from graphql
// https://github.com/facebook/graphql/issues/101
function createMap(result: GetUsersRequestingMatchResult): Object {
  const { possibleMatchesForUsers } = result;
  return possibleMatchesForUsers.reduce((acc, next) => {
    const { userId, possibleMatches } = next;
    acc[userId] = possibleMatches;
    return acc;
  }, {});
}

export default MatchApiAdapter;
