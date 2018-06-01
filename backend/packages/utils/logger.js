// @flow

import winston from "winston";
import { logger as ExpressWinstonMiddleware } from "express-winston";

import type { ILogger } from "backend-types";

class Logger extends winston.Logger implements ILogger {
  constructor(level: string = "info") {
    const transport = new winston.transports.Console({
      json: true,
      colorize: true,
    });

    super({
      level,
      transports: [transport],
    });

    this.expressMiddleware = new ExpressWinstonMiddleware({
      winstonInstance: this,
      meta: true,
      msg:
        "{{req.user && req.user.id}} {{req.method}} {{req.url}} {{res.statusCode}}",
      colorStatus: true,
      statusLevels: true,
      skip: (req, res) => res.statusCode < 500, // only log errors
    });
  }
}

export default Logger;
