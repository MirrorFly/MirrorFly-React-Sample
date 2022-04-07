import { Component } from "react";
import { connect } from "react-redux";
import { getArchivedChats, getMutedChats } from "../../../Helpers/Chat/ChatHelper";
import { DEFAULT_TITLE_NAME } from "../../../Helpers/Chat/Constant";

class Title extends Component {
  constructor(props) {
    super(props);
    localStorage.setItem("unreadMessageCount", 0);
    this.state = {
      count: 0,
      defaultTitle: DEFAULT_TITLE_NAME
    };
  }

  handleUnreadCount = () => {
    const { unreadCountData: { unreadDataObj = {} } = {} } = this.props;
    const mutedChats = getMutedChats(),
      archivedChats = getArchivedChats();
    const disabledChats = [...mutedChats, ...archivedChats];
    const unReadUserArr = Object.keys(unreadDataObj).filter((n) => !disabledChats.includes(n));

    if (this.state.count !== unReadUserArr.length) {
      this.setState(
        {
          count: unReadUserArr.length
        },
        () => {
          localStorage.setItem("unreadMessageCount", this.state.count);
        }
      );
    }
  };

  componentDidMount() {
    this.handleUnreadCount();
  }

  componentDidUpdate(prevProps) {
    this.handleUnreadCount();
  }

  render() {
    const { count, defaultTitle } = this.state;
    const notifyCount = count ? `(${count}) ${defaultTitle}` : defaultTitle;
    document.title = notifyCount;
    return true;
  }
}

const mapStateToProps = (state, props) => {
  return {
    unreadCountData: state.unreadCountData,
    commonData: state?.commonData,
    recentChatData: state.recentChatData
  };
};

export default connect(mapStateToProps, null)(Title);
