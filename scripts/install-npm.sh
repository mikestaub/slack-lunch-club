#!/bin/bash

# fail fast
set -e

npm install -g serverless@1.27.3 yarn

yarn install
npm run decrypt

pushd global-aws
  yarn install
  npm run decrypt
popd

pushd backend
  yarn install
  npm run decrypt
popd

pushd frontend
  yarn install
popd

pushd e2e-tests
  yarn install
popd
