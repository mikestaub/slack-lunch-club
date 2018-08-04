const plugins = [
  "source-map-support",
  "@babel/plugin-transform-runtime",
  "@babel/plugin-proposal-class-properties",
  "@babel/plugin-proposal-function-bind",
  "@babel/plugin-proposal-export-default-from",
  babel7Workaround,
];

module.exports = {
  presets: [
    [
      "@babel/env",
      {
        targets: {
          // TODO: upgrade serverless-offline when bug is fixed
          //  https://github.com/dherault/serverless-offline/issues/405
          // TODO: upgrading to 8.10.0 breaks in AWS Lambda env
          node: "6.10.0",
        },
        shippedProposals: true,
      },
    ],
    "@babel/flow",
    "es201",
  ],
  sourceMaps: "inline",
  plugins,
};

// Restore old babylon behavior for istanbul.
// TODO remove this when babel-plugin-istanbul is updated
// https://github.com/babel/babel/pull/6836
// https://github.com/istanbuljs/istanbuljs/issues/119
// https://github.com/istanbuljs/istanbuljs/commit/0968206aa4dcbc78d5000d8f257f49fcb864c63f
function babel7Workaround() {
  return {
    visitor: {
      Program(programPath) {
        programPath.traverse({
          ArrowFunctionExpression(path) {
            const node = path.node;
            node.expression = node.body.type !== "BlockStatement";
          },
        });
      },
    },
  };
}
