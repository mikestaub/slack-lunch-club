import { GraphQLInputInt } from "graphql-input-number";

const PaginationIntType = GraphQLInputInt({
  name: "PaginationInt",
  min: 1,
  max: 100,
});

export default PaginationIntType;
