// @flow

import { emailNotInUse, adminFields } from "../authorize";
import { isAdmin, hasAuthToken } from "../../../commonAuthorizers";

import UserValidator from "../validators";
import { authorize } from "../../../utils";

import type { CreateUserInput, CreateUserResult, User } from "graphql-types";
import type { GraphQLContext } from "backend-types";

async function createUser(
  parent: Object,
  args: Object,
  context: GraphQLContext,
): Promise<CreateUserResult> {
  const { db } = context;
  const { input } = args;
  const needsOne = [isAdmin, hasAuthToken];
  const needsAll = [emailNotInUse, adminFields];
  await authorize({ needsOne, needsAll, parent, args, context });
  const user = await create(db, input);
  return { user };
}

async function create(db: Object, input: Object): Promise<User> {
  const user = validateInput(input);
  const collection = db.graphConfig.topology.vertices.USERS;
  return db.createVertex(collection, user);
}

function validateInput(input: Object): CreateUserInput {
  return Object.assign(UserValidator(), input, { slackTeamId: undefined });
}

export default createUser;
