import { authorize } from "../utils";

describe("authorize", () => {
  test("authorize should throw error if any authorizer in 'needsAll' throw an error", async () => {
    const error = new Error();
    const auth = () => {
      throw error;
    };
    await expect(authorize({ needsAll: [auth] })).rejects.toThrow(error);
  });

  test("authorize should throw with invalid arguments", async () => {
    await expect(authorize()).rejects.toThrow();
  });

  test("authorize should throw error if all authorizers in 'needsOne' arg throw errors", async () => {
    const error = new Error();
    const auth = () => {
      throw error;
    };
    await expect(authorize({ needsOne: [auth] })).rejects.toThrow(error);
  });

  test("authorize should throw errors from asynchronous authorizers", async () => {
    const error = new Error();
    const auth = async () => Promise.reject(error);
    await expect(authorize({ needsOne: [auth] })).rejects.toThrow(error);
    await expect(authorize({ needsAll: [auth] })).rejects.toThrow(error);
  });

  test("authorize should not throw error if no authorizers in 'needsAll' throw an error", async () => {
    const auth = () => {};
    const result = await authorize({ needsAll: [auth] });
    await expect(result).toBe(undefined);
  });

  test("authorize should not throw error if one authorizer in 'needsOne' arg does not throw an error", async () => {
    const auth1 = () => {
      throw new Error();
    };
    const auth2 = () => {};
    const result = await authorize({ needsOne: [auth1, auth2] });
    await expect(result).toBe(undefined);
  });

  test("authorize should not throw error if no authorizers are passed", async () => {
    const result = await authorize({});
    await expect(result).toBe(undefined);
  });

  test("authorize should not throw error if no authorizers throw error", async () => {
    const auth1 = () => {};
    const auth2 = () => {};
    const result = await authorize({ needsOne: [auth1, auth2] });
    await expect(result).toBe(undefined);
  });

  test("authorize should work with a combination of sync and async authorizers", async () => {
    const auth1 = () => {};
    const auth2 = async () => Promise.resolve();
    const result = await authorize({ needsOne: [auth1, auth2] });
    await expect(result).toBe(undefined);
  });

  test("authorize should pass args to each authorizer function", async () => {
    const auth1 = jest.fn();
    const auth2 = jest.fn(async args => Promise.resolve(args));
    const args = { foo: "bar" };
    await authorize({
      needsOne: [auth1],
      needsAll: [auth2],
      ...args,
    });
    await expect(auth1).toHaveBeenCalledWith(args);
    await expect(auth2).toHaveBeenCalledWith(args);
  });
});
