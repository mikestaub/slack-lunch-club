const path = require("path");

let config = require("../../webpack.config.js");

config.entry = {
  index: path.resolve(__dirname, "index.js"),
  genSchema: path.resolve(__dirname, "genSchema.js"),
};

config.output = {
  libraryTarget: "commonjs",
  path: path.resolve(__dirname, "build"),
  filename: "[name].js",
};

config.plugins = [];

config.externals = [/@arangodb/];

module.exports = config;
