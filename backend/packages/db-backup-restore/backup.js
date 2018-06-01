// @flow

import path from "path";
import fs from "fs-extra";
import { spawnSync } from "child_process";

import { createArchive, uploadFileToS3, constants } from "./utils";

import type { ILambdaFunction } from "backend-types";

import type { DbBackupRestoreProps } from "./index";

// https://docs.arangodb.com/3.4/Manual/Administration/Arangodump.html
class DbBackupFunction implements ILambdaFunction {
  props: DbBackupRestoreProps;

  constructor(props: DbBackupRestoreProps) {
    this.props = props;
  }

  handleEvent = async () => this.backupDb();

  backupDb = async () => {
    const { env, logger, dbName, s3Bucket } = this.props;
    logger.info(`Backing up database '${dbName}`);
    const backupFileName = `${dbName}-${new Date().toISOString()}.tar.gz`;
    const backupFilePath = `${constants.CWD}/${backupFileName}`;
    const stdout = this.populateBackupDir();
    logger.info(stdout);
    await createArchive(constants.OUTPUT_DIR, backupFilePath);
    const s3Url = await uploadFileToS3(s3Bucket, backupFilePath, env);
    fs.removeSync(constants.OUTPUT_DIR);
    fs.removeSync(backupFileName);
    logger.info(`Finished backing up database '${dbName}' to ${s3Url}`);
  };

  populateBackupDir(): string {
    const { env, dbConnString, dbUser, dbPassword, dbName } = this.props;
    const isDev = env === "development";
    const useAuthentication = !isDev;
    const command = isDev
      ? "/usr/bin/arangodump"
      : path.resolve(__dirname, "../db-backup-restore/bin/arangodump");
    const args = [
      "--output-directory",
      constants.OUTPUT_DIR,
      "--server.endpoint",
      dbConnString,
      "--server.username",
      dbUser,
      "--server.password",
      dbPassword,
      "--server.database",
      dbName,
      "--server.authentication",
      String(useAuthentication),
      "--overwrite",
      "true",
    ];
    const opts = { encoding: "utf8" };
    const { status, stdout, stderr, error } = spawnSync(command, args, opts);
    if (status !== 0) {
      throw new Error(error || stderr || stdout);
    }
    return stdout.toString();
  }
}

export default DbBackupFunction;
