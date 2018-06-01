import fs from "fs";
import path from "path";
import { graphql, introspectionQuery } from "graphql";

import schema, { typeDefs } from "./schema";

async function main() {
  try {
    const result = await graphql(schema, introspectionQuery);
    if (result.errors) {
      throw result.errors[0];
    }
    const jsonPath = path.join(__dirname, "./build/schema.json");
    const gqlPath = path.join(__dirname, "./build/schema.graphql");
    fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));
    fs.writeFileSync(gqlPath, typeDefs);
  } catch (err) {
    throw err;
  }
}

main();
