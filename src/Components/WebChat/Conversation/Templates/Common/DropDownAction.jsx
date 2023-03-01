import React, { Component, Fragment, useState } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import { isSingleChat } from "../../../../../Helpers/Chat/ChatHelper";
import {
  DeleteMessage,
  Forward,
  MessageInfo,
  Reply,
  Starred,
  UnStar,
  DropDownload,
  IconReport
} from "../../../../../assets/images";
import { MEDIA_MESSAGE_TYPES } from "../../../../../Helpers/Constants";
import { useSelector } from "react-redux";

class WatchClickOutside extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  componentWillMount() {
    document.body.addEventListener("click", this.handleClick);
  }

  componentWillUnmount() {
    document.body.removeEventListener("click", this.handleClick);
  }

  handleClick(event) {
    const { container } = this.refs;
    const { onClickOutside } = this.props;
    const { target } = event;
    if (typeof onClickOutside !== "function") {
      return;
    }
    if (target !== container && !container.contains(target)) {
      onClickOutside(event);
    }
  }

  render() {
    return <div ref="container">{this.props.children}</div>;
  }
}

const DropDownComponent = (props = {}) => {
  const {
    action,
    msgId,
    recall,
    chatType = "",
    closeDropDown,
    messageInfoOptions = true,
    isSender,
    msgType,
    favouriteStatus,
  } = props;
  const featureStateData = useSelector((state) => state.featureStateData);
  const {
     isStarMessageEnabled = true,
     isDeleteMessageEnabled = true,
     isReportEnabled = true
    } = featureStateData;
  const issingleChat = isSingleChat(chatType);
  const container = document && document.getElementById("message-containner");
  const ClientHeight = container && container.clientHeight;
  const [dropposition, setDropPosition] = useState(false);

  React.useLayoutEffect(() => {
    var messagenew = document.getElementById(`${msgId}`);
    var dropDDOwn = document.querySelector(".menu-dropdown");
    if (!messagenew) return;
    if (ClientHeight - messagenew.getBoundingClientRect().top - 85 < dropDDOwn.getBoundingClientRect().height) {
      setDropPosition(true);
      let updateHeigth = dropDDOwn.getBoundingClientRect().height + 4;
      let heigth = `-${updateHeigth}px`;
      if (dropposition) {
        dropDDOwn.style.top = heigth;
      }
    } else {
      setDropPosition(false);
    }
    dropDDOwn.style.display = "block";
  }, [dropposition]);


  return (
    <OutsideClickHandler
      onOutsideClick={(e) => {
        setTimeout(() => {
          e.preventDefault();
          closeDropDown && closeDropDown();
        }, 100);
      }}
    >
      <ul
        style={{ display: "none", padding: recall ? 0 : "" }}
        className={`menu-dropdown open ${dropposition ? "popup-top" : ""}`}
        onClick={(event) => {
          action(event);
          event.stopPropagation();
        }}
      >
        {!recall && (
          <Fragment>
            <li className="reply" title="Reply">
              <i>
                <Reply />
              </i>
              <span>Reply</span>
            </li>
            <li className="forward" title="Forward">
              <i>
                <Forward />
              </i>
              <span>Forward</span>
            </li>

            {isStarMessageEnabled &&
              favouriteStatus === 0 ? (
                <li className="Starred" title="Starred">
                  <i>
                    <Starred />
                  </i>
                  <span>Star</span>
                </li>
              ) : isStarMessageEnabled && (
                <li className="Starred" title="UnStarred">
                  <i>
                    <UnStar />
                  </i>
                  <span>Unstar</span>
                </li>
              )
            }  
          </Fragment>
        )}

        {isDeleteMessageEnabled &&
          <li className="delete" title="Delete">
            <i>
              <DeleteMessage />
            </i>
            <span>Delete</span>
          </li>
        }

        {!issingleChat && !recall && !isSender && messageInfoOptions && (
          <li className="messageinfo 1" title="MessageInfo">
            <i>
              <MessageInfo />
            </i>{" "}
            <span>Message Info</span>
          </li>
        )}
        {MEDIA_MESSAGE_TYPES.includes(msgType) && (
          <li className="Download" title="Download">
            <i>
              <DropDownload />
            </i>{" "}
            <span>Download</span>
          </li>
        )}
        {isReportEnabled && isSender &&
          <li className="Report" title="Report">
            <i>
              <IconReport />
            </i>
            <span>Report</span>
          </li>
        }
      </ul>
    </OutsideClickHandler>
  );
};

export default React.memo((props) => {
  const {
    isSender = true,
    chatType = "",
    messageInfoOptions = true,
    recall,
    handleDropDown,
    msgid,
    msgType,
    favouriteStatus,
    messageAction = () => { },
    closeDropDown,
    messageObject
  } = props;

  return (
    <WatchClickOutside onClickOutside={handleDropDown}>
      <DropDownComponent
        closeDropDown={closeDropDown}
        msgId={msgid}
        recall={recall}
        isSender={isSender}
        chatType={chatType}
        action={messageAction}
        messageInfoOptions={messageInfoOptions}
        msgType={msgType}
        favouriteStatus={favouriteStatus}
        messageObject={messageObject}
      />
    </WatchClickOutside>
  );
});
