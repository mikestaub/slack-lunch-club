// @flow

import { Router } from "express";
import { compose } from "compose-middleware";
import { sign } from "jsonwebtoken";
import cookieSession from "cookie-session";
import passport from "passport";

import createSlackMiddleware from "./slack";
import createJwtMiddleware from "./jwt";

import type { $Request, $Response, NextFunction } from "express";
import type { ExpressMiddlewareProps } from "../index";

const createAuthMiddleware = ({
  config,
  logger,
  graphqlApi,
  authPath,
}: ExpressMiddlewareProps) => {
  const AUTH_TOKEN_NAME = "token";
  const SESSION_COOKIE_NAME = "auth-session";

  const cookieParams = {
    maxAge: 60000,
    sameSite: "lax",
    secure: !(config.env === "development"),
    domain: config.frontendDomainName,
  };

  const sessionMiddleware = cookieSession({
    ...cookieParams,
    name: SESSION_COOKIE_NAME,
    secret: config.authTokenSecret,
    path: authPath,
  });

  const saveReturnTo = (req: $Request, res: $Response, next: NextFunction) => {
    if (req.query && req.query.returnTo) {
      req.session.returnTo = req.query.returnTo;
    }
    return next();
  };

  const workAroundServerlessOfflineBug = () => {
    // TODO cookie sessions broken:
    // https://github.com/dherault/serverless-offline/issues/310
    if (config.env === "development") {
      return "https://localhost:3000";
    }
  };

  const redirectWithToken = (req: $Request, res: $Response) => {
    // TODO: verify req.session.returnTo works in tests
    const defaultUrl = `https://${config.frontendDomainName}/`;
    let returnTo =
      workAroundServerlessOfflineBug() || req.session.returnTo || defaultUrl;
    const token = sign(req.user, config.authTokenSecret);
    res.cookie(AUTH_TOKEN_NAME, token, cookieParams);
    return res.redirect(returnTo);
  };

  const router = Router();

  const slackAuth = createSlackMiddleware({
    config,
    graphqlApi,
    saveReturnTo,
    redirectWithToken,
    passport,
  });

  const jwtVerify = createJwtMiddleware({
    config,
    graphqlApi,
    logger,
    passport,
  });

  router.use(passport.initialize());
  router.use("/slack", slackAuth);

  const auth = compose([sessionMiddleware, router]);

  return { auth, jwtVerify };
};

export default createAuthMiddleware;
