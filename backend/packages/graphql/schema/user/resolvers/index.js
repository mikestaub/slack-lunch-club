import getCurrentUser from "./queries/getCurrentUser";
import getUsersByProps from "./queries/getUsersByProps";
import getUsersRequestingMatch from "./queries/getUsersRequestingMatch";

import createUser from "./mutations/createUser";
import updateUser from "./mutations/updateUser";
import deleteUser from "./mutations/deleteUser";
import notifyUnmatchedUsers from "./mutations/notifyUnmatchedUsers";
import matchUsers from "./mutations/matchUsers";
import addToSlackTeam from "./mutations/addToSlackTeam";

import { matchedConnection, slackTeamMemberConnection } from "./types/user";

const resolvers = {
  Query: {
    getUsersByProps,
    getCurrentUser,
    getUsersRequestingMatch,
  },
  Mutation: {
    createUser,
    updateUser,
    deleteUser,
    notifyUnmatchedUsers,
    matchUsers,
    addToSlackTeam,
  },
  User: {
    matchedConnection,
    slackTeamMemberConnection,
  },
};

export default resolvers;
