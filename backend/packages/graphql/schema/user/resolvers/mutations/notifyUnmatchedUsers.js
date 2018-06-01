// @flow

import handlebars from "handlebars";

import matchFailureHtml from "../../email/matchFailure.html";

import Config from "../../../../../../config";
import { hasAuthToken, isAdmin } from "../../../commonAuthorizers";
import { authorize } from "../../../utils";

import { emailAdminsPartialFailures, updateLastMatchEmailSent } from "./utils";

import type { IMailer, GraphQLContext } from "backend-types";
import type { User, NotifyUnmatchedUsersResult } from "graphql-types";

async function notifyUnmatchedUsers(
  parent: Object,
  args: Object,
  context: GraphQLContext,
): Promise<NotifyUnmatchedUsersResult> {
  const { db, mailer, config } = context;
  const { userIds } = args.input;
  const needsOne = [hasAuthToken, isAdmin];
  await authorize({ needsOne, parent, args, context });
  const promises = createPromises({ db, mailer, config, userIds });
  const success = await emailAdminsPartialFailures({
    config,
    db,
    mailer,
    promises,
  });
  return { success };
}

function createPromises({
  db,
  mailer,
  config,
  userIds,
}: {
  db: Object,
  mailer: IMailer,
  config: Config,
  userIds: Array<string>,
}): Array<Promise<void>> {
  const from = config.email.noreplyAddress;
  const collection = db.graphConfig.topology.vertices.USERS;
  return userIds.map(async (id: string) => {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await db.getVertex(collection, { id });
        await sendUnmatchedEmail({ mailer, from, user });
        await resetAvailableDays(db, user);
        await updateLastMatchEmailSent(db, [user]);
        resolve();
      } catch (err) {
        reject(
          new Error(
            `Failed to notify unmatched user with id ${id}, ${err.stack}`,
          ),
        );
      }
    });
  });
}

async function sendUnmatchedEmail({
  mailer,
  from,
  user,
}: {
  mailer: IMailer,
  from: string,
  user: User,
}): Promise<Object> {
  const html = handlebars.compile(matchFailureHtml)(user);
  const message = {
    subject: "Sorry, no Slack Lunch Club this week. :(",
    to: user.email,
    from,
    html,
  };
  return mailer.sendMail(message);
}

async function resetAvailableDays(db: Object, user: User): Promise<any> {
  if (user.matchEveryWeek) {
    return;
  }
  const args = {
    availableDays: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
    },
  };
  return db.updateVertex(db.graphConfig.topology.vertices.USERS, user.id, args);
}

export default notifyUnmatchedUsers;
