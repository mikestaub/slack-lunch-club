import promiseEach from "p-each-series";

import TestSuiteUtils from "../utils";
import seedData from "./seedData";

const utils = new TestSuiteUtils();
utils.setupJest();

let adminContext = null;
let graphQlApi = null;
let getEmails = null;
let onNewEmail = null;
let config = null;
let matcher = null;
beforeAll(() => {
  adminContext = utils.adminContext;
  graphQlApi = utils.graphQlApi;
  getEmails = utils.getEmails;
  onNewEmail = utils.onNewEmail;
  config = utils.config;
  matcher = utils.matcher;
});

const EMAIL_SUBJECT_MATCH_SUCCESS = "Your Slack Lunch Club match is here!";
const EMAIL_SUBJECT_MATCH_FAIL = "Sorry, no Slack Lunch Club this week. :(";

async function populateDatabase(seedData) {
  const { users, slackTeams } = seedData;
  return promiseEach(users, async userInput => {
    const [slackTeamInput] = slackTeams.filter(item => {
      return item.slackApiId === userInput.slackTeamId;
    });
    const input1 = utils.createUserInput(userInput);
    const input2 = utils.createSlackTeamInput(slackTeamInput);
    delete input1.slackTeamId;
    const user = await graphQlApi.createUser(input1, adminContext);
    const slackTeam = await graphQlApi.getOrCreateSlackTeam(
      input2,
      adminContext,
    );
    const input3 = {
      userId: user.id,
      slackTeamId: slackTeam.id,
    };
    await graphQlApi.addToSlackTeam(input3, adminContext);
  });
}

function sentMatchEmail(emails, user1, user2) {
  const [email] = emails.filter(email => {
    const { to, from } = email.headers;
    const { subject } = email;
    return (
      to.includes(user1.email) &&
      to.includes(user2.email) &&
      from === config.email.noreplyAddress &&
      subject === EMAIL_SUBJECT_MATCH_SUCCESS
    );
  });
  return Boolean(email);
}

async function resetLastEmailSent(users) {
  return promiseEach(users, async user => {
    const foundUser = await graphQlApi.getOrCreateUser(user, adminContext);
    const input = {
      id: foundUser.id,
      lastMatchEmailSent: null,
    };
    await graphQlApi.updateUser(input, adminContext);
  });
}

function sentUnmatchEmail(emails, ...users) {
  return users.reduce((acc, user) => {
    const [email] = emails.filter(email => {
      const { to, from } = email.headers;
      return (
        to.includes(user.email) &&
        from === config.email.noreplyAddress &&
        email.subject === EMAIL_SUBJECT_MATCH_FAIL
      );
    });
    return acc && Boolean(email);
  }, true);
}

describe("matcher function", () => {
  test("should send correct emails to all users", async () => {
    const [
      Mike,
      Jon,
      Rob,
      Nick,
      Tim,
      Sarah,
      Jill,
      Jane,
      Kate,
      Jess,
    ] = seedData.users;
    await populateDatabase(seedData);
    const success = await matcher.handleEvent();
    expect(success).toBe(true);
    const emails = await getEmails();
    expect(onNewEmail).toHaveBeenCalledTimes(6);
    const sentMatch1 = sentMatchEmail(emails, Mike, Jon);
    const sentMatch2 = sentMatchEmail(emails, Sarah, Jill);
    const sentMatch3 = sentMatchEmail(emails, Jess, Nick);
    const sentMatch4 = sentMatchEmail(emails, Jess, Rob);
    const sentMatch5 = sentMatchEmail(emails, Nick, Rob);
    const sentMatch6 = sentMatchEmail(emails, Kate, Jane);
    const sentUnmatch1 = sentUnmatchEmail(emails, Tim);
    const sentUnmatch2 = sentUnmatchEmail(emails, Rob);
    const sentUnmatch3 = sentUnmatchEmail(emails, Nick);
    const sentUnmatch4 = sentUnmatchEmail(emails, Jess);
    expect(sentMatch1).toBe(true);
    expect(sentMatch2).toBe(true);
    expect(sentMatch3 || sentMatch4 || sentMatch5).toBe(true);
    expect(sentMatch6).toBe(true);
    expect(sentUnmatch1).toBe(true);
    if (sentMatch3) {
      expect(sentUnmatch2).toBe(true);
    }
    if (sentMatch4) {
      expect(sentUnmatch3).toBe(true);
    }
    if (sentMatch5) {
      expect(sentUnmatch4).toBe(true);
    }
  });

  test("should not send emails on immediate second run", async () => {
    await populateDatabase(seedData);
    const success1 = await matcher.handleEvent();
    await getEmails();
    onNewEmail.mockClear();
    const success2 = await matcher.handleEvent();
    expect(success1).toBe(true);
    expect(success2).toBe(true);
    const emails = await getEmails();
    expect(emails.length).toBe(0);
    expect(onNewEmail).toHaveBeenCalledTimes(0);
  });

  test("should send correct emails to all users on second run after 1 week has past", async () => {
    const [
      Mike,
      Jon,
      Rob,
      Nick,
      Tim,
      Sarah,
      Jill,
      Jane,
      Kate,
      Jess,
    ] = seedData.users;
    await populateDatabase(seedData);
    const success1 = await matcher.handleEvent();
    onNewEmail.mockClear();
    await resetLastEmailSent(seedData.users);
    const success2 = await matcher.handleEvent();
    expect(success1).toBe(true);
    expect(success2).toBe(true);
    const emails = await getEmails();
    expect(onNewEmail).toHaveBeenCalledTimes(9);
    const sentMatch1 = sentMatchEmail(emails, Jess, Nick);
    const sentMatch2 = sentMatchEmail(emails, Jess, Rob);
    const sentMatch3 = sentMatchEmail(emails, Nick, Rob);
    const sentUnmatch1 = sentUnmatchEmail(
      emails,
      Mike,
      Jon,
      Tim,
      Sarah,
      Jill,
      Jane,
      Kate,
    );
    const sentUnmatch2 = sentUnmatchEmail(emails, Rob);
    const sentUnmatch3 = sentUnmatchEmail(emails, Nick);
    const sentUnmatch4 = sentUnmatchEmail(emails, Jess);
    expect(sentMatch1 || sentMatch2 || sentMatch3).toBe(true);
    if (sentMatch1) {
      expect(sentUnmatch2).toBe(true);
    }
    if (sentMatch2) {
      expect(sentUnmatch3).toBe(true);
    }
    if (sentMatch3) {
      expect(sentUnmatch4).toBe(true);
    }
    expect(sentUnmatch1).toBe(true);
  });
});
