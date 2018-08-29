// @flow

import { ApolloServer } from "apollo-server-express";
import depthLimit from "graphql-depth-limit";
import { compose } from "compose-middleware";
import { maskErrors } from "graphql-errors";
import { Router } from "express";
import bodyParser from "body-parser";
import voyagerMiddleware from "graphql-voyager/middleware/express";

import type { $Request, $Response, Middleware } from "express";
import type { ExpressMiddlewareProps } from "../index";

function createMiddleware(
  { app, config, graphqlApi, logger, graphqlPath }: ExpressMiddlewareProps,
  jwtVerify: Middleware,
): void {
  const isDev = config.env === "development";
  const PLAYGROUND_PATH = "/playground";
  const VOYAGER_PATH = "/voyager";
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
  }

  const addQuery = (req: $Request, $res: $Response, next) => {
    const { query, operationName } = req.body;
    if (!isIntrospectionQuery(query)) {
      req.body.query = allQueries[operationName] || "INVALID_OPERATION_NAME";
    }
    return next();
  };

  // ignore unauthorized errors for specific routes
  const overrideAuth = (err, req, res, next) => {
    if (isDev && err.name === "unauthorized") {
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

  const server = new ApolloServer({
    schema,
    engine: {
      apiKey: config.apolloEngineApiKey,
    },
    validationRules,
    bodyParserConfig: true,
    introspection: isDev,
    playground: isDev,
    context: ({ req }) => {
      return {
        ...context,
        user: req.user,
        authTokenSecret: req.authTokenSecret,
      };
    },
    formatError(err) {
      logger.error(err);
      return err;
    },
  });

  router.get(VOYAGER_PATH, voyager);

  const mw = compose([
    jwtVerify,
    overrideAuth,
    bodyParser.json(),
    addQuery,
    router,
  ]);

  app.use("/graphql", mw);
  server.applyMiddleware({
    app,
    playgroundOptions: { endpoint: PLAYGROUND_PATH },
  });
}

export default createMiddleware;
