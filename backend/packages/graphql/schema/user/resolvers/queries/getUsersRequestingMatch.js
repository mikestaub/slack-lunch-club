// @flow

import { authorize } from "../../../utils";
import { isAdmin, hasAuthToken } from "../../../commonAuthorizers";

import getUsersRequestingMatchAQL from "./getUsersRequestingMatch.aql";

import type { GraphQLContext } from "backend-types";
import type {
  GetUsersRequestingMatchResult,
  PossibleMatchesForUser,
} from "graphql-types";

async function getUsersRequestingMatch(
  parent: Object,
  args: Object,
  context: GraphQLContext,
): Promise<GetUsersRequestingMatchResult> {
  const { config, db } = context;
  const { matchPeriodInDays } = config.email;
  const needsOne = [isAdmin, hasAuthToken];
  await authorize({
    parent,
    args,
    context,
    needsOne,
  });
  const possibleMatchesForUsers = await getPossibleMatchesForUsers(
    db,
    matchPeriodInDays,
  );
  return {
    possibleMatchesForUsers,
  };
}

async function getPossibleMatchesForUsers(
  db: Object,
  matchPeriodInDays: Number,
): Promise<Array<PossibleMatchesForUser>> {
  const MAX_DISTANCE = 1000; // 1km = about 0.5 miles
  const query = getUsersRequestingMatchAQL;
  const cursor = await db.query({
    query,
    bindVars: {
      matchPeriodInDays,
      MAX_DISTANCE,
    },
  });
  const [result] = await cursor.all();
  // TODO: better flow support for Object.entries
  // https://github.com/facebook/flow/issues/2174
  return Object.entries(result).map(
    ([userId, possibleMatches]: [string, any]) => {
      return { userId, possibleMatches };
    },
  );
}

export default getUsersRequestingMatch;
