// @flow

import handlebars from "handlebars";
import Distance from "geo-distance";
import { intersectionBy } from "lodash";

import Config from "../../../../../../config";
import { authorize } from "../../../utils";
import { hasAuthToken, isAdmin } from "../../../commonAuthorizers";

import matchSuccessHtml from "../../email/matchSuccess.html";

import matchUsersTransactionFunc from "./matchUsers.transaction";
import { emailAdminsPartialFailures, updateLastMatchEmailSent } from "./utils";

import type { User, MatchUsersResult } from "graphql-types";
import type { GraphQLContext, IMailer, EmailMessage } from "backend-types";

// Matches are now assumed to be between 2 users, in the future we could
// generalize this to any number
async function matchUsers(
  parent: Object,
  args: Object,
  context: GraphQLContext,
): Promise<MatchUsersResult> {
  const { db, mailer, config } = context;
  const { matches } = args.input;
  const needsOne = [hasAuthToken, isAdmin];

  await authorize({
    needsOne,
    parent,
    args,
    context,
  });

  const promises = createPromises({
    db,
    mailer,
    config,
    matches,
  });

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
  matches,
}: {
  db: Object,
  mailer: IMailer,
  config: Config,
  matches: Array<Array<string>>,
}): Array<Promise<void>> {
  const from = config.email.noreplyAddress;
  return matches.map(async (match: Array<string>) => {
    return new Promise(async (resolve, reject) => {
      try {
        const [user1, user2] = await getUsersByIds(db, match);
        await matchUsersTransaction({ db, user1, user2 });
        await sendMatchedEmail({
          db,
          mailer,
          from,
          user1,
          user2,
        });
        resolve();
      } catch (err) {
        reject(
          new Error(
            `Failed to match users with ids ${match.toString()}, ${err.stack}`,
          ),
        );
      }
    });
  });
}

async function sendMatchedEmail({
  db,
  mailer,
  from,
  user1,
  user2,
}: {
  db: Object,
  mailer: IMailer,
  from: string,
  user1: User,
  user2: User,
}): Promise<void> {
  const user1SlackTeams = await db.followEdge({
    collection: "member",
    from: user1,
  });

  const user2SlackTeams = await db.followEdge({
    collection: "member",
    from: user2,
  });

  const [commonTeam] = intersectionBy(
    user1SlackTeams,
    user2SlackTeams,
    "slackApiId",
  );

  const teamName = commonTeam ? commonTeam.name : "None";

  const params = {
    user1: {
      teamName,
      availableDaysStr: genAvailableDaysString(user1.availableDays),
      ...user1,
    },
    user2: {
      teamName,
      availableDaysStr: genAvailableDaysString(user2.availableDays),
      ...user2,
    },
  };
  const html = handlebars.compile(matchSuccessHtml)(params);
  const to = [user1.email, user2.email];
  const message: EmailMessage = {
    subject: "Your Slack Lunch Club match is here!",
    to,
    from,
    html,
  };
  await mailer.sendMail(message);
  try {
    await updateLastMatchEmailSent(db, [user1, user2]);
  } catch (err) {
    throw new Error(`Match email sent but user not updated: ${err}`);
  }
}

function genAvailableDaysString(availableDays: ?Object): string {
  const shortNames = {
    monday: "Mon",
    tuesday: "Tues",
    wednesday: "Wed",
    thursday: "Thurs",
    friday: "Fri",
  };
  const days = availableDays || {};
  return Object.keys(days)
    .filter(day => days[day])
    .map(day => shortNames[day])
    .join(", ")
    .trim();
}

async function getUsersByIds(
  db: Object,
  ids: Array<string>,
): Promise<Array<User>> {
  const collection = db.graphConfig.topology.vertices.USERS;
  return Promise.all(ids.map(id => db.getVertex(collection, { id })));
}

async function matchUsersTransaction({
  db,
  user1,
  user2,
}: {
  db: Object,
  user1: User,
  user2: User,
}): Promise<void> {
  const { graphName } = db.graphConfig;
  const vertexCollection = db.graphConfig.topology.vertices.USERS;
  const edgeCollection = db.graphConfig.topology.edges.MATCHED;
  await validateMatch({ db, user1, user2, edgeCollection });
  const action = matchUsersTransactionFunc.toString();
  const edge = db.createDefaultDocumentProps();
  const args = {
    user1,
    user2,
    edge,
    graphName,
  };
  return db.transaction(
    {
      write: [vertexCollection, edgeCollection],
    },
    action,
    args,
  );
}

async function validateMatch({
  db,
  user1,
  user2,
  edgeCollection,
}: {
  db: Object,
  user1: User,
  user2: User,
  edgeCollection: string,
}): Promise<void> {
  if (!user1 || !user2) {
    throw new Error("Users cannot be matched, invalid users.");
  }
  if (user1.email === user2.email) {
    throw new Error("Cannot match user with themselves.");
  }
  if (!user1.availableDays || !user2.availableDays) {
    throw new Error("Users cannot be matched, user availability not set.");
  }
  if (!user1.location || !user2.location) {
    throw new Error("Users cannot be matched, user location not set.");
  }
  const loc1 = {
    lon: user1.location.lng,
    lat: user1.location.lat,
  };
  const loc2 = {
    lon: user2.location.lng,
    lat: user2.location.lat,
  };
  const distance = Distance.between(loc1, loc2);
  if (distance > Distance("1 km")) {
    throw new Error("Users are more than 1 km apart.");
  }
  if (
    await db.edgeExists({ collection: edgeCollection, from: user1, to: user2 })
  ) {
    throw new Error("Users have already been matched.");
  }
  for (const key in user1.availableDays) {
    const day1 = user1.availableDays[key];
    const day2 = user2.availableDays && user2.availableDays[key];
    if (day1 && day2) {
      return;
    }
  }
  throw new Error("Users cannot be matched, no available days in common.");
}

export default matchUsers;
