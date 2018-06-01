// @flow

import { UserError } from "graphql-errors";

import type { GraphQLAuthorizerArgs } from "backend-types";

function isAdmin({ context }: GraphQLAuthorizerArgs): GraphQLAuthorizerArgs {
  if (!context.user || !context.user.role || context.user.role !== "ADMIN") {
    throw new UserError("User does not have admin role.");
  }
  return arguments;
}

function isCurrentUser({
  args,
  context,
}: GraphQLAuthorizerArgs): GraphQLAuthorizerArgs {
  if (
    !context.user ||
    (context.user.id !== args.input.id && context.user.id !== args.input.userId)
  ) {
    throw new UserError("User ID does not match the logged in user.");
  }
  return arguments;
}

function hasAuthToken({
  context,
}: GraphQLAuthorizerArgs): GraphQLAuthorizerArgs {
  const { config } = context;
  if (context.authTokenSecret !== config.authTokenSecret) {
    throw new UserError("Auth token secret not found on context.");
  }
  return arguments;
}

export { isAdmin, isCurrentUser, hasAuthToken };
