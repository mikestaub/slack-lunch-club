#!/bin/bash

if [ "$CODEBUILD_BUILD_SUCCEEDING" = "1" ]; then
  echo "Build succeeded for source version $CODEBUILD_SOURCE_VERSION"
else
  echo "TODO rollback if deployed"
fi