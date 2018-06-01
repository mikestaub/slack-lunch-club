// @flow

import { UserError } from "graphql-errors";

import { isAdmin, hasAuthToken } from "../../commonAuthorizers";

import type { GraphQLAuthorizerArgs } from "backend-types";

function adminFields({
  args,
  context,
}: GraphQLAuthorizerArgs): GraphQLAuthorizerArgs {
  try {
    return isAdmin(arguments[0]);
  } catch (err) {
    try {
      return hasAuthToken(arguments[0]);
    } catch (err) {
      // TODO: these fields should be defined in the schema via custom directive
      const adminFields = ["role"];
      const { user } = context;
      if (!user) {
        throw new Error("User not found on context");
      }
      for (const field in args.input) {
        if (adminFields.includes(field) && user[field] !== args.input[field]) {
          throw new UserError(
            `Must have admin role to modify field '${field}'`,
          );
        }
      }
    }
  }
  return arguments;
}

async function emailNotInUse({
  args,
  context,
}: GraphQLAuthorizerArgs): Promise<GraphQLAuthorizerArgs> {
  const { db } = context;
  const { email } = args.input;
  const props = { email };
  const foundUsers = await db.getVertices(
    db.graphConfig.topology.vertices.USERS,
    props,
  );
  if (foundUsers.length) {
    throw new UserError(`User already exists with email: ${email}`);
  }
  return arguments;
}

export { adminFields, emailNotInUse };
