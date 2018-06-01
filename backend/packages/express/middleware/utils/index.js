// @flow

import cors from "cors";
import RateLimit from "express-rate-limit";
import { compose } from "compose-middleware";

import type { $Request, $Response, NextFunction } from "express";
import type { ExpressMiddlewareProps } from "../index";

function createMiddleware({ config, logger }: ExpressMiddlewareProps): Object {
  const isDev = config.env === "development";

  const handleErrors = (
    err: Error,
    req: $Request,
    res: $Response,
    next: NextFunction,
  ) => {
    if (!err) {
      return next();
    }
    logger.error(err.stack);
    const response = isDev ? err.stack : `Internal error: ${err.message}`;
    const code = err.name === "unauthorized" ? 401 : 500;
    return res.status(code).send(response);
  };

  const handleNotFound = (req: $Request, res: $Response) => {
    if (!req.route) {
      logger.warn(`404 - ${req.originalUrl}`);
      const response = "Not found.";
      return res.status(404).format({
        html: () => res.send(`<div>${response}</div>`),
        text: () => res.send(response),
        json: () => res.json({ response }),
      });
    }
  };

  const origin = `${isDev ? "http" : "https"}://${config.frontendDomainName}`;
  const entryMiddleware = compose([
    logger.expressMiddleware,
    cors({ origin }),
    // TODO: if default MemoryStore becomes an issue, use:
    // https://github.com/partoutx/connect-arangodb-session
    new RateLimit(config.expressRateLimit),
  ]);

  return {
    entryMiddleware,
    handleErrors,
    handleNotFound,
  };
}

export default createMiddleware;
