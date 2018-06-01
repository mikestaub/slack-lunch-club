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

const EMAIL_SUBJECT_ADMIN_ERROR = "ERROR: There was a problem.";
const EMAIL_SUBJECT_MATCH_FAIL = "Sorry, no Slack Lunch Club this week. :(";

describe("notifyUnmatchedUsers mutation", () => {
  test("should fail if not authorized", async () => {
    const input1 = createUserInput();
    const user = await graphQlApi.createUser(input1, adminContext);
    const input2 = {
      userIds: [user.id],
    };
    const badContext = {};
    await expect(
      graphQlApi.notifyUnmatchedUsers(input2, badContext),
    ).rejects.toThrow();
  });

  test("should fail on invalid input", async () => {
    const input = {
      badKey: [],
    };
    await expect(
      graphQlApi.notifyUnmatchedUsers(input, adminContext),
    ).rejects.toThrow();
  });

  test("should succeed with valid input", async () => {
    const input1 = createUserInput();
    const user = await graphQlApi.createUser(input1, adminContext);
    const input2 = {
      userIds: [user.id],
    };
    const success = await graphQlApi.notifyUnmatchedUsers(input2, adminContext);
    expect(success).toBe(true);
  });

  test("should send emails to users", async () => {
    const input1 = createUserInput();
    const input2 = createUserInput();
    const user1 = await graphQlApi.createUser(input1, adminContext);
    const user2 = await graphQlApi.createUser(input2, adminContext);
    const input3 = {
      userIds: [user1.id, user2.id],
    };
    const success = await graphQlApi.notifyUnmatchedUsers(input3, adminContext);
    expect(success).toBe(true);
    expect(onNewEmail).toHaveBeenCalledTimes(2);
    const emails = await getEmails();
    const [user1Email] = emails.filter(
      email => email.headers.to === user1.email,
    );
    const [user2Email] = emails.filter(
      email => email.headers.to === user2.email,
    );
    expect(user1Email.subject).toBe(EMAIL_SUBJECT_MATCH_FAIL);
    expect(user2Email.subject).toBe(EMAIL_SUBJECT_MATCH_FAIL);
    expect(user1Email.html).not.toBe(undefined);
    expect(user2Email.html).not.toBe(undefined);
  });

  test("should allow partial failures", async () => {
    const BAD_ID = "401bbcaf-5b3b-4b23-bc6a-f9bb5b3a5ef4";
    const input1 = createUserInput();
    const input2 = createUserInput({ role: "ADMIN" });
    const user1 = await graphQlApi.createUser(input1, adminContext);
    const user2 = await graphQlApi.createUser(input2, adminContext);
    const input3 = {
      userIds: [user1.id, BAD_ID],
    };
    const success = await graphQlApi.notifyUnmatchedUsers(input3, adminContext);
    expect(success).toBe(false);
    const emails = await getEmails();
    expect(onNewEmail).toHaveBeenCalledTimes(2);
    const [failEmail] = emails.filter(
      email => email.subject === EMAIL_SUBJECT_MATCH_FAIL,
    );
    const [errorEmail] = emails.filter(
      email => email.subject === EMAIL_SUBJECT_ADMIN_ERROR,
    );
    const { noreplyAddress } = config.email;
    expect(failEmail.headers.to.includes(user1.email)).toBe(true);
    expect(errorEmail.headers.to.includes(user2.email)).toBe(true);
    expect(failEmail.headers.from).toBe(noreplyAddress);
    expect(errorEmail.headers.from).toBe(noreplyAddress);
    expect(failEmail.html).not.toBe(undefined);
    expect(errorEmail.html.includes("Error")).toBe(true);
  });

  test("should send an email to all admins on error", async () => {
    const BAD_ID = "401bbcaf5b3b4b23bc6af9bb5b3a5ef4";
    const input1 = createUserInput({ role: "ADMIN" });
    const input2 = createUserInput({ role: "ADMIN" });
    const user1 = await graphQlApi.createUser(input1, adminContext);
    const user2 = await graphQlApi.createUser(input2, adminContext);
    const input3 = {
      userIds: [BAD_ID],
    };
    const success = await graphQlApi.notifyUnmatchedUsers(input3, adminContext);
    expect(success).toBe(false);
    const [email] = await getEmails();
    expect(onNewEmail).toHaveBeenCalledTimes(1);
    expect(email.subject).toBe(EMAIL_SUBJECT_ADMIN_ERROR);
    const hasCorrectRecipients = to =>
      to.includes(user1.email) && to.includes(user2.email);
    expect(hasCorrectRecipients(email.headers.to)).toBe(true);
    expect(email.headers.from).toBe(config.email.noreplyAddress);
    expect(email.html.includes("Error")).toBe(true);
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
    };
    const input1 = createUserInput(params);
    const user = await graphQlApi.createUser(input1, adminContext);
    const input2 = {
      userIds: [user.id],
    };
    const success = await graphQlApi.notifyUnmatchedUsers(input2, adminContext);
    expect(success).toBe(true);
    const input3 = { filter: { id: user.id }, pagination: {} };
    const { edges } = await graphQlApi.getUsersByProps(input3, adminContext);
    const updatedUser = edges[0].node;
    const hasAvailableDay = Object.values(updatedUser.availableDays).includes(
      true,
    );
    expect(hasAvailableDay).toBe(false);
  });

  test("should not reset user.availableDays field if matchEveryWeek=true", async () => {
    const params = {
      matchEveryWeek: true,
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
      userIds: [user.id],
    };
    const success = await graphQlApi.notifyUnmatchedUsers(input2, adminContext);
    expect(success).toBe(true);
    const input3 = { filter: { id: user.id }, pagination: {} };
    const { edges } = await graphQlApi.getUsersByProps(input3, adminContext);
    const updatedUser = edges[0].node;
    const hasAvailableDay = Object.values(updatedUser.availableDays).includes(
      true,
    );
    expect(hasAvailableDay).toBe(true);
  });

  test("should update user.lastMatchEmailSent field if email sent", async () => {
    const input1 = createUserInput();
    const user = await graphQlApi.createUser(input1, adminContext);
    const input2 = {
      userIds: [user.id],
    };
    const beforeEmailSent = new Date();
    const success = await graphQlApi.notifyUnmatchedUsers(input2, adminContext);
    expect(success).toBe(true);
    const [email] = await getEmails();
    expect(onNewEmail).toHaveBeenCalledTimes(1);
    expect(email.headers.to.includes(user.email)).toBe(true);
    const input3 = { filter: { id: user.id }, pagination: {} };
    const { edges } = await graphQlApi.getUsersByProps(input3, adminContext);
    const updatedUser = edges[0].node;
    const lastMatchEmailSent = Date.parse(updatedUser.lastMatchEmailSent);
    expect(beforeEmailSent < lastMatchEmailSent).toBe(true);
  });
});
