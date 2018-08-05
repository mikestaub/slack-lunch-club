// @flow

import express from "express";
import awsServerlessExpress from "aws-serverless-express";

import ExpressMiddleware from "./middleware";
import GraphQLApi from "../graphql";

import type { ILambdaFunction, ILogger } from "backend-types";

type Args = {
  config: Object,
  logger: ILogger,
  graphqlApi: GraphQLApi,
};

class ExpressAppFunction implements ILambdaFunction {
  server: Object;

  constructor({ config, logger, graphqlApi }: Args) {
    this.server = this.createServer({ config, logger, graphqlApi });
  }

  static AUTH_PATH = "/auth";
  static GRAPHQL_PATH = "/graphql";

  async handleEvent(event: Object, context: Object): Promise<void> {
    // TODO: don't patch context after v4.x is released:
    // https://github.com/awslabs/aws-serverless-express/issues/134#issuecomment-379417431
    return new Promise(resolve => {
      awsServerlessExpress.proxy(this.server, event, {
        ...context,
        succeed: process.env.IS_OFFLINE ? context.succeed : resolve,
      });
    });
  }

  createServer({ config, logger, graphqlApi }: Args): Object {
    const app = express();

    const mw = new ExpressMiddleware({
      config,
      logger,
      graphqlApi,
      authPath: ExpressAppFunction.AUTH_PATH,
      graphqlPath: ExpressAppFunction.GRAPHQL_PATH,
    });

    app.enable("trust proxy");
    app.disable("x-powered-by");

    app.use(mw.utils.entryMiddleware);
    app.use(ExpressAppFunction.AUTH_PATH, mw.auth);
    app.use(ExpressAppFunction.GRAPHQL_PATH, mw.graphql);
    app.use(mw.utils.handleNotFound);
    app.use(mw.utils.handleErrors);

    return awsServerlessExpress.createServer(app);
  }
}

export default ExpressAppFunction;
