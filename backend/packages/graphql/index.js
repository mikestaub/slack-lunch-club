// @flow

import { graphql } from "graphql";

import schema from "./schema";
import allQueries from "./api";

import type { GraphQLContext } from "backend-types";
import type {
  User,
  CreateUserInput,
  CreateUserResult,
  DeleteUserInput,
  DeleteUserResult,
  UpdateUserInput,
  UpdateUserResult,
  GetCurrentUserResult,
  GetUsersByPropsInput,
  GetUsersByPropsResult,
  GetUsersRequestingMatchResult,
  NotifyUnmatchedUsersInput,
  NotifyUnmatchedUsersResult,
  MatchUsersInput,
  MatchUsersResult,
  AddToSlackTeamInput,
  AddToSlackTeamResult,
  SlackTeam,
  CreateSlackTeamInput,
  CreateSlackTeamResult,
  UpdateSlackTeamInput,
  UpdateSlackTeamResult,
  DeleteSlackTeamInput,
  DeleteSlackTeamResult,
  GetSlackTeamsByPropsInput,
  GetSlackTeamsByPropsResult,
} from "graphql-types";

class GraphQLApi {
  context: GraphQLContext;

  constructor(context: GraphQLContext) {
    this.context = context;
  }

  getSchema(): Object {
    return schema;
  }

  getContext(): GraphQLContext {
    return this.context;
  }

  getAllQueries(): Object {
    return allQueries;
  }

  async getOrCreateUser(
    input: CreateUserInput,
    context?: Object,
  ): Promise<User> {
    const input1 = {
      filter: { email: input.email },
    };
    const { edges } = await this.getUsersByProps(input1, context);
    return edges.length ? edges[0].node : this.createUser(input, context);
  }

  async getOrCreateSlackTeam(
    input: CreateSlackTeamInput,
    context?: Object,
  ): Promise<SlackTeam> {
    const input1 = {
      filter: { slackApiId: input.slackApiId },
    };
    const { edges } = await this.getSlackTeamsByProps(input1, context);
    return edges.length ? edges[0].node : this.createSlackTeam(input, context);
  }

  async getCurrentUser(context?: Object): Promise<User> {
    const operationName = "getCurrentUser";
    const variables = {};
    const result: GetCurrentUserResult = await this.graphqlRequest({
      operationName,
      variables,
      context,
    });
    return result.user;
  }

  async getUsersByProps(
    input: GetUsersByPropsInput,
    context?: Object,
  ): Promise<GetUsersByPropsResult> {
    const operationName = "getUsersByProps";
    const variables = { input };
    return this.graphqlRequest({ operationName, variables, context });
  }

  async getUsersRequestingMatch(
    context?: Object,
  ): Promise<GetUsersRequestingMatchResult> {
    const operationName = "getUsersRequestingMatch";
    const variables = {};
    return this.graphqlRequest({ operationName, variables, context });
  }

  async updateUser(input: UpdateUserInput, context?: Object): Promise<User> {
    const operationName = "updateUser";
    const variables = { input };
    const result: UpdateUserResult = await this.graphqlRequest({
      operationName,
      variables,
      context,
    });
    return result.user;
  }

  async deleteUser(input: DeleteUserInput, context?: Object): Promise<boolean> {
    const operationName = "deleteUser";
    const variables = { input };
    const result: DeleteUserResult = await this.graphqlRequest({
      operationName,
      variables,
      context,
    });
    return result.success;
  }

  async createUser(input: CreateUserInput, context?: Object): Promise<User> {
    const operationName = "createUser";
    const variables = { input };
    const result: CreateUserResult = await this.graphqlRequest({
      operationName,
      variables,
      context,
    });
    return result.user;
  }

  async notifyUnmatchedUsers(
    input: NotifyUnmatchedUsersInput,
    context?: Object,
  ): Promise<boolean> {
    const operationName = "notifyUnmatchedUsers";
    const variables = { input };
    const result: NotifyUnmatchedUsersResult = await this.graphqlRequest({
      operationName,
      variables,
      context,
    });
    return result.success;
  }

  async matchUsers(input: MatchUsersInput, context?: Object): Promise<boolean> {
    const operationName = "matchUsers";
    const variables = { input };
    const result: MatchUsersResult = await this.graphqlRequest({
      operationName,
      variables,
      context,
    });
    return result.success;
  }

  async addToSlackTeam(
    input: AddToSlackTeamInput,
    context?: Object,
  ): Promise<boolean> {
    const operationName = "addToSlackTeam";
    const variables = { input };
    const result: AddToSlackTeamResult = await this.graphqlRequest({
      operationName,
      variables,
      context,
    });
    return result.success;
  }

  async createSlackTeam(
    input: CreateSlackTeamInput,
    context?: Object,
  ): Promise<SlackTeam> {
    const operationName = "createSlackTeam";
    const variables = { input };
    const result: CreateSlackTeamResult = await this.graphqlRequest({
      operationName,
      variables,
      context,
    });
    return result.slackTeam;
  }

  async updateSlackTeam(
    input: UpdateSlackTeamInput,
    context?: Object,
  ): Promise<SlackTeam> {
    const operationName = "updateSlackTeam";
    const variables = { input };
    const result: UpdateSlackTeamResult = await this.graphqlRequest({
      operationName,
      variables,
      context,
    });
    return result.slackTeam;
  }

  async getSlackTeamsByProps(
    input: GetSlackTeamsByPropsInput,
    context?: Object,
  ): Promise<GetSlackTeamsByPropsResult> {
    const operationName = "getSlackTeamsByProps";
    const variables = { input };
    return this.graphqlRequest({ operationName, variables, context });
  }

  async deleteSlackTeam(
    input: DeleteSlackTeamInput,
    context?: Object,
  ): Promise<boolean> {
    const operationName = "deleteSlackTeam";
    const variables = { input };
    const result: DeleteSlackTeamResult = await this.graphqlRequest({
      operationName,
      variables,
      context,
    });
    return result.success;
  }

  async graphqlRequest({
    operationName,
    variables,
    query,
    context,
  }: {
    operationName: string,
    variables: Object,
    query?: string,
    context?: Object,
  }): Promise<Object> {
    const parent = {};
    query = query || allQueries[operationName];
    context = context ? { ...this.context, ...context } : this.context;
    const res = await graphql(schema, query, parent, context, variables);
    if (res.errors && res.errors.length) {
      throw res.errors[0];
    }
    return res.data[operationName];
  }
}

export default GraphQLApi;
