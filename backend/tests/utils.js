// @flow

import MailDev from "maildev";
import getPort from "get-port";
import promiseEach from "p-each-series";
import { uniq } from "lodash";

import Config from "../config";
import GraphQlApi from "../packages/graphql";
import GraphDB from "../packages/db";
import MatchMailerFunction from "../packages/matcher";
import { Mailer, Logger, initProcess } from "../packages/utils";
import { writeToProcessEnv } from "@mikestaub/simple-secrets";

import type { CreateUserInput, CreateSlackTeamInput } from "graphql-types";
import type { IMailer, ILogger } from "backend-types";

// Each test suite should be self contained,
// even when accessing shared resources (database)
class TestSuiteUtils {
  config: Config;
  logger: ILogger;
  maildev: MailDev;
  mailDevPort: number;
  graphQlApi: GraphQlApi;
  matcher: MatchMailerFunction;
  mailer: IMailer;
  adminContext: Object;
  onNewEmail: (email: Object) => Object;
  testEmails: Array<string>;
  testSlackTeams: Array<string>;

  constructor() {
    this.config;
    this.logger;
    this.maildev;
    this.mailDevPort;
    this.graphQlApi;
    this.mailer;
    this.adminContext;
    this.onNewEmail;
    this.testEmails = [];
    this.testSlackTeams = [];
  }

  setupJest = (): void => {
    jest.setTimeout(10000);
    global.beforeAll(this.onBeforeAll);
    global.afterAll(this.onAfterAll);
    global.beforeEach(this.onBeforeEach);
    global.afterEach(this.onAfterEach);
  };

  onBeforeEach = (): void => this.onNewEmail.mockClear();

  onAfterEach = async (): Promise<void> => {
    try {
      await this.deleteTestUsers();
      await this.deleteTestSlackTeams();
    } catch (err) {
      this.logger.warn(`Error in test cleanup: ${err}`);
    }
  };

  onBeforeAll = async (): Promise<void> => {
    await this.initialize();
    return this.startMailDev();
  };

  onAfterAll = async (): Promise<void> => {
    return this.closeMailDev();
  };

  getEmails = async (): Promise<Array<Object>> => {
    // give maildev time to receive emails
    const WAIT_TIME = 50;
    return new Promise(resolve => {
      setTimeout(() => {
        const emails = this.onNewEmail.mock.calls.map(arg => arg[0]);
        resolve(emails);
      }, WAIT_TIME);
    });
  };

  startMailDev = (): void => {
    this.onNewEmail = jest.fn((email: Object) => email);
    this.maildev = new MailDev({
      disableWeb: true,
      smtp: this.mailDevPort,
    });
    this.maildev.on("new", this.onNewEmail);
    this.maildev.listen();
  };

  closeMailDev = async (): Promise<void> => {
    return new Promise(resolve => this.maildev.close(() => resolve()));
  };

  deleteTestUsers = async (): Promise<void> => {
    await promiseEach(uniq(this.testEmails), async email => {
      const input = {
        filter: {
          email,
        },
        pagination: {},
      };
      const result = await this.graphQlApi.getUsersByProps(
        input,
        this.adminContext,
      );
      const edge = result.edges[0];
      if (edge) {
        await this.graphQlApi.deleteUser(
          {
            id: edge.node.id,
          },
          this.adminContext,
        );
      }
    });

    this.testEmails = [];
  };

  deleteTestSlackTeams = async (): Promise<void> => {
    await promiseEach(uniq(this.testSlackTeams), async slackApiId => {
      const input = {
        filter: {
          slackApiId,
        },
        pagination: {},
      };
      const result = await this.graphQlApi.getSlackTeamsByProps(
        input,
        this.adminContext,
      );
      const edge = result.edges[0];
      if (edge) {
        await this.graphQlApi.deleteSlackTeam(
          {
            id: edge.node.id,
          },
          this.adminContext,
        );
      }
    });
    this.testSlackTeams = [];
  };

  initialize = async (): Promise<void> => {
    if (!this.config) {
      await writeToProcessEnv();
      this.config = new Config();
      this.logger = new Logger();
      initProcess(this.config.env, this.logger);
      const db = new GraphDB(this.config.arangodb);
      await db.initialize();
      this.mailDevPort = await getPort();
      const smtpConfig = {
        host: "0.0.0.0",
        port: this.mailDevPort,
        secure: false,
        tls: {
          rejectUnauthorized: false,
        },
      };
      const { testEmailsOnly, testEmailDomain } = this.config.email;
      this.mailer = new Mailer({
        smtpConfig,
        testEmailsOnly,
        testEmailDomain,
      });
      const graphQlProps = {
        config: this.config,
        db,
        mailer: this.mailer,
        logger: this.logger,
      };
      this.graphQlApi = new GraphQlApi(graphQlProps);
      const matcherProps = {
        ...graphQlProps,
        graphqlApi: this.graphQlApi,
      };
      this.matcher = new MatchMailerFunction(matcherProps);
      this.adminContext = {
        authTokenSecret: this.config.authTokenSecret,
      };
    }
  };

  createUserInput = (params: Object = {}): CreateUserInput => {
    const email = params.email ? params.email : this.createTestEmail();
    this.testEmails.push(email.toLowerCase());
    return {
      email,
      name: "TestName",
      profilePhoto: "https://testphoto.com",
      ...params,
    };
  };

  createSlackTeamInput = (params: Object = {}): CreateSlackTeamInput => {
    const slackApiId =
      params.slackApiId ||
      "ABC12345." + Date.now() + (Math.random() * 10).toString();
    this.testSlackTeams.push(slackApiId);
    return {
      slackApiId,
      name: "TEST_SLACK_TEAM_NAME",
      ...params,
    };
  };

  createTestEmail = (): string =>
    Date.now() +
    (Math.random() * 10).toString() +
    "@" +
    this.mailer.testEmailDomain;
}

export default TestSuiteUtils;
