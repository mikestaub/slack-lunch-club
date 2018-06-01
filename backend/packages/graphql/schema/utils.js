// @flow

// TODO: publish this as a public npm package
import type {
  GraphQLAuthorizerArgs,
  GraphQLAuthorizerFunc,
} from "backend-types";

type Args = GraphQLAuthorizerArgs & {
  needsOne?: Array<GraphQLAuthorizerFunc>,
  needsAll?: Array<GraphQLAuthorizerFunc>,
};

// Utility function for composable, declarative GraphQL authorization logic
async function authorize(args: Args): Promise<?GraphQLAuthorizerArgs> {
  const { needsOne = [], needsAll = [], ...rest } = args;

  for (const func of needsAll) {
    await func(rest);
  }

  let error = null;
  for (const func of needsOne) {
    try {
      return func(rest);
    } catch (err) {
      error = err;
      continue;
    }
  }

  if (needsOne.length) {
    throw error;
  }
}

export { authorize };
