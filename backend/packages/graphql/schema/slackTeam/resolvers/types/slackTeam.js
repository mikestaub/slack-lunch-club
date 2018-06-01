// @flow

import type { UserMemberConnection } from "graphql-types";
import type { GraphQLContext } from "backend-types";

import { getEdgesByPropsPaginated } from "../../../pagination/arangodb";

async function userMemberConnection(
  parent: Object,
  args: Object,
  context: GraphQLContext,
): Promise<UserMemberConnection> {
  const { db } = context;
  const { filter, pagination } = args.input;
  const startVertex = parent;
  return getEdgesByPropsPaginated({
    db,
    vertexCollection: db.graphConfig.topology.vertices.USERS,
    edgeCollection: db.graphConfig.topology.edges.MEMBER,
    direction: "ANY",
    startVertex,
    props: filter,
    pagination,
  });
}

export { userMemberConnection };
