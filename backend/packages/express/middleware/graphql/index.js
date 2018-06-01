// @flow

import { graphqlExpress } from "apollo-server-express";
import depthLimit from "graphql-depth-limit";
import { compose } from "compose-middleware";
import NoIntrospection from "graphql-disable-introspection";
import { maskErrors } from "graphql-errors";
import express, { Router } from "express";
import playgroundMiddleware from "graphql-playground-middleware-express";
import voyagerMiddleware from "graphql-voyager/middleware/express";

import type { $Request, $Response, NextFunction, Middleware } from "express";
import type { ExpressMiddlewareProps } from "../index";

function createMiddleware(
  { config, graphqlApi, logger, graphqlPath }: ExpressMiddlewareProps,
  jwtVerify: Middleware,
): Middleware {
  const isDev = config.env === "development";
  const isProd = config.env === "production";
  const PLAYGROUND_PATH = "/playground";
  const VOYAGER_PATH = "/voyager";
  const playground = playgroundMiddleware({ endpoint: graphqlPath });
  const voyager = voyagerMiddleware({ endpointUrl: graphqlPath });
  const router = Router();
  const validationRules = [depthLimit(10)];
  const schema = graphqlApi.getSchema();
  const context = graphqlApi.getContext();
  const allQueries = graphqlApi.getAllQueries();
  const isIntrospectionQuery = (query: string): boolean => {
    return Boolean(query && query.includes("query IntrospectionQuery {"));
  };

  if (!isDev) {
    maskErrors(schema); // do not send internal errors to client
    validationRules.push(NoIntrospection);
  }

  const apolloExpress = (req: $Request, res: $Response, next: NextFunction) => {
    const { user, authTokenSecret } = req;
    const { query, operationName } = req.body;
    const startTime = Date.now();

    if (!isIntrospectionQuery(query)) {
      req.body.query = allQueries[operationName] || "INVALID_OPERATION_NAME";
    }

    return graphqlExpress({
      schema,
      validationRules,
      context: {
        ...context,
        user,
        authTokenSecret,
      },
      async extensions({ operationName }) {
        return {
          operationName,
          runTime: Date.now() - startTime,
        };
      },
      formatError(err) {
        logger.error(err);
        return err;
      },
    })(req, res, next);
  };

  router.all("/", apolloExpress);
  router.get(PLAYGROUND_PATH, playground);
  router.get(VOYAGER_PATH, voyager);

  // ignore unauthorized errors for specific routes
  const overrideAuth = (err, req, res, next) => {
    if (!isProd && err.name === "unauthorized") {
      const ignorePaths = [
        `${graphqlPath}${PLAYGROUND_PATH}`,
        `${graphqlPath}${VOYAGER_PATH}`,
      ];
      const ignoreReferrers = ignorePaths.map(
        path => `https://${config.domainName}${path}`,
      );
      const path = req.baseUrl + req.path;
      if (
        ignorePaths.includes(path) ||
        ignoreReferrers.includes(req.get("Referrer"))
      ) {
        return next();
      }
    }
    return next(err);
  };

  return compose([jwtVerify, overrideAuth, express.json(), router]);
}

export default createMiddleware;
