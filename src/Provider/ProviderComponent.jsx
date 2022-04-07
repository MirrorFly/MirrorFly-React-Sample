import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Store from "../Store";
import Login from "../Components/Layouts/Login";
import "../assets/scss/common.scss";
import "../assets/scss/responsive.scss";
import "toastr/build/toastr.min.css";
import HelpComponent from "../Components/Layouts/HelpComponent";
const createHistory = require("history").createBrowserHistory;
export const history = createHistory();

function ProviderComponent() {
  return (
    <Provider store={Store}>
      <Router history={history}>
        <Switch>
          <Route exact={true} path="/" component={Login} />
          <Route exact={true} path="/:roomLink" component={Login} />
          <Route path="/help" component={HelpComponent} />
        </Switch>
      </Router>
    </Provider>
  );
}

export default ProviderComponent;
