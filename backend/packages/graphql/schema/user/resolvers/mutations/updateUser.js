// @flow

import {
  hasAuthToken,
  isAdmin,
  isCurrentUser,
} from "../../../commonAuthorizers";
import { adminFields } from "../authorize";
import { authorize } from "../../../utils";
import UserValidator from "../validators";

import type { User, UpdateUserInput, UpdateUserResult } from "graphql-types";
import type { GraphQLContext } from "backend-types";

async function updateUser(
  parent: Object,
  args: Object,
  context: GraphQLContext,
): Promise<UpdateUserResult> {
  const { db } = context;
  const { input } = args;
  const needsOne = [isAdmin, isCurrentUser, hasAuthToken];
  const needsAll = [adminFields];
  await authorize({ parent, args, context, needsOne, needsAll });
  const user = await update(db, input);
  return { user };
}

async function update(db: Object, input: Object): Promise<User> {
  const collection = db.graphConfig.topology.vertices.USERS;
  const props = validateInput(input);
  const { id } = input;
  return db.updateVertex(collection, id, props);
}

function validateInput(input: Object): UpdateUserInput {
  return Object.assign(UserValidator(), input);
}

export default updateUser;
