// @flow

import { hasAuthToken, isAdmin } from "../../../commonAuthorizers";
import { authorize } from "../../../utils";

import type { DeleteSlackTeamResult } from "graphql-types";
import type { GraphQLContext } from "backend-types";

async function deleteSlackTeam(
  parent: Object,
  args: Object,
  context: GraphQLContext,
): Promise<DeleteSlackTeamResult> {
  const { db, logger } = context;
  const { id } = args.input;
  const needsOne = [hasAuthToken, isAdmin];
  await authorize({ needsOne, parent, args, context });
  await remove({ db, logger, id });
  return { success: true };
}

async function remove({ db, id }: { db: Object, id: string }): Promise<any> {
  const collection = db.graphConfig.topology.vertices.SLACK_TEAMS;
  return db.deleteVertex(collection, id);
}

export default deleteSlackTeam;
