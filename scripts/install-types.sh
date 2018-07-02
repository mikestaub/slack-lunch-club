#!/bin/bash

# fail fast
set -e

FLOW_VERSION=v0.75

# we must run the command everywhere there is a package.json file

pushd backend
  flow-typed install --flowVersion "$FLOW_VERSION"
popd

pushd backend/packages/db
  flow-typed install --flowVersion "$FLOW_VERSION"
popd

pushd backend/packages/db-backup-restore
  flow-typed install --flowVersion "$FLOW_VERSION"
popd

pushd backend/packages/express
  flow-typed install --flowVersion "$FLOW_VERSION"
popd

pushd backend/packages/graphql
  flow-typed install --flowVersion "$FLOW_VERSION"
popd

pushd backend/packages/matcher
  flow-typed install --flowVersion "$FLOW_VERSION"
popd

pushd backend/packages/utils
  flow-typed install --flowVersion "$FLOW_VERSION"
popd

pushd frontend
  flow-typed install --flowVersion "$FLOW_VERSION"
popd
