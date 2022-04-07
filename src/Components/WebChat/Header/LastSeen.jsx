import React, { Component } from "react";
import { connect } from "react-redux";
import "../../../assets/scss/common.scss";
import SDK from "../../SDK";
import { getLastseen } from "../WebChatTimeStamp";
import { LastActivityDataAction } from '../../../Actions/LastActivityDataAction';
import Store from '../../../Store';
import { formatUserIdToJid } from '../../../Helpers/Chat/User';
import { USER_PRESENCE_STATUS_OFFLINE, USER_PRESENCE_STATUS_ONLINE } from '../../../Helpers/Chat/Constant';

class LastSeen extends Component {
  /**
   * Following are the states used in LastSeen Component.
   * @param {object} lastSeen last actvity of user.
   *
   */
  constructor(props) {
    super(props);
    this.state = {
      seconds: -1,
      lastSeen: "",
      userPresenceStatus: ""
    };
    this.timer = 0;
  }

  /**
   * componentDidMount is one of the react lifecycle method. <br />
   *
   * In this method to handle the last activity of a contact.
   */
  async componentDidMount() {
    const { jid } = this.props;
    if (jid) {
      this.updateLastSeen(jid);
    }
  }

  /**
   * componentDidUpdate is one of the react lifecycle method. <br />
   *
   * In this method to handle the last activity of a contact.
   *
   * @param {object} prevProps
   * @param {object} prevState
   */
  async componentDidUpdate(prevProps, prevState) {
    const userJid = formatUserIdToJid(this.props.jid);
    if (prevProps.jid !== this.props.jid) {
      this.updateLastSeen(this.props.jid);
    }
    // If user presence changes, then need to update the last seen data
    const {fromUserJid, status} = this.props.presenceData;
    
    if(fromUserJid === userJid && status !== this.state.userPresenceStatus){
      if(status === USER_PRESENCE_STATUS_OFFLINE){
        this.timer = setTimeout(async () => {
            this.updateLastSeen(userJid, status);
          }, 500);
      }
      else{
        this.updateLastSeen(userJid, status);
      }
    }

    if(this.props.contactsWhoBlockedMe.id !== prevProps.contactsWhoBlockedMe.id || this.props.blockedContact.id !== prevProps.blockedContact.id){
      this.updateLastSeen(userJid);
    }

    if(this.props.isAppOnline !== prevProps.isAppOnline){
      if(!this.props.isAppOnline && this.state.userPresenceStatus === USER_PRESENCE_STATUS_ONLINE){
        this.updateLastSeen(userJid, undefined, 1);
      }

      if(this.props.isAppOnline && this.state.userPresenceStatus === USER_PRESENCE_STATUS_OFFLINE){
        this.updateLastSeen(userJid);
      }
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  isUserBlocked = (userJid) => {
    userJid = formatUserIdToJid(userJid);
    const blockedContact = this.props.blockedContact.data;
    const contactsWhoBlockedMe = this.props.contactsWhoBlockedMe.data;
    return blockedContact.indexOf(userJid) > -1 || contactsWhoBlockedMe.indexOf(userJid) > -1;
  }

  getLastSeenSeconds = async (userJid) => {
    if(!userJid) return -1;
    userJid = formatUserIdToJid(userJid);
    const lastSeenRes = await SDK.getLastSeen(userJid);
    if(lastSeenRes && lastSeenRes.statusCode === 200){
      Store.dispatch(LastActivityDataAction(lastSeenRes.data));
      return lastSeenRes?.data?.seconds;
    }
    return -1;
  }

  updateLastSeen = async (userJid, userPresenceStatus, lastSeenSeconds) => {
    if(!userJid) return;
    userJid = formatUserIdToJid(userJid);
    let seconds = this.state.seconds;
    let lastSeen = '';
    if(!this.isUserBlocked(userJid)){
      seconds = lastSeenSeconds || await this.getLastSeenSeconds(userJid);
      lastSeen = seconds !== -1 ? getLastseen(seconds) : '';
    }
    userPresenceStatus = userPresenceStatus || (seconds > 0 ? USER_PRESENCE_STATUS_OFFLINE : USER_PRESENCE_STATUS_ONLINE);
    this.setState({seconds, lastSeen, userPresenceStatus});
  }

  /**
   * render() method to render the LastSeen component into browser.
   */
  render() {
    return <h6>{this.state.lastSeen}</h6>;
  }
}

/**
 * mapping redux data into LastSeen component properties.
 */
const mapStateToProps = (state) => {
  return {
    lastActivity: state.lastActivityData,
    presenceData: (state.presenceData && state.presenceData.data) || {},
    // blockStatusData: state.blockStatus,
    blockedContact: state.blockedContact,
    contactsWhoBlockedMe: state.contactsWhoBlockedMe,
    isAppOnline: state?.appOnlineStatus?.isOnline
  };
};

export default connect(mapStateToProps, null)(LastSeen);
