// @flow

import type {
  UserMatchedConnection,
  SlackTeamMemberConnection,
} from "graphql-types";
import type { GraphQLContext } from "backend-types";

import { getEdgesByPropsPaginated } from "../../../pagination/arangodb";

async function matchedConnection(
  parent: Object,
  args: Object,
  context: GraphQLContext,
): Promise<UserMatchedConnection> {
  const { db } = context;
  const { filter, pagination } = args.input;
  const startVertex = parent;
  return getEdgesByPropsPaginated({
    db,
    vertexCollection: db.graphConfig.topology.vertices.USERS,
    edgeCollection: db.graphConfig.topology.edges.MATCHED,
    direction: "ANY",
    startVertex,
    props: filter,
    pagination,
  });
}

async function slackTeamMemberConnection(
  parent: Object,
  args: Object,
  context: GraphQLContext,
): Promise<SlackTeamMemberConnection> {
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

export { matchedConnection, slackTeamMemberConnection };
