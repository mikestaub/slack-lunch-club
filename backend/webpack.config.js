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

let externals = [/@arangodb/, /transaction/];

const isDev = process.env.NODE_ENV === "development";

if (isDev && !process.env.USE_DIST) {
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
  resolve: {
    alias: {
      // TODO remove this when serverless framework supports node 8.10
      arangojs: "arangojs/lib/cjs/index.js",
    },
  },
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
    ],
  },
};
