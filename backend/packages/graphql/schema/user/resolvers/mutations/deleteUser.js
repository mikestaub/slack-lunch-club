// @flow

import {
  isAdmin,
  hasAuthToken,
  isCurrentUser,
} from "../../../commonAuthorizers";
import { authorize } from "../../../utils";

import type { DeleteUserResult } from "graphql-types";
import type { GraphQLContext } from "backend-types";

async function deleteUser(
  parent: Object,
  args: Object,
  context: GraphQLContext,
): Promise<DeleteUserResult> {
  const { db, logger } = context;
  const { id } = args.input;
  const needsOne = [hasAuthToken, isAdmin, isCurrentUser];
  await authorize({ needsOne, parent, args, context });
  await remove({ db, logger, id });
  return { success: true };
}

async function remove({ db, id }: { db: Object, id: string }): Promise<any> {
  const collection = db.graphConfig.topology.vertices.USERS;
  return db.deleteVertex(collection, id);
}

export default deleteUser;
