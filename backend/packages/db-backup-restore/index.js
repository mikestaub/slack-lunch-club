// @flow

import BackupFunction from "./backup";
import RestoreFunction from "./restore";

import type { ILogger } from "backend-types";

class DbBackupRestoreService {
  dbBackupFunction: BackupFunction;
  dbRestoreFunction: RestoreFunction;

  constructor(props: DbBackupRestoreProps) {
    this.dbBackupFunction = new BackupFunction(props);
    this.dbRestoreFunction = new RestoreFunction(props);
  }
}

export type DbBackupRestoreProps = {
  env: string,
  logger: ILogger,
  dbConnString: string,
  dbUser: string,
  dbPassword: string,
  dbName: string,
  s3Bucket: string,
};

export default DbBackupRestoreService;
