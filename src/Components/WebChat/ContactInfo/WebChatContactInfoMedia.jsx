import React from "react";
import SDK from "../../SDK";
import Store from "../../../Store";
import { connect } from "react-redux";
import { MEDIA_AND_DOCS } from "../../processENV";
import { getExtension } from "../Common/FileUploadValidation";
import { MEDIA_MESSAGE_TYPES } from "../../../Helpers/Constants";
import getFileFromType from "../Conversation/Templates/Common/getFileFromType.js";
import { GroupChatMediaResetAction } from "../../../Actions/GroupChatMessageActions";
import { millisToMinutesAndSeconds } from "../../../Helpers/Utility";
import { mediaVideo, Next, NoMedia, audioRecordImg, audioFileImg } from "../../../assets/images";
import { getActiveChatMessages, getActiveConversationChatJid } from "../../../Helpers/Chat/ChatHelper";
import { SingleChatMediaResetAction, SingleChatSelectedMediaAction } from "../../../Actions/SingleChatMessageActions";

class WebChatContactInfoMedia extends React.Component {
  /**
   * Following are the states used in WebChatContactInfoMedia Component.
   * @param {object} displayName contact's name.
   * @param {object} image contact's profile.
   * @param {boolean} status contact's user status.
   * @param {boolean} isBlocked contact's blocked/unblocked status.
   */
  constructor(props = {}) {
    super(props);
    this.state = {
      mediaList: ""
    };
  }

  handleGetMedia = async () => {
    const { chatType = "" } = this.props;
    let chatJid = getActiveConversationChatJid();
    if (chatType === "broadcast") {
      // Not Implemented
      SDK.getBroadcastChatMedia(chatJid);
    } else {
      const mediaMsgRes = SDK && (await SDK.getMediaMessages(chatJid));
      if (mediaMsgRes && mediaMsgRes.statusCode === 200 && mediaMsgRes.data.length) {
        // Filtering Media Duplicates with Message Id
        const msgIds = new Set(this.state.mediaList.map((d) => d.msgId));
        const newList = [...this.state.mediaList, ...mediaMsgRes.data.filter((d) => !msgIds.has(d.msgId))];
        newList.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
        this.setState({ mediaList: newList });
      }
    }
  };

  /**
   * componentDidMount is one of the react lifecycle method. <br />
   *
   * In this method to handle the block user data.
   */
  async componentDidMount() {
    const chatMediaList = getActiveChatMessages();
    let mediaList = chatMediaList.filter(
      (el) => el && el.msgBody && MEDIA_MESSAGE_TYPES.includes(el.msgBody.message_type) && el.deleteStatus === 0
    );

    mediaList.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
    this.setState({ mediaList });

    // Show Only 3 Recent Medias. If it has less than 3 Fetch from Server
    if (mediaList.length < 3) this.handleGetMedia();
    else mediaList.length = 3;
  }

  componentWillUnmount() {
    const { chatType } = this.props;
    if (chatType) {
      return Store.dispatch(SingleChatMediaResetAction());
    }
    return Store.dispatch(GroupChatMediaResetAction());
  }

  /**
   * componentDidUpdate is one of the react lifecycle method. <br />
   *
   * In this method to handle the block user data.
   *
   * @param {object} prevProps
   * @param {object} prevState
   */
  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.SingleChatMediaData &&
      this.props.SingleChatMediaData &&
      prevProps.SingleChatMediaData.id !== this.props.SingleChatMediaData.id
    ) {
      if (this.props.SingleChatMediaData.data.length && this.props.SingleChatMediaData.data.length !== 0) {
        this.setState({
          Media: this.props.SingleChatMediaData.data.reverse()
        });
      }
    }
    if (
      prevProps.GroupChatMediaData &&
      this.props.GroupChatMediaData &&
      prevProps.GroupChatMediaData.id !== this.props.GroupChatMediaData.id
    ) {
      if (this.props.GroupChatMediaData.data.length && this.props.GroupChatMediaData.data.length !== 0) {
        this.setState({
          Media: this.props.GroupChatMediaData.data.reverse()
        });
      }
    }
  }

  handleMediaShow = (e) => {
    document
      .getElementById("msgContent")
      .querySelectorAll("video, audio")
      .forEach((element) => element.pause());

    if (this.state.mediaList.length > 0) {
      const { chatType } = this.props;
      const data = {
        jid: getActiveConversationChatJid(),
        chatType: chatType ? "chat" : "groupchat",
        selectedMessageData: this.state.mediaList[0]
      };
      Store.dispatch(SingleChatSelectedMediaAction(data));
    }
  };
  handleSelectedMediaAction = (messageObject) => {
    const data = { jid: getActiveConversationChatJid(), chatType: this.props.chatType, selectedMessageData: messageObject };
    Store.dispatch(SingleChatSelectedMediaAction(data));
  }

  render() {
    let { mediaList = [] } = this.state || {};
    const { featureStateData: {isViewAllMediasEnabled = false} = {} } = this.props;
    return (
      <div>
      {isViewAllMediasEnabled &&
        <div className="contactinfo-media">
          <h5>
            <span className="media">
              {MEDIA_AND_DOCS}
            </span>
            {mediaList.length !== 0 && (
              <span
                className="count"
                onClick={this.handleMediaShow}
                data-jest-id={"jesthandleMediaShow"}
              >
                <i>
                  <Next />
                </i>
              </span>
            )}
          </h5>
          {mediaList.length !== 0 && 
            <ul className="mediadocs">
              {mediaList.map((media, index) => {
                let audioType = media?.msgBody?.media?.audioType;
                let msgObj = media?.msgBody ? media?.msgBody : media;
                let {
                  message_type,
                  media: { fileName = null, thumb_image = null, duration = "", file_url = "" } = {}
                } = msgObj;

                let imageSrc = thumb_image ? `data:image/png;base64,${thumb_image}` : file_url;
                const fileExtension = getExtension(fileName);
                const placeholder = getFileFromType(null, fileExtension);

                if (message_type === "image") {
                  return (
                    <li onClick={() => this.handleSelectedMediaAction(media)} key={media.timestamp}>
                      <img src={imageSrc} alt="" />
                    </li>
                  );
                } else if (message_type === "video") {
                  return (
                    <li onClick={() => this.handleSelectedMediaAction(media)} key={media.timestamp} className="media-video">
                      <img src={imageSrc} alt="" />
                      <div className="overlay">
                        <img src={mediaVideo} className="video-icon" alt="" />
                      </div>
                    </li>
                  );
                } else if (message_type === "audio") {
                  return (
                    <li key={media.timestamp} className="media-audio">
                      <span className="media-inner">
                        <span className="media-text">
                          {millisToMinutesAndSeconds(duration)}
                        </span>
                        <img
                          alt=""
                          src={audioType !== "recording" ? audioFileImg : audioRecordImg}
                        />
                      </span>
                    </li>
                  );
                } else if (message_type === "file") {
                  return (
                    <li key={media.timestamp} className="media-file">
                      <span className="media-inner">
                        <span className="media-text">
                          {fileName}
                        </span>
                        <img src={placeholder} alt="" />
                      </span>
                    </li>
                  );
                }
                return "";
              })}
            </ul>
          }
 
          {mediaList.length === 0 && (
            <div className="noMedia">
              <i>
                <NoMedia />
              </i>
              <span className="">No Media Found</span>
            </div>
          )}
        </div>
      }
      </div>
    );
  }
}

/**
 * mapping redux data into WebChatContactInfoMedia component properties.
 */
const mapStateToProps = (state) => {
  return {
    featureStateData: state.featureStateData,
    SingleChatMediaData: state.SingleChatMediaData,
    GroupChatMediaData: state.GroupChatMediaData,
    singleChatMsgHistoryData: state.singleChatMsgHistoryData,
    groupChatMsgHistoryData: state.groupChatMessage
  };
};

export default connect(mapStateToProps, null)(WebChatContactInfoMedia);
