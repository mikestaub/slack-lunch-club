// @flow

import { UserError } from "graphql-errors";

import type { GraphQLAuthorizerArgs } from "backend-types";

async function slackTeamDoesNotExist({
  args,
  context,
}: GraphQLAuthorizerArgs): Promise<GraphQLAuthorizerArgs> {
  const { db } = context;
  const { slackApiId } = args.input;
  const props = { slackApiId };
  const foundSlackTeams = await db.getVertices(
    db.graphConfig.topology.vertices.SLACK_TEAMS,
    props,
  );
  if (foundSlackTeams.length) {
    throw new UserError(`Slack team already exists with id: ${slackApiId}`);
  }
  return arguments;
}

export { slackTeamDoesNotExist };
