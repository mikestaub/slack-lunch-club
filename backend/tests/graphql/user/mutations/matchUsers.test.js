import TestSuiteUtils from "../../../utils";

const utils = new TestSuiteUtils();
utils.setupJest();

let adminContext = null;
let graphQlApi = null;
let createUserInput = null;
let getEmails = null;
let onNewEmail = null;
let config = null;
beforeAll(() => {
  adminContext = utils.adminContext;
  graphQlApi = utils.graphQlApi;
  createUserInput = utils.createUserInput;
  getEmails = utils.getEmails;
  onNewEmail = utils.onNewEmail;
  config = utils.config;
});

const EMAIL_SUBJECT_MATCH_SUCCESS = "Your Slack Lunch Club match is here!";
const EMAIL_SUBJECT_ADMIN_ERROR = "ERROR: There was a problem.";

describe("matchUsers mutation", () => {
  test("should fail if not authorized", async () => {
    const input1 = createUserInput();
    const input2 = createUserInput();
    const user1 = await graphQlApi.createUser(input1, adminContext);
    const user2 = await graphQlApi.createUser(input2, adminContext);
    const input3 = {
      matches: [[user1.id, user2.id]],
    };
    const badContext = { user: user1 };
    await expect(graphQlApi.matchUsers(input3, badContext)).rejects.toThrow();
  });

  test("should fail on invalid input", async () => {
    const input = {
      badKey: [],
    };
    await expect(graphQlApi.matchUsers(input, adminContext)).rejects.toThrow();
  });

  test("should fail with invalid user ids", async () => {
    const BAD_ID1 = "412ded8c2ba04c94812d59c1ceefbbf8";
    const BAD_ID2 = "5a51ea954e854873a6715de0b78c7235";
    const input = {
      matches: [[BAD_ID1, BAD_ID2]],
    };
    const success = await graphQlApi.matchUsers(input, adminContext);
    expect(success).toBe(false);
  });

  test("should not allow user to match with themselves", async () => {
    const params = {
      availableDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
      },
    };
    const input1 = createUserInput(params);
    const user = await graphQlApi.createUser(input1, adminContext);
    const input2 = {
      matches: [[user.id, user.id]],
    };
    const success = await graphQlApi.matchUsers(input2, adminContext);
    expect(success).toBe(false);
  });

  test("should not allow match if user.availableDays not set", async () => {
    const input1 = createUserInput();
    const input2 = createUserInput();
    const user1 = await graphQlApi.createUser(input1, adminContext);
    const user2 = await graphQlApi.createUser(input2, adminContext);
    const input3 = {
      matches: [[user1.id, user2.id]],
    };
    const success = await graphQlApi.matchUsers(input3, adminContext);
    expect(success).toBe(false);
  });

  test("should not allow match if user.location not set", async () => {
    const params = {
      availableDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
      },
    };
    const input1 = createUserInput(params);
    const input2 = createUserInput(params);
    const user1 = await graphQlApi.createUser(input1, adminContext);
    const user2 = await graphQlApi.createUser(input2, adminContext);
    const input3 = {
      matches: [[user1.id, user2.id]],
    };
    const success = await graphQlApi.matchUsers(input3, adminContext);
    expect(success).toBe(false);
  });

  test("should not allow match if users are too far apart", async () => {
    const params = {
      availableDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
      },
    };
    const loc1 = {
      lat: 10,
      lng: 10,
      key: "TEST",
      formattedAddress: "TEST",
    };
    const loc2 = {
      lat: 50,
      lng: 50,
      key: "TEST",
      formattedAddress: "TEST",
    };
    const input1 = createUserInput({
      ...params,
      location: loc1,
    });
    const input2 = createUserInput({
      ...params,
      location: loc2,
    });
    const user1 = await graphQlApi.createUser(input1, adminContext);
    const user2 = await graphQlApi.createUser(input2, adminContext);
    const input3 = {
      matches: [[user1.id, user2.id]],
    };
    const success = await graphQlApi.matchUsers(input3, adminContext);
    expect(success).toBe(false);
  });

  test("should succeed with valid input", async () => {
    const params = {
      matchEveryWeek: true,
      availableDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
      },
      location: {
        lat: 10,
        lng: 10,
        key: "TEST",
        formattedAddress: "TEST",
      },
    };
    const input1 = createUserInput(params);
    const input2 = createUserInput(params);
    const user1 = await graphQlApi.createUser(input1, adminContext);
    const user2 = await graphQlApi.createUser(input2, adminContext);
    const input3 = {
      matches: [[user1.id, user2.id]],
    };
    const success = await graphQlApi.matchUsers(input3, adminContext);
    expect(success).toBe(true);
  });

  test("should allow a user to be matched multiple times", async () => {
    const params = {
      matchEveryWeek: true,
      availableDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
      },
      location: {
        lat: 10,
        lng: 10,
        key: "TEST",
        formattedAddress: "TEST",
      },
    };
    const input1 = createUserInput(params);
    const input2 = createUserInput(params);
    const input3 = createUserInput(params);
    const user1 = await graphQlApi.createUser(input1, adminContext);
    const user2 = await graphQlApi.createUser(input2, adminContext);
    const user3 = await graphQlApi.createUser(input3, adminContext);
    const input4 = {
      matches: [[user1.id, user2.id], [user1.id, user3.id]],
    };
    const success = await graphQlApi.matchUsers(input4, adminContext);
    expect(success).toBe(true);
  });

  test("should send emails to users", async () => {
    const params = {
      availableDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
      },
      location: {
        lat: 10,
        lng: 10,
        key: "TEST",
        formattedAddress: "TEST",
      },
    };
    const input1 = createUserInput(params);
    const input2 = createUserInput(params);
    const user1 = await graphQlApi.createUser(input1, adminContext);
    const user2 = await graphQlApi.createUser(input2, adminContext);
    const input3 = {
      matches: [[user1.id, user2.id]],
    };
    const success = await graphQlApi.matchUsers(input3, adminContext);
    expect(success).toBe(true);
    const [email] = await getEmails();
    expect(onNewEmail).toHaveBeenCalledTimes(1);
    const { to, from, subject } = email.headers;
    const { noreplyAddress } = config.email;
    const hasCorrectRecipients = to =>
      to.includes(user1.email) && to.includes(user2.email);
    expect(hasCorrectRecipients(to)).toBe(true);
    expect(from).toBe(noreplyAddress);
    expect(subject).toBe(EMAIL_SUBJECT_MATCH_SUCCESS);
    expect(email.html.includes("Availability")).toBe(true);
  });

  test("should allow partial failures", async () => {
    const BAD_ID = "401bbcaf5b3b4b23bc6af9bb5b3a5ef4";
    const params = {
      availableDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
      },
      location: {
        lat: 10,
        lng: 10,
        key: "TEST",
        formattedAddress: "TEST",
      },
    };
    const input1 = createUserInput(params);
    const input2 = createUserInput(params);
    const input3 = createUserInput({ ...params, role: "ADMIN" });
    const user1 = await graphQlApi.createUser(input1, adminContext);
    const user2 = await graphQlApi.createUser(input2, adminContext);
    const user3 = await graphQlApi.createUser(input3, adminContext);
    const input4 = {
      matches: [[user1.id, user2.id], [BAD_ID, BAD_ID]],
    };
    const success = await graphQlApi.matchUsers(input4, adminContext);
    expect(success).toBe(false);
    const emails = await getEmails();
    expect(onNewEmail).toHaveBeenCalledTimes(2);
    const [successEmail] = emails.filter(
      email => email.subject === EMAIL_SUBJECT_MATCH_SUCCESS,
    );
    const [errorEmail] = emails.filter(
      email => email.subject === EMAIL_SUBJECT_ADMIN_ERROR,
    );
    const { noreplyAddress } = config.email;
    const hasCorrectRecipients = to =>
      to.includes(user1.email) && to.includes(user2.email);
    expect(hasCorrectRecipients(successEmail.headers.to)).toBe(true);
    expect(errorEmail.headers.to.includes(user3.email)).toBe(true);
    expect(successEmail.headers.from).toBe(noreplyAddress);
    expect(errorEmail.headers.from).toBe(noreplyAddress);
    expect(successEmail.html.includes("Availability")).toBe(true);
    expect(errorEmail.html.includes("Error")).toBe(true);
  });

  test("should send an email to all admins on error", async () => {
    const BAD_ID = "401bbcaf5b3b4b23bc6af9bb5b3a5ef4";
    const input1 = createUserInput({ role: "ADMIN" });
    const input2 = createUserInput({ role: "ADMIN" });
    const user1 = await graphQlApi.createUser(input1, adminContext);
    const user2 = await graphQlApi.createUser(input2, adminContext);
    const input3 = {
      matches: [[BAD_ID, BAD_ID]],
    };
    const success = await graphQlApi.matchUsers(input3, adminContext);
    expect(success).toBe(false);
    const emails = await getEmails();
    expect(onNewEmail).toHaveBeenCalledTimes(1);
    const [errorEmail] = emails.filter(
      email => email.subject === EMAIL_SUBJECT_ADMIN_ERROR,
    );
    const { noreplyAddress } = config.email;
    const hasCorrectRecipients = to =>
      to.includes(user1.email) && to.includes(user2.email);
    expect(hasCorrectRecipients(errorEmail.headers.to)).toBe(true);
    expect(errorEmail.headers.from).toBe(noreplyAddress);
    expect(errorEmail.html.includes("Error")).toBe(true);
  });

  test("should reset user.availableDays field", async () => {
    const params = {
      availableDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
      },
      location: {
        lat: 10,
        lng: 10,
        key: "TEST",
        formattedAddress: "TEST",
      },
    };
    const input1 = createUserInput(params);
    const input2 = createUserInput(params);
    const user1 = await graphQlApi.createUser(input1, adminContext);
    const user2 = await graphQlApi.createUser(input2, adminContext);
    const input3 = {
      matches: [[user1.id, user2.id]],
    };
    const success = await graphQlApi.matchUsers(input3, adminContext);
    expect(success).toBe(true);
    const input4 = { filter: { id: user1.id }, pagination: {} };
    const { edges: edges1 } = await graphQlApi.getUsersByProps(
      input4,
      adminContext,
    );
    const updatedUser1 = edges1[0].node;
    const input5 = { filter: { id: user2.id }, pagination: {} };
    const { edges: edges2 } = await graphQlApi.getUsersByProps(
      input5,
      adminContext,
    );
    const updatedUser2 = edges2[0].node;
    const hasAvailableDay = user =>
      Object.values(user.availableDays).includes(true);
    expect(hasAvailableDay(updatedUser1)).toBe(false);
    expect(hasAvailableDay(updatedUser2)).toBe(false);
  });

  test("should not reset user.availableDays field if matchEveryWeek=true", async () => {
    const params = {
      availableDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
      },
      location: {
        lat: 10,
        lng: 10,
        key: "TEST",
        formattedAddress: "TEST",
      },
    };
    const input1 = createUserInput(params);
    const input2 = createUserInput({ ...params, matchEveryWeek: true });
    const user1 = await graphQlApi.createUser(input1, adminContext);
    const user2 = await graphQlApi.createUser(input2, adminContext);
    const input3 = {
      matches: [[user1.id, user2.id]],
    };
    const success = await graphQlApi.matchUsers(input3, adminContext);
    expect(success).toBe(true);
    const input4 = { filter: { id: user1.id }, pagination: {} };
    const { edges: edges1 } = await graphQlApi.getUsersByProps(
      input4,
      adminContext,
    );
    const updatedUser1 = edges1[0].node;
    const input5 = { filter: { id: user2.id }, pagination: {} };
    const { edges: edges2 } = await graphQlApi.getUsersByProps(
      input5,
      adminContext,
    );
    const updatedUser2 = edges2[0].node;
    const hasAvailableDay = user =>
      Object.values(user.availableDays).includes(true);
    expect(hasAvailableDay(updatedUser1)).toBe(false);
    expect(hasAvailableDay(updatedUser2)).toBe(true);
  });
});
