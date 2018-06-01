// @flow

// user
import getCurrentUser from "./queries/user/getCurrentUser.graphql";
import getUsersByProps from "./queries/user/getUsersByProps.graphql";
import getUsersRequestingMatch from "./queries/user/getUsersRequestingMatch.graphql";
import createUser from "./mutations/user/createUser.graphql";
import updateUser from "./mutations/user/updateUser.graphql";
import deleteUser from "./mutations/user/deleteUser.graphql";
import notifyUnmatchedUsers from "./mutations/user/notifyUnmatchedUsers.graphql";
import matchUsers from "./mutations/user/matchUsers.graphql";
import addToSlackTeam from "./mutations/user/addToSlackTeam.graphql";

// slackTeam
import createSlackTeam from "./mutations/slackTeam/createSlackTeam.graphql";
import updateSlackTeam from "./mutations/slackTeam/updateSlackTeam.graphql";
import deleteSlackTeam from "./mutations/slackTeam/deleteSlackTeam.graphql";
import getSlackTeamsByProps from "./queries/slackTeam/getSlackTeamsByProps.graphql";

import AllUserProps from "./fragments/AllUserProps.graphql";

const queryObjects = {
  getCurrentUser,
  getUsersByProps,
  getUsersRequestingMatch,
  createUser,
  updateUser,
  deleteUser,
  notifyUnmatchedUsers,
  matchUsers,
  addToSlackTeam,
  createSlackTeam,
  updateSlackTeam,
  deleteSlackTeam,
  getSlackTeamsByProps,
};

const fragmentObjects = {
  AllUserProps,
};

// We just want to export the raw GraphQL query strings
const allQueries = Object.keys(queryObjects).reduce(
  (acc: Object, queryName: string): Object => {
    let queryBody = queryObjects[queryName].loc.source.body;
    acc[queryName] = getWithFragmentDefinition(queryName, queryBody);
    return acc;
  },
  {},
);

function getWithFragmentDefinition(
  queryName: string,
  queryBody: string,
): string {
  queryObjects[queryName].definitions.forEach((def: Object) => {
    if (def.kind === "FragmentDefinition") {
      const frag = fragmentObjects[def.name.value];
      queryBody += frag.loc.source.body;
    }
  });
  return queryBody;
}

export default allQueries;
