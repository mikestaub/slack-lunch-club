// @flow

import tar from "tar";
import fs from "fs-extra";
import path from "path";
import { S3 } from "aws-sdk";

const s3 = new S3();

async function createArchive(backupDir: string, file: string): Promise<Object> {
  const gzip = true;
  return tar.create({ file, gzip }, [backupDir]);
}

async function extractArchive(file: string, cwd: string): Promise<Object> {
  return tar.extract({ file, cwd });
}

function createWriteStream(filePath: string): Object {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  return fs.createWriteStream(filePath);
}

async function uploadFileToS3(
  s3Bucket: string,
  filePath: string,
  prefix: string = "",
): Promise<string> {
  const Key = `${prefix + (prefix ? "/" : "")}${path.basename(filePath)}`;
  const Url = `https://s3.amazonaws.com/${s3Bucket}/${Key}`;
  await s3
    .upload({
      Bucket: s3Bucket,
      Key,
      Body: fs.createReadStream(filePath),
    })
    .promise();
  return Url;
}

async function downloadFileFromS3(
  s3Bucket: string,
  s3Key: string,
  filePath: string,
): Promise<Object> {
  return new Promise((resolve, reject) => {
    const wStream = createWriteStream(filePath);
    wStream.on("finish", resolve);
    wStream.on("end", resolve);
    wStream.on("close", resolve);
    wStream.on("error", reject);
    return s3
      .getObject({ Bucket: s3Bucket, Key: s3Key })
      .on("error", reject)
      .createReadStream()
      .pipe(wStream);
  });
}

const CWD = "/tmp";
const OUTPUT_DIR = `${CWD}/arangodump`;
const constants = { CWD, OUTPUT_DIR };

export {
  createArchive,
  extractArchive,
  uploadFileToS3,
  downloadFileFromS3,
  constants,
};
