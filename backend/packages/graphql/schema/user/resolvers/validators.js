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
};

const sanitizers = {};

const UserValidator = ProxyValidator(validators, sanitizers);

export default UserValidator;
