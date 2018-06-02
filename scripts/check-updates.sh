#!/bin/bash

# fail fast
set -e

# -u will modify package.json files
shouldUpdate=$1

ncu "${shouldUpdate}"
ncu "${shouldUpdate}" --packageFile global-aws/package.json
ncu "${shouldUpdate}" --packageFile frontend/package.json
ncu "${shouldUpdate}" --packageFile e2e-tests/package.json
ncu "${shouldUpdate}" --packageFile backend/package.json
ncu "${shouldUpdate}" --packageFile backend/packages/db/package.json
ncu "${shouldUpdate}" --packageFile backend/packages/db-backup-restore/package.json
ncu "${shouldUpdate}" --packageFile backend/packages/express/package.json
ncu "${shouldUpdate}" --packageFile backend/packages/graphql/package.json
ncu "${shouldUpdate}" --packageFile backend/packages/matcher/package.json
ncu "${shouldUpdate}" --packageFile backend/packages/utils/package.json