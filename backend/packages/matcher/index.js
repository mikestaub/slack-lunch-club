// @flow

import handlebars from "handlebars";

import Config from "../../config";
import GraphQLApi from "../graphql";

import MatchApiInterface from "./api";
import MatchGenerator from "./generate";
import adminSuccessHtml from "./emails/adminSuccess.html";

import type { IMailer, ILogger, ILambdaFunction } from "backend-types";

type Args = {
  config: Config,
  graphqlApi: GraphQLApi,
  mailer: IMailer,
  logger: ILogger,
};

class MatchMailerFunction implements ILambdaFunction {
  config: Config;
  graphqlApi: GraphQLApi;
  mailer: IMailer;
  logger: ILogger;
  api: MatchApiInterface;
  generator: MatchGenerator;

  constructor({ config, graphqlApi, mailer, logger }: Args): void {
    this.config = config;
    this.mailer = mailer;
    this.api = new MatchApiInterface(graphqlApi, config.authTokenSecret);
    this.generator = new MatchGenerator();
    this.logger = logger;
  }

  async handleEvent(): Promise<boolean> {
    try {
      return this.sendAllMatchEmails();
    } catch (err) {
      this.logger.error(`Failed to send all match emails, ${err.stack}`);
      return false;
    }
  }

  async sendAllMatchEmails(): Promise<boolean> {
    const possibleMatchesForUsers = await this.api.getUsersRequestingMatch();
    const { matches, unmatchable } = this.generator.generateMatches(
      possibleMatchesForUsers,
    );
    const input1 = { matches };
    const input2 = { userIds: unmatchable };

    const res1Successful = await this.api.matchUsers(input1);
    const res2Successful = await this.api.notifyUnmatchedUsers(input2);
    const success = res1Successful && res2Successful;

    if (success) {
      await this.emailAdminSuccess(matches, unmatchable);
    } else {
      this.logger.error(`Failed to send all match emails.`);
    }

    return success;
  }

  async emailAdminSuccess(
    matches: Array<Array<string>>,
    unmatchable: Array<string>,
  ): Promise<Object> {
    const params = {
      numMatched: matches.length * 2,
      numUnmatched: unmatchable.length,
    };
    const html = handlebars.compile(adminSuccessHtml)(params);
    const { noreplyAddress } = this.config.email;
    const adminAddresses = await this.api.getAdminEmails();
    const message = {
      subject: "SUCCESS: All lunch match emails successfull sent!",
      to: adminAddresses,
      from: noreplyAddress,
      html,
    };
    return this.mailer.sendMail(message);
  }
}

export default MatchMailerFunction;
