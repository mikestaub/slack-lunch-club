const plugins = [
  "source-map-support",
  "@babel/plugin-transform-runtime",
  "@babel/plugin-proposal-class-properties",
  "@babel/plugin-proposal-function-bind",
  "@babel/plugin-proposal-export-default-from",
];

module.exports = {
  presets: [
    [
      "@babel/env",
      {
        targets: { node: "8.10.0" },
        shippedProposals: true,
      },
    ],
    "@babel/flow",
  ],
  sourceMaps: "inline",
  plugins,
};
