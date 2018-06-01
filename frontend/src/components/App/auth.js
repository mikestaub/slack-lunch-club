import cookies from "js-cookie";

const TOKEN = "token";

const auth = {
  slackLogin() {
    const backendApiUrl = process.env.REACT_APP_BACKEND_API_URL;
    const redirectUri = `${backendApiUrl}/auth/slack?returnTo=${
      window.location.href
    }`;
    window.location.href = redirectUri;
  },

  isLoggedIn() {
    if (!window.localStorage.getItem(TOKEN)) {
      // cookies might have been set by OAuth redirect
      const token = cookies.get(TOKEN);
      if (!token) {
        return false;
      }
      window.localStorage.setItem(TOKEN, token);
      cookies.remove(TOKEN);
    }
    return true;
  },

  logOut() {
    window.localStorage.removeItem(TOKEN);
    // TODO: why is setTimeout needed for safari?
    setTimeout(() => {
      window.location.href = "/";
    }, 100);
  },
};

class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = value.toString();
  }

  removeItem(key) {
    delete this.store[key];
  }
}

if (!window.localStorage) {
  // needed for tests
  window.localStorage = new LocalStorageMock();
}

export default auth;
