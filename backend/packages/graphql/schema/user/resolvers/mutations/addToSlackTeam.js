// @flow

import {
  isAdmin,
  hasAuthToken,
  isCurrentUser,
} from "../../../commonAuthorizers";
import { authorize } from "../../../utils";

import type { IGraphDatabase } from "../../../../../db";
import type { User, SlackTeam, AddToSlackTeamResult } from "graphql-types";
import type { GraphQLContext } from "backend-types";

async function addToSlackTeam(
  parent: Object,
  args: Object,
  context: GraphQLContext,
): Promise<AddToSlackTeamResult> {
  const { db } = context;
  const { userId, slackTeamId } = args.input;
  const needsOne = [hasAuthToken, isAdmin, isCurrentUser];
  await authorize({
    needsOne,
    parent,
    args,
    context,
  });
  const user = await getUser(db, userId);
  const slackTeam = await getSlackTeam(db, slackTeamId);
  const edge = {
    collection: db.graphConfig.topology.edges.MEMBER,
    from: user,
    to: slackTeam,
  };
  const isMember = await db.edgeExists(edge);
  if (!isMember) {
    await db.createEdge(edge);
  }
  return { success: true };
}

async function getUser(db: IGraphDatabase, userId: string): Promise<User> {
  const props = { id: userId };
  const user = await db.getVertex(
    db.graphConfig.topology.vertices.USERS,
    props,
  );
  if (!user) {
    throw new Error(`No user found with id: ${userId}`);
  }
  return user;
}

async function getSlackTeam(
  db: IGraphDatabase,
  slackTeamId: string,
): Promise<SlackTeam> {
  const props = { id: slackTeamId };
  const slackTeam = await db.getVertex(
    db.graphConfig.topology.vertices.SLACK_TEAMS,
    props,
  );
  if (!slackTeam) {
    throw new Error(`No slackTeam found with id: ${slackTeamId}`);
  }
  return slackTeam;
}

export default addToSlackTeam;
