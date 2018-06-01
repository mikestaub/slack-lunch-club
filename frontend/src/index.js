import React from "react";
import ReactDOM from "react-dom";
import ReactGA from "react-ga";

import "reset-css";
import "./index.css";

import App from "./components/App";

ReactGA.initialize(process.env.REACT_APP_GOOGLE_ANALYTICS_ID);
ReactGA.ga("require", "displayfeatures");

// TODO: use Raven npm module
// eslint-disable-next-line no-undef
Raven.config(process.env.REACT_APP_SENTRY_URL).install();

ReactDOM.render(<App />, document.getElementById("root"));

// TODO: https://github.com/facebookincubator/create-react-app/pull/2304
if (module.hot) {
  module.hot.accept();
}
