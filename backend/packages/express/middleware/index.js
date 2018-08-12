// @flow

import Config from "../../../config";
import GraphQLApi from "../../graphql";

import createAuthMiddleware from "./auth";
import createUtilsMiddleware from "./utils";
import createGraphQLMiddleware from "./graphql";

import type { Middleware } from "express";
import type { ILogger } from "backend-types";

type ExpressMiddlewareProps = {
  app: Object,
  config: Config,
  graphqlApi: GraphQLApi,
  logger: ILogger,
  authPath: string,
  graphqlPath: string,
};

class ExpressMiddleware {
  auth: Middleware;
  utils: Middleware;

  constructor(props: ExpressMiddlewareProps): void {
    const { auth, jwtVerify } = createAuthMiddleware(props);
    this.auth = auth;
    this.utils = createUtilsMiddleware(props);
    createGraphQLMiddleware(props, jwtVerify);
  }
}

export default ExpressMiddleware;
export type { ExpressMiddlewareProps };
