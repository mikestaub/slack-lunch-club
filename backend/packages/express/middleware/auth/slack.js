// @flow

import { Router } from "express";
import PassportSlack from "@mikestaub/passport-slack";

import Config from "../../../../config";
import GraphQLApi from "../../../graphql";

import type { Middleware } from "express";

type Args = {
  config: Config,
  graphqlApi: GraphQLApi,
  passport: Object,
  saveReturnTo: Middleware,
  redirectWithToken: Middleware,
};

const createSlackMiddleware = ({
  config,
  graphqlApi,
  saveReturnTo,
  redirectWithToken,
  passport,
}: Args): Middleware => {
  const router = Router();

  const slackAuth = passport.authenticate("slack", {
    failureRedirect: "/",
    session: false,
    scope: [
      "identity.basic",
      "identity.email",
      "identity.team",
      "identity.avatar",
    ],
  });

  const strategyParams = {
    clientID: config.slack.clientId,
    clientSecret: config.slack.clientSecret,
    callbackURL: `https://${config.domainName}/auth/slack/return`,
  };

  const verifyCallback = async (
    accessToken: string,
    refreshToken: string,
    profile: Object,
    done: (err: ?Error, user: ?Object) => void,
  ) => {
    const input1 = {
      email: profile.user.email,
      name: profile.user.name,
      profilePhoto: profile.user.image_512,
      role: config.env === "development" ? "ADMIN" : undefined,
    };
    const input2 = {
      slackApiId: profile.team.id,
      name: profile.team.name,
    };
    try {
      const context = { authTokenSecret: config.authTokenSecret };
      const user = await graphqlApi.getOrCreateUser(input1, context);
      const slackTeam = await graphqlApi.getOrCreateSlackTeam(input2, context);
      const input3 = {
        userId: user.id,
        slackTeamId: slackTeam.id,
      };
      await graphqlApi.addToSlackTeam(input3, context);
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  };

  passport.use(new PassportSlack.Strategy(strategyParams, verifyCallback));

  router.get("/", saveReturnTo, slackAuth);
  router.get("/return", slackAuth, redirectWithToken);

  return router;
};

export default createSlackMiddleware;
