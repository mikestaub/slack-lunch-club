// @flow

import { hasAuthToken, isAdmin } from "../../../commonAuthorizers";
import { authorize } from "../../../utils";
import SlackTeamValidator from "../validators";

import type {
  SlackTeam,
  UpdateSlackTeamInput,
  UpdateSlackTeamResult,
} from "graphql-types";
import type { GraphQLContext } from "backend-types";

async function updateSlackTeam(
  parent: Object,
  args: Object,
  context: GraphQLContext,
): Promise<UpdateSlackTeamResult> {
  const { db } = context;
  const { input } = args;
  const needsOne = [isAdmin, hasAuthToken];
  await authorize({ parent, args, context, needsOne });
  const slackTeam = await update(db, input);
  return { slackTeam };
}

async function update(db: Object, input: Object): Promise<SlackTeam> {
  const collection = db.graphConfig.topology.vertices.SLACK_TEAMS;
  const props = validateInput(input);
  const { id } = input;
  return db.updateVertex(collection, id, props);
}

function validateInput(input: Object): UpdateSlackTeamInput {
  return Object.assign(SlackTeamValidator(), input);
}

export default updateSlackTeam;
