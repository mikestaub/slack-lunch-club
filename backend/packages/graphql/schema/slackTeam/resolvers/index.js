import getSlackTeamsByProps from "./queries/getSlackTeamsByProps";

import createSlackTeam from "./mutations/createSlackTeam";
import updateSlackTeam from "./mutations/updateSlackTeam";
import deleteSlackTeam from "./mutations/deleteSlackTeam";

import { userMemberConnection } from "./types/slackTeam";

const resolvers = {
  Query: {
    getSlackTeamsByProps,
  },
  Mutation: {
    createSlackTeam,
    updateSlackTeam,
    deleteSlackTeam,
  },
  SlackTeam: {
    userMemberConnection,
  },
};

export default resolvers;
