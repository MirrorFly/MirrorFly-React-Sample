import { Component } from "react";
import { connect } from "react-redux";
import { getArchivedChats, getMutedChats } from "../../../Helpers/Chat/ChatHelper";
import { DEFAULT_TITLE_NAME } from "../../../Helpers/Chat/Constant";
import { encryptAndStoreInLocalStorage} from "../WebChatEncryptDecrypt";

class Title extends Component {
  constructor(props) {
    super(props);
    encryptAndStoreInLocalStorage("unreadMessageCount", 0);
    this.state = {
      count: 0,
      defaultTitle: DEFAULT_TITLE_NAME
    };
  }

  handleUnreadCount = () => {
    const { unreadCountData: { unreadDataObj = {} } = {},  UnreadUserObjData} = this.props;
    const mutedChats = getMutedChats(),
      archivedChats = getArchivedChats();
    const disabledChats = [...mutedChats, ...archivedChats];
    const unReadUserArr = Object.keys(unreadDataObj).filter((n) => !disabledChats.includes(n));
    setTimeout(()=>{
      let filteredArray = unReadUserArr.filter(item => !UnreadUserObjData[item] || UnreadUserObjData[item].count !== 0);
      if (this.state.count !== filteredArray.length) {
        this.setState(
          {
            count: filteredArray.length
          },
          () => {
            encryptAndStoreInLocalStorage("unreadMessageCount", this.state.count);
          }
        );
      }
    },10)
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
    recentChatData: state.recentChatData,
    UnreadUserObjData: state.UnreadUserObjData
  };
};

export default connect(mapStateToProps, null)(Title);
