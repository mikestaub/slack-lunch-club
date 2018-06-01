import { mergeResolvers, mergeTypes } from "merge-graphql-schemas";
import { makeExecutableSchema } from "graphql-tools";

import { paginationTypes, paginationResolvers } from "./pagination";
import { scalarTypes, scalarResolvers } from "./scalar";
import { userTypes, userQueries, userMutations, userResolvers } from "./user";
import {
  slackTeamTypes,
  slackTeamQueries,
  slackTeamMutations,
  slackTeamResolvers,
} from "./slackTeam";

const resolvers = mergeResolvers([
  scalarResolvers,
  paginationResolvers,
  userResolvers,
  slackTeamResolvers,
]);

const typeDefs = mergeTypes([
  paginationTypes,
  scalarTypes,
  userTypes,
  userQueries,
  userMutations,
  slackTeamTypes,
  slackTeamQueries,
  slackTeamMutations,
]);

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  resolverValidationOptions: {
    requireResolversForResolveType: false,
  },
});

export { schema as default, typeDefs };
