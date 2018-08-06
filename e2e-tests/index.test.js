import puppeteer from "puppeteer";

const REQUEST_TIMEOUT = 3000;
const DEBUG = false;
let page;
let browser;

beforeAll(async () => {
  jest.setTimeout(60000);

  const opts = {
    headless: true,
    args: ["--no-sandbox"],
    ignoreHTTPSErrors: process.env.NODE_ENV === "development",
  };

  browser = await puppeteer.launch(opts);
  page = await browser.newPage();

  patchPage(page);

  page.on("error", handleError);
  page.on("pageerror", handleError);

  if (DEBUG) {
    page.on("console", logConsole);
  }

  await page.goto(process.env.TEST_URL, {
    waitUntil: "networkidle0",
  });
});

afterAll(async () => {
  await browser.close();
});

describe("Basic functionality", () => {
  test("A user can login with slack", async () => {
    const signInButton = "#sign-in-with-slack";
    const oauthButton = "button[id=oauth_authorizify]";
    const domainInput = "#domain";
    const domainName = "slack-lunch-club";
    const continueButton = "#submit_team_domain";
    const emailInput = "input[id=email]";
    const passwordInput = "input[id=password]";
    const email = "test_email@slacklunch.club";
    const password = "slacklunchclubtest";
    const submitButton = "button[id=signin_btn]";

    await Promise.all([page.waitForNavigation(), page.click(signInButton)]);

    // slack oauth flow
    await page.waitFor(domainInput);
    await page.type(domainInput, domainName);
    await Promise.all([page.waitForNavigation(), page.click(continueButton)]);

    // enter credentials
    await page.waitFor(emailInput);
    await page.type(emailInput, email);
    await page.type(passwordInput, password);
    await Promise.all([page.waitForNavigation(), page.click(submitButton)]);

    // grant app access
    await page.waitFor(oauthButton);
    await Promise.all([page.waitForNavigation(), page.click(oauthButton)]);
  });

  test("A user can update their profile", async () => {
    const dayCheckbox = "li";
    const locationInput = "input[placeholder='Enter your work address']";
    const location = "one market street";
    const submitButton = "button[id=main-form-submit]";
    const enterKey = String.fromCharCode(13);

    await page.waitFor(locationInput);
    await page.waitFor(dayCheckbox);
    await page.waitFor(submitButton);
    await page.click(dayCheckbox);
    await page.type(locationInput, location);
    await page.focus(locationInput);
    await page.keyboard.press(enterKey);
    await page.click(submitButton);
    await page.waitFor(REQUEST_TIMEOUT);
  });
});

// TODO: page.type is buggy as of puppeteer@1.4.0
function patchPage(page) {
  page.type = async (selector, value) => {
    return page.evaluate(
      // eslint-disable-next-line no-undef
      (sel, val) => (document.querySelector(sel).value = val),
      selector,
      value,
    );
  };
}

function handleError(error) {
  // eslint-disable-next-line no-console
  console.error(error.toString());
}

function logConsole(msg) {
  const line = `${msg["_type"]}: ${msg["_text"]}`;
  // eslint-disable-next-line no-console
  console.log(line);
}
