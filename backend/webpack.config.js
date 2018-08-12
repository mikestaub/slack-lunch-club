const path = require("path");
const glob = require("glob-fs");
const nodeExternals = require("webpack-node-externals");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const PermissionsOutputPlugin = require("webpack-permissions-plugin");

function copyArangoFile(fileName, to) {
  const binPath = "packages/db-backup-restore/bin/";
  return {
    from: path.resolve(__dirname, binPath + fileName),
    to,
  };
}

function copyDbTransactionFiles() {
  const files = glob().readdirSync("**/*.transaction.js");
  return files.map(filePath => ({
    from: filePath,
    to: filePath.split("/").pop(),
  }));
}

let copyFiles = [
  copyArangoFile("arangodump", "packages/db-backup-restore/bin"),
  copyArangoFile("arangorestore", "packages/db-backup-restore/bin"),
  copyArangoFile("arangodump.conf", "etc/relative"),
  copyArangoFile("arangorestore.conf", "etc/relative"),
  ...copyDbTransactionFiles(),
  // TODO: https://github.com/mjpearson/passport-slack/issues/37
  {
    from: "node_modules/passport-slack",
    to: "node_modules/passport-slack",
  },
];

const perms = {
  buildFiles: [
    {
      path: path.resolve(
        __dirname,
        ".webpack/service/packages/db-backup-restore/bin/arangodump",
      ),
      fileMode: "755",
    },

    {
      path: path.resolve(
        __dirname,
        ".webpack/service/packages/db-backup-restore/bin/arangorestore",
      ),
      fileMode: "755",
    },
  ],
};

let entry = {
  index: path.resolve(__dirname, "index.js"),
};

let output = {
  libraryTarget: "commonjs",
  path: path.resolve(__dirname, ".webpack"),
  filename: "[name].js",
};

let plugins = [
  new CopyWebpackPlugin(copyFiles),
  new PermissionsOutputPlugin(perms),
];

let externals = [/@arangodb/, /transaction/, /passport-slack/];

const isDev = process.env.NODE_ENV === "development";
const isLocal = process.env.IS_INVOKE_LOCAL;

if ((isDev && !process.env.USE_DIST) || isLocal) {
  externals.push(nodeExternals());
} else if (!isDev) {
  copyFiles.push({
    from: "_warmup",
    to: "_warmup",
  });
  entry["papertrailLogger/handler"] = path.resolve(
    __dirname,
    "papertrailLogger/handler.js",
  );
}

module.exports = {
  mode: "none",
  target: "node",
  node: {
    __dirname: true,
  },
  entry,
  output,
  performance: {
    hints: false,
  },
  bail: true,
  externals,
  devtool: "inline-source-map",
  plugins: plugins,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: "babel-loader",
          },
        ],
      },
      {
        test: /\.aql$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "raw-loader",
          },
        ],
      },
      {
        test: /\.html$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "html-loader",
            options: {
              minimize: true,
            },
          },
        ],
      },
      {
        test: /\.graphql$/,
        exclude: /node_modules/,
        loader: "graphql-tag/loader",
      },
      // TODO: should not need this after node v10.x
      // https://github.com/bitinn/node-fetch/issues/493
      {
        type: "javascript/auto",
        test: /\.mjs$/,
        use: [],
      },
    ],
  },
};
