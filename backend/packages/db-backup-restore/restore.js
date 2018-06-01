// @flow

import path from "path";
import fs from "fs-extra";
import { spawnSync } from "child_process";

import { extractArchive, downloadFileFromS3, constants } from "./utils";

import type { DbBackupRestoreProps } from "./index";
import type { ILambdaFunction } from "backend-types";

// https://docs.arangodb.com/3.4/Manual/Administration/Arangorestore.html
class DbRestoreFunction implements ILambdaFunction {
  props: DbBackupRestoreProps;

  constructor(props: DbBackupRestoreProps) {
    this.props = props;
  }

  handleEvent = async (event: Object) => this.restoreDb(event.s3Key);

  restoreDb = async (s3Key: string): Promise<void> => {
    if (!s3Key) {
      throw new Error(
        "Failed to restore database, missing 's3Key' property in event.",
      );
    }
    const { logger, dbName, s3Bucket } = this.props;
    const s3Url = `https://s3.amazonaws.com/${s3Bucket}/${s3Key}`;
    logger.info(`Restoring database '${dbName} from backup ${s3Url}`);
    const backupFilePath = `/tmp/${s3Key}`;
    await downloadFileFromS3(s3Bucket, s3Key, backupFilePath);
    await extractArchive(backupFilePath, constants.CWD);
    const stdout = this.restoreDbFromBackup();
    logger.info(stdout);
    fs.removeSync(constants.OUTPUT_DIR);
    fs.removeSync(backupFilePath);
    logger.info(`Restored database '${dbName}`);
  };

  restoreDbFromBackup(): string {
    const { env, dbConnString, dbUser, dbPassword, dbName } = this.props;
    const isDev = env === "development";
    const useAuthentication = !isDev;
    const command = isDev
      ? "/usr/bin/arangorestore"
      : path.resolve(__dirname, "../db-backup-restore/bin/arangorestore");
    const args = [
      "--input-directory",
      `${constants.CWD}${constants.OUTPUT_DIR}`,
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
      "--create-database",
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

export default DbRestoreFunction;
