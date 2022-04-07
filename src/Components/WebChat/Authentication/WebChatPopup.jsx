import React from "react";
import { logout } from "../../../Helpers/Utility";
import "./logout.scss";

class WebChatPopup extends React.Component {
  /**
   * WebChatPopup Component.
   *
   * @param {object} props
   */
  constructor(props) {
    super(props);
    this.handleLogoutCancel = this.handleLogoutCancel.bind(this);
  }

  /**
   * handleLogout() Method to call the logout() in Utility
   */
  handleLogout = () => {
    logout();
  };

  /**
   * handleLogoutCancel() Method to perform cancel the logout option.
   */
  handleLogoutCancel() {
    this.props.logoutStatus(false);
  }

  /**
   * render() method to render the WebChatPopup component render into browser.
   */
  render() {
    return (
      <div className="userprofile logout">
        <div className="logout-popup">
          <div className="logout-label">
            <label>{"Are you sure you want to logout?"}</label>
          </div>
          <div className="logout-noteinfo">
            <button
              type="button"
              name="btn-cancel"
              className="btn-cancel"
              data-id={"jesthandleLogoutCancel"}
              onClick={this.handleLogoutCancel}>
              {"Cancel"}
            </button>
            <button
              type="button"
              name="btn-logout"
              className="btn-logout"
              data-id={"jesthandleLogout"}
              onClick={this.handleLogout}>
              {"Logout"}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default WebChatPopup;
