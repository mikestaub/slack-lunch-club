// @flow

import GraphQLInputString from "graphql-input-string";
import { inHTMLData } from "xss-filters";
import {
  GraphQLEmail,
  GraphQLURL,
  GraphQLDateTime,
} from "graphql-custom-types";

import scalarTypes from "./types.graphql";

const CustomEmailType = {
  ...GraphQLEmail,
  parseValue: (...args: Array<?any>): string => {
    return GraphQLEmail.parseValue(...args).toLowerCase();
  },
};

const CustomStringType = GraphQLInputString({
  name: "String",
  trim: true,
  max: 5000,
  sanitize: inHTMLData,
});

const scalarResolvers = {
  Email: CustomEmailType,
  URL: GraphQLURL,
  DateTime: GraphQLDateTime,
  String: CustomStringType,
};

export { scalarTypes, scalarResolvers };
