const profilePhoto = "https://photo.com";

const locationA = {
  lat: 11.11,
  lng: 11.11,
  key: "TEST_KEY_A",
  formattedAddress: "TEST_ADDRESS_A",
};

const locationB = {
  lat: 22.22,
  lng: 22.22,
  key: "TEST_KEY_B",
  formattedAddress: "TEST_ADDRESS_B",
};

const allDaysUnavailable = {
  monday: false,
  tuesday: false,
  wednesday: false,
  thursday: false,
  friday: false,
};

const slackTeamA = {
  slackApiId: "AAAAAA",
  name: "SLACK_TEAM_A",
};

const slackTeamB = {
  slackApiId: "BBBBBB",
  name: "SLACK_TEAM_B",
};

const Mike = {
  name: "Mike",
  email: "mike@test.slacklunch.club",
  profilePhoto,
  slackTeamId: slackTeamA.slackApiId,
  location: locationA,
  availableDays: {
    ...allDaysUnavailable,
    monday: true,
  },
};

const Jon = {
  name: "Jon",
  email: "jon@test.slacklunch.club",
  profilePhoto,
  slackTeamId: slackTeamA.slackApiId,
  location: locationA,
  availableDays: {
    ...allDaysUnavailable,
    monday: true,
  },
};

const Tim = {
  name: "Tim",
  email: "tim@test.slacklunch.club",
  profilePhoto,
  slackTeamId: slackTeamA.slackApiId,
  location: locationA,
  availableDays: {
    ...allDaysUnavailable,
    tuesday: true,
  },
};

const Sarah = {
  name: "Sarah",
  email: "sarah@test.slacklunch.club",
  profilePhoto,
  slackTeamId: slackTeamA.slackApiId,
  location: locationA,
  availableDays: {
    ...allDaysUnavailable,
    wednesday: true,
    thursday: true,
  },
};

const Jill = {
  name: "Jill",
  email: "jill@test.slacklunch.club",
  profilePhoto,
  slackTeamId: slackTeamA.slackApiId,
  location: locationA,
  availableDays: {
    ...allDaysUnavailable,
    wednesday: true,
    friday: true,
  },
};

const Jess = {
  name: "Jess",
  email: "jess@test.slacklunch.club",
  profilePhoto,
  slackTeamId: slackTeamB.slackApiId,
  location: locationB,
  matchEveryWeek: true,
  availableDays: {
    ...allDaysUnavailable,
    monday: true,
  },
};

const Rob = {
  name: "Rob",
  email: "rob@test.slacklunch.club",
  profilePhoto,
  slackTeamId: slackTeamB.slackApiId,
  location: locationB,
  matchEveryWeek: true,
  availableDays: {
    ...allDaysUnavailable,
    monday: true,
  },
};

const Nick = {
  name: "Nick",
  email: "nick@test.slacklunch.club",
  profilePhoto,
  slackTeamId: slackTeamB.slackApiId,
  location: locationB,
  matchEveryWeek: true,
  availableDays: {
    ...allDaysUnavailable,
    monday: true,
  },
};

const Jane = {
  name: "Jane",
  email: "jane@test.slacklunch.club",
  profilePhoto,
  slackTeamId: slackTeamB.slackApiId,
  location: locationB,
  availableDays: {
    ...allDaysUnavailable,
    tuesday: true,
    thursday: true,
  },
};

const Kate = {
  name: "Kate",
  email: "kate@test.slacklunch.club",
  profilePhoto,
  slackTeamId: slackTeamB.slackApiId,
  location: locationB,
  availableDays: {
    ...allDaysUnavailable,
    tuesday: true,
    thursday: true,
  },
};

module.exports = {
  users: [Mike, Jon, Rob, Nick, Tim, Sarah, Jill, Jane, Kate, Jess],
  slackTeams: [slackTeamA, slackTeamB],
};
