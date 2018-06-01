// @flow

import { slackTeamDoesNotExist } from "../authorize";
import SlackTeamValidator from "../validators";
import { authorize } from "../../../utils";
import { isAdmin, hasAuthToken } from "../../../commonAuthorizers";

import type {
  CreateSlackTeamInput,
  CreateSlackTeamResult,
  SlackTeam,
} from "graphql-types";
import type { GraphQLContext } from "backend-types";

async function createSlackTeam(
  parent: Object,
  args: Object,
  context: GraphQLContext,
): Promise<CreateSlackTeamResult> {
  const { db } = context;
  const { input } = args;
  const needsOne = [isAdmin, hasAuthToken];
  const needsAll = [slackTeamDoesNotExist];
  await authorize({ needsOne, needsAll, parent, args, context });
  const slackTeam = await create(db, input);
  return { slackTeam };
}

async function create(db: Object, input: Object): Promise<SlackTeam> {
  const slackTeam = validateInput(input);
  const collection = db.graphConfig.topology.vertices.SLACK_TEAMS;
  return db.createVertex(collection, slackTeam);
}

function validateInput(input: Object): CreateSlackTeamInput {
  return Object.assign(SlackTeamValidator(), input);
}

export default createSlackTeam;
