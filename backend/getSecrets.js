const simpleSecrets = require("./node_modules/@mikestaub/simple-secrets");

// TODO: this file can be removed when serverless bug is fixed
// https://github.com/serverless/serverless/issues/4494

module.exports = () => {
  return simpleSecrets.getSecrets();
};
