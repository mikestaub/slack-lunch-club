// @flow

import type { $Request, $Response, NextFunction } from "express";

import Config from "../config";
import type { IGraphDatabase } from "../packages/db"

declare module "backend-types" {
  declare interface ILambdaFunction {
    handleEvent(event: Object, context: Object): Promise<any>;
  }
  declare interface ILogger {
    log(message: string): void;
    info(message: string): void;
    error(message: string): void;
    warn(message: string): void;
    expressMiddleware(req: $Request, res: $Response, next: NextFunction): void;
  }
  declare type EmailMessage = {
    to: string | Array<string>,
    from: string,
    html: string,
    subject: string,
  };
  declare interface IMailer {
    testEmailDomain: string;
    testEmailsOnly: boolean;
    sendMail(message: EmailMessage): Promise<?Object>;
  }
  declare type GraphQLContext = {
    db: IGraphDatabase,
    config: Config,
    mailer: IMailer,
    logger: ILogger,
    user?: Object,
    authTokenSecret?: string,
  };
  declare type GraphQLAuthorizerArgs = {
    parent: Object,
    args: Object,
    context: GraphQLContext,
  };
  declare type GraphQLAuthorizerFunc = (
    GraphQLAuthorizerArgs,
  ) => Promise<GraphQLAuthorizerArgs> | GraphQLAuthorizerArgs;
}
