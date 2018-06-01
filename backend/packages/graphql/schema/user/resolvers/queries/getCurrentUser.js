// @flow

import { UserError } from "graphql-errors";

import type { GraphQLContext } from "backend-types";
import type { GetCurrentUserResult } from "graphql-types";

async function getCurrentUser(
  parent: Object,
  args: Object,
  context: GraphQLContext,
): Promise<GetCurrentUserResult> {
  const { user } = context;
  const { db } = context;
  if (!user) {
    throw new UserError("Failed to find user on context.");
  }
  const { id } = user;
  const props = { id };
  const collection = db.graphConfig.topology.vertices.USERS;
  const foundUser = await db.getVertex(collection, props);
  if (!foundUser) {
    throw new UserError(`No user found with id: ${id}`);
  }
  return {
    user: foundUser,
  };
}

export default getCurrentUser;
