#!/bin/bash

# fail fast
set -e

npm install -g serverless@1.27.3 yarn

rm -f yarn.lock
yarn install
npm run decrypt

pushd global-aws
  rm -f yarn.lock
  yarn install
  npm run decrypt
popd

pushd backend
  rm -f yarn.lock
  yarn install
  npm run decrypt
popd

pushd frontend
  rm -f yarn.lock
  yarn install
popd

pushd e2e-tests
  rm -f yarn.lock
  yarn install
popd
