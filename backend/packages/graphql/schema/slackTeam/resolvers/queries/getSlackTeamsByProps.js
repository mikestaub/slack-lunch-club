// @flow

import { authorize } from "../../../utils";
import { isAdmin, hasAuthToken } from "../../../commonAuthorizers";
import { getVerticesByPropsPaginated } from "../../../pagination/arangodb";

import type { GraphQLContext } from "backend-types";
import type { GetSlackTeamsByPropsResult } from "graphql-types";

async function getSlackTeamsByProps(
  parent: Object,
  args: Object,
  context: GraphQLContext,
): Promise<GetSlackTeamsByPropsResult> {
  const { db } = context;
  const { filter, pagination } = args.input;
  const needsOne = [isAdmin, hasAuthToken];
  await authorize({
    parent,
    args,
    context,
    needsOne,
  });
  return getVerticesByPropsPaginated({
    db,
    collection: db.graphConfig.topology.vertices.SLACK_TEAMS,
    props: filter,
    pagination,
  });
}

export default getSlackTeamsByProps;
