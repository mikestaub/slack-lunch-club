import type { User, UpdateUserInput, DeleteUserInput } from "graphql-types";

const graphqlRequest = async body => {
  try {
    if (!window.localStorage.getItem("token")) {
      return Promise.reject("Must be logged in to perform request");
    }
    const params = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      },
      body: JSON.stringify(body),
    };
    const { operationName } = body;

    const backendApiUrl = process.env.REACT_APP_BACKEND_API_URL;
    const res = await fetch(`${backendApiUrl}/graphql`, params);
    const resJson = await res.json();
    if (resJson.errors) {
      throw new Error(resJson.errors[0].message);
    }
    return resJson.data[operationName];
  } catch (err) {
    throw new Error(`Failed to fetch data: ${err.message}`);
  }
};

async function getCurrentUser(): User {
  const body = { operationName: "getCurrentUser" };
  const result: GetCurrentUserResult = await graphqlRequest(body);
  return result.user;
}

async function updateUser(input: UpdateUserInput): User {
  const variables = {
    input: Object.assign({}, input, {
      slackTeamMemberConnection: undefined,
      matchedConnection: undefined,
    }),
  };
  const body = {
    operationName: "updateUser",
    variables,
  };
  const result: UpdateUserResult = await graphqlRequest(body);
  return result.user;
}

async function deleteUser(input: DeleteUserInput): Boolean {
  const body = {
    operationName: "deleteUser",
    variables: { input },
  };
  const result: DeleteUserResult = await graphqlRequest(body);
  return result.success;
}

export { getCurrentUser, updateUser, deleteUser };
