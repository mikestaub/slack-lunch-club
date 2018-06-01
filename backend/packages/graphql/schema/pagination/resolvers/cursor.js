// @flow

import Base64URL from "base64-url";
import { GraphQLScalarType } from "graphql";
import Kind from "graphql/language/kinds";

export function toCursor(value: any): string {
  return Base64URL.encode(value.toString());
}

export function fromCursor(cursor: string): ?string {
  const value = Base64URL.decode(cursor);
  return value || null;
}

const CursorType = new GraphQLScalarType({
  name: "Cursor",
  serialize(value: ?any): ?string {
    return value ? toCursor(value) : null;
  },
  parseLiteral(ast: Object): ?string {
    return ast.kind === Kind.STRING ? fromCursor(ast.value) : null;
  },
  parseValue(value: string): ?string {
    return fromCursor(value);
  },
});

export default CursorType;
