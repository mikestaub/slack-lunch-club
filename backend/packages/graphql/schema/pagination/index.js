import paginationTypes from "./pagination.graphql";

import Cursor from "./resolvers/cursor";
import PaginationInt from "./resolvers/paginationInt";

const paginationResolvers = {
  Cursor,
  PaginationInt,
};

export { paginationTypes, paginationResolvers };
