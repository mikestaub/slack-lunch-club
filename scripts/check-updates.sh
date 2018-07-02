#!/bin/bash

# fail fast
set -e

# -u will modify package.json files
shouldUpdate=$1
semverLevel="latest"

if [[ ! -z "$shouldUpdate" ]]; then
  # major versions should be upgraded manually
  semverLevel="major"
fi

ncu "${shouldUpdate}" --semverLevel "$semverLevel"
ncu "${shouldUpdate}" --semverLevel "$semverLevel" --packageFile global-aws/package.json
ncu "${shouldUpdate}" --semverLevel "$semverLevel" --packageFile frontend/package.json
ncu "${shouldUpdate}" --semverLevel "$semverLevel" --packageFile e2e-tests/package.json
ncu "${shouldUpdate}" --semverLevel "$semverLevel" --packageFile backend/package.json
ncu "${shouldUpdate}" --semverLevel "$semverLevel" --packageFile backend/packages/db/package.json
ncu "${shouldUpdate}" --semverLevel "$semverLevel" --packageFile backend/packages/db-backup-restore/package.json
ncu "${shouldUpdate}" --semverLevel "$semverLevel" --packageFile backend/packages/express/package.json
ncu "${shouldUpdate}" --semverLevel "$semverLevel" --packageFile backend/packages/graphql/package.json
ncu "${shouldUpdate}" --semverLevel "$semverLevel" --packageFile backend/packages/matcher/package.json
ncu "${shouldUpdate}" --semverLevel "$semverLevel" --packageFile backend/packages/utils/package.json