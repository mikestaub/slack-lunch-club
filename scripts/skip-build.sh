#!/bin/bash

# fail fast
set -e

# Only continue with the build if it is triggered from
# master, staging, or PR branch

gitCommit=$CODEBUILD_SOURCE_VERSION

echo "Building from source commit: $gitCommit"

repoUri="https://$GITHUB_USER:$GITHUB_TOKEN@github.com/mikestaub/slack-lunch-club.git"

latestCommitStaging=$(git ls-remote "$repoUri" refs/heads/staging | cut -f 1)
latestCommitMaster=$(git ls-remote "$repoUri" refs/heads/master | cut -f 1)

isPR=false
if [[ $gitCommit =~ ^[P,p][R,r]/[0-9]+$ ]] ; then
  isPR=true
fi

if [ "$gitCommit" != "$latestCommitMaster" ] &&
   [ "$gitCommit" != "$latestCommitStaging" ] &&
   [ "$isPR" = "false" ] ; then

  echo "Skipping build (not master, staging, or PR branch)"
  exit 1

fi
