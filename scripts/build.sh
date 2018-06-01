#!/bin/bash

# fail fast
set -e

gitCommit=$CODEBUILD_SOURCE_VERSION

echo "Building from source commit: $gitCommit"

repoUri="https://$GITHUB_USER:$GITHUB_TOKEN@github.com/mikestaub/slack-lunch-club.git"
latestCommitMaster=$(git ls-remote "$repoUri" refs/heads/master | cut -f 1)

# first deploy and test in staging
export NODE_ENV=staging
export TEST_URL=https://staging.slacklunch.club
npm run deploy:staging
npm run test
npm run report-coverage

if [ "$gitCommit" == "$latestCommitMaster" ]; then
  # deploy and test production
  export NODE_ENV=production
  export TEST_URL=https://slacklunch.club
  npm run deploy:production
  npm run test:e2e
fi
