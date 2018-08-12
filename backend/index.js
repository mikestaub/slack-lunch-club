import Config from "./config";
import GraphDB from "./packages/db";
import GraphQlApi from "./packages/graphql";
import ExpressAppFunction from "./packages/express";
import MatchMailerFunction from "./packages/matcher";
import PublishSchemaFunction from "./packages/publish-schema";
import DbBackupRestoreService from "./packages/db-backup-restore";
import { initProcess, asyncWrapper, Mailer, Logger } from "./packages/utils";

const config = new Config();
const logger = new Logger();
const db = new GraphDB(config.arangodb);
const mailerProps = {
  smtpConfig: config.email.smtp,
  onlySendTests: config.email.onlySendTests,
  testEmailDomain: config.email.testEmailDomain,
};
const mailer = new Mailer(mailerProps);
const graphQlProps = { config, db, mailer, logger };
const graphqlApi = new GraphQlApi(graphQlProps);

initProcess(config.env, logger);

const commonProps = {
  ...graphQlProps,
  graphqlApi,
};

const { host, port, username, password, dbName } = config.arangodb;
const dbBackupProps = {
  env: config.env,
  logger,
  dbConnString: `http+tcp://${host}:${port}`,
  dbUser: username,
  dbPassword: password,
  dbName,
  s3Bucket: config.aws.dbBackupBucketName,
};

const expressAppFunction = new ExpressAppFunction(commonProps);
const matchMailerFunction = new MatchMailerFunction(commonProps);
const publishSchemaFunction = new PublishSchemaFunction(commonProps);
const dbBackupRestore = new DbBackupRestoreService(dbBackupProps);
const { dbBackupFunction, dbRestoreFunction } = dbBackupRestore;

// cache promise so it is not run every lambda invocation
const initDbPromise = db.initialize();

const commonArgs = {
  env: config.env,
  logger,
  promises: [initDbPromise],
};

// lambda function handlers
const expressApp = asyncWrapper({
  ...commonArgs,
  func: expressAppFunction,
});
const matchMailer = asyncWrapper({
  ...commonArgs,
  func: matchMailerFunction,
});
const dbBackup = asyncWrapper({
  ...commonArgs,
  func: dbBackupFunction,
});
const dbRestore = asyncWrapper({
  ...commonArgs,
  func: dbRestoreFunction,
});
const publishSchema = asyncWrapper({
  ...commonArgs,
  func: publishSchemaFunction,
});

export { expressApp, matchMailer, dbBackup, dbRestore, publishSchema };
