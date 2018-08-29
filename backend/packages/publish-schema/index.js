// @flow

import { spawnSync } from "child_process";
import fse from "fs-extra";
import path from "path";

import Config from "../../config";
import GraphQlApi from "../graphql";

import type { ILogger, ILambdaFunction } from "backend-types";

type Args = {
  config: Config,
  logger: ILogger,
  graphqlApi: GraphQlApi,
};

class PublishSchemaFunction implements ILambdaFunction {
  config: Config;
  logger: ILogger;
  apolloConfig: Object;
  graphqlApi: GraphQlApi;
  configPath: string;
  schemaPath: string;

  constructor({ config, logger, graphqlApi }: Args): void {
    this.config = config;
    this.logger = logger;
    this.graphqlApi = graphqlApi;
    this.configPath = path.resolve(__dirname, "apollo.config.js");
    this.schemaPath = path.resolve(__dirname, "schema.json");
    this.apolloConfig = {
      schemas: {
        main: {
          engineKey: this.config.apolloEngineApiKey,
          endpoint: {
            url: this.schemaPath,
          },
        },
      },
    };
  }

  async handleEvent(): Promise<void> {
    const command = "apollo";
    const args = ["schema:publish", "--config", this.configPath];
    const opts = { encoding: "utf8" };

    await this.writeFiles();

    const { status, stdout, stderr, error } = spawnSync(command, args, opts);

    if (status !== 0 || error || stderr) {
      const errMsg = (error || stderr || stdout).toString();
      this.logger.error(errMsg);
      this._exitProcess(1);
    } else {
      this.logger.info(stdout.toString());
      this._exitProcess(0);
    }
  }

  _exitProcess(code: number = 0): void {
    // TODO: should not have to do this
    // https://github.com/serverless-heaven/serverless-webpack/issues/204
    process.exit(code);
  }

  async writeFiles(): Promise<void> {
    const introspectionRes = await this.graphqlApi.getInstrospectionResult();
    const config = `module.exports = ${JSON.stringify(this.apolloConfig)}`;
    fse.outputFileSync(this.configPath, config);
    fse.outputFileSync(this.schemaPath, JSON.stringify(introspectionRes));
  }
}

export default PublishSchemaFunction;
