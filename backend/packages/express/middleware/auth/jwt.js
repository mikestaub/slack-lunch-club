// @flow

import PassportJwt from "passport-jwt";

import Config from "../../../../config";
import GraphQLApi from "../../../graphql";

import type { $Request, $Response, NextFunction } from "express";
import type { User } from "graphql-types";
import type { ILogger } from "backend-types";

type Args = {
  config: Config,
  graphqlApi: GraphQLApi,
  logger: ILogger,
  passport: Object,
};

const createJwtMiddleware = ({
  config,
  graphqlApi,
  logger,
  passport,
}: Args) => {
  const jwtAuth = (req: $Request, res: $Response, next: NextFunction) =>
    passport.authenticate(
      "jwt",
      {
        failureRedirect: "/",
        session: false,
      },
      (err: ?Error, jwtPayload: ?Object) => {
        const token = PassportJwt.ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        if (jwtPayload || token === config.authTokenSecret) {
          req.authTokenSecret = token;
          req.user = jwtPayload;
          return next();
        } else {
          return next(err);
        }
      },
    )(req, res, next);

  const strategyParams = {
    jwtFromRequest: PassportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.authTokenSecret,
  };

  const verifyCallback = async (
    jwtPayload: Object,
    done: (err: ?Error, user: ?User) => void,
  ) => {
    try {
      const context = {
        user: jwtPayload,
        authTokenSecret: config.authTokenSecret,
      };
      const user = await graphqlApi.getCurrentUser(context);
      return done(null, user);
    } catch (err) {
      logger.warn(err);
      const unauthorizedErr = new Error("Invalid 'Authorization' header.");
      unauthorizedErr.name = "unauthorized";
      return done(unauthorizedErr);
    }
  };

  passport.use(new PassportJwt.Strategy(strategyParams, verifyCallback));

  return jwtAuth;
};

export default createJwtMiddleware;
