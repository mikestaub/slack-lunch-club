// @flow

import { spawnSync } from "child_process";

import Config from "../../config";

import type { ILogger, ILambdaFunction } from "backend-types";

type Args = {
  config: Config,
  logger: ILogger,
};

class PublishSchemaFunction implements ILambdaFunction {
  config: Config;
  logger: ILogger;

  constructor({ config, logger }: Args): void {
    this.config = config;
    this.logger = logger;
  }

  async handleEvent(): Promise<void> {
    const endpoint = `https://${this.config.domainName}/graphql`;
    const key = this.config.apolloEngineApiKey;
    const command = "apollo";
    const opts = { encoding: "utf8" };
    const args = ["schema:publish", "--endpoint", endpoint, "--key", key];

    if (this.config.env === "development") {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    const { status, stdout, stderr, error } = spawnSync(command, args, opts);

    if (status !== 0 || error || stderr) {
      const errMsg = error || stderr || stdout;
      throw new Error(errMsg);
    } else {
      this.logger.info(stdout.toString());
    }
  }
}

export default PublishSchemaFunction;
