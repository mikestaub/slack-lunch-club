import ProxyValidator from "proxy-validator";

const validators = {
  name: {
    isLength: {
      options: {
        min: 2,
      },
      errorMessage: "Minimum length 2 characters.",
    },
  },
  slackApiId: {
    isLength: {
      options: {
        min: 6,
      },
      errorMessage: "Minimum length 6 characters.",
    },
  },
};

const sanitizers = {};

const SlackTeamValidator = ProxyValidator(validators, sanitizers);

export default SlackTeamValidator;
