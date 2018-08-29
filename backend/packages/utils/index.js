// @flow

import fs from "fs";

import Mailer from "./mailer";
import Logger from "./logger";

import type { ILogger, ILambdaFunction } from "backend-types";

// silence noisey warnings from serverless-offline + webpack reloading
const clearSockets = () => {
  const path = "/tmp";
  return fs
    .readdirSync(path)
    .map(file => `${path}/${file}`)
    .filter(filePath => fs.statSync(filePath).isSocket())
    .forEach(filePath => fs.unlinkSync(filePath));
};

// misc global setup goes in here
const initProcess = (env: string, logger: ILogger) => {
  const isDev = env === "development";

  if (isDev) {
    clearSockets();
  }

  process.on("unhandledRejection", (err: Error) => {
    logger.error(`Unhandled rejection: ${err.stack}`);
    if (!isDev) {
      process.exit(1);
    }
  });

  process.on("uncaughtException", (err: Error) => {
    logger.error(`Uncaught exception: ${err.stack}`);
    if (!isDev) {
      process.exit(1);
    }
  });
};

// All lambda functions should be wrapped with this HOF
const asyncWrapper = ({
  env,
  func,
  logger,
  promises,
}: {
  env: string,
  func: ILambdaFunction,
  logger: ILogger,
  promises?: Array<Promise<any>>,
}) => async (
  event: Object,
  context: Object,
  callback: (error: ?Error, result: any) => any,
): any => {
  try {
    if (promises) {
      await Promise.all(promises);
    }
    const result = await func.handleEvent(event, context);
    return callback(null, result);
  } catch (err) {
    const stackTrace = err.stack;
    logger.error(`Lambda function failed to handle event: ${stackTrace}`);
    const error =
      env === "development" ? stackTrace : new Error("Internal Server Error.");
    callback(error);
  }
};

export { initProcess, asyncWrapper, Mailer, Logger };
