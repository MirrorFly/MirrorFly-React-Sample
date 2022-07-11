import React, { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { get as _get, isEmpty as _isEmpty } from "lodash";
import OutsideClickHandler from "react-outside-click-handler";
import {
 ArrowBack,
 IconNoStar,
 IconNoStaredMessage,
 IconStaredArrow,
 IconStaredMenu,
 Menu,
 UnStar
} from "../../../assets/images";
import "./StarredMessages.scss";
import ProfileImage from "../Common/ProfileImage";
import { downloadMediaFile, getActiveConversationMessageByMsgId, getChatMessageHistoryById, getMessageFromHistoryById, getMsgStatusEle, getReplyMessageFormat, isGroupChat, isSingleChat, offlineReplyHandle } from "../../../Helpers/Chat/ChatHelper";
import { initialNameHandle, formatDisplayName, getUserDetails, isLocalUser } from "../../../Helpers/Chat/User";
import { getGroupData } from "../../../Helpers/Chat/Group";
import { getMessageTimeElement } from "../../../Helpers/UIElements";
import { callOriginStrMsgAction, RemoveAllStarredMessages } from "../../../Actions/StarredAction";
import SDK from "../../SDK";
import Store from "../../../Store";
import { RemoveAllStarredMessagesHistory } from "../../../Actions/ChatHistory";
import TextComponent from "../Conversation/Templates/Chat/TextComponent";
import ImageComponent from "../Conversation/Templates/Chat/ImageComponent";
import VideoComponent from "../Conversation/Templates/Chat/VideoComponent";
import AudioComponent from "../Conversation/Templates/Chat/AudioComponent";
import DocumentComponent from "../Conversation/Templates/Chat/DocumentComponent";
import ContactComponent from "../Conversation/Templates/Chat/ContactComponent";
import LocationComponent from "../Conversation/Templates/Chat/LocationComponent";
import Modal from "../Common/Modal";
import { toast } from "react-toastify";
import moment from "moment";
import { blockOfflineAction, isAppOnline } from "../../../Helpers/Utility";
import { ActiveChatAction } from "../../../Actions/RecentChatActions";
import { ReplyMessageAction } from "../../../Actions/MessageActions";
import ReplyMessageBlock from "../../WebChat/Conversation/Templates/Common/ReplyMessage";
 
 
 
const StarredMessages = (props = {}) => {
 const [unstarDrop, setUnstarDrop] = useState(false);
 const [unstarConfirm, setUnstarConfirm] = useState(false);
 const [dropDownStatus, setDropDown] = useState(-1);
 const { handleBackToSetting } = props;
 const { data: starData = [] } = useSelector((state) => state.starredMessages);
 const chatConversation = useSelector((state) => state.chatConversationHistory) || {};
 const { data: chatHistoreData = {} } = chatConversation;
 const [starredMessages, setStarredMessages] = useState([]);
 const [seletedData, setSeletedData] = useState({});
 
 useEffect(() => {
   const sortedData = starData.sort((x, y) => new Date(y.favDate).getTime() - new Date(x.favDate).getTime());
   const addReplyIsEsisting = sortedData.map((ele) => {
     if (_get(ele, "msgBody.replyTo", "") !== "") {
       return {
         ...ele,
         isReply: true
       }
     }
     else {
       return {
         ...ele,
         isReply: false
       }
     }
   })
   setStarredMessages(addReplyIsEsisting);
   return (() => {
     setSeletedData({});
   })
 }, [starData]);
 // await this.requestChatMessages(chatType, "up", chatMessages[0].msgId, RECONNECT_GET_CHAT_LIMIT);
 
 useEffect(() => {
   if (Object.keys(chatHistoreData).length !== 0) {
     if (Object.keys(seletedData).length !== 0) {
       if (Object.keys(chatHistoreData[seletedData.fromUserId]?.messages)?.length !== 0) {
         setTimeout(() => {
           Store.dispatch(callOriginStrMsgAction(
             {
               fromPage: "starPage",
               callOriginStrMsg: true,
               callOriginStrMsgId: seletedData,
             }
           ));
           setSeletedData({});
         }, 500);
       }
     }
   }
 }, [chatHistoreData]);

 const getSenderName = (data) => {
   let messageFrom = data?.publisherId;
 
  //  if (isLocalUser(messageFrom)) {
  //    const groupData = getGroupData(data?.fromUserId);
  //    return groupData?.groupName || "-";
  //  }

  if(!isLocalUser(messageFrom)){
    const { nameToDisplay = "-" } =formatDisplayName(messageFrom) || {};
    return nameToDisplay;
  }
  return "You"
 };
 
 const getReceiverName = (data) => {
   if(isGroupChat(data?.chatType)){
    const { groupName = "" } =getGroupData(data?.fromUserId) || {};
    return groupName || "-"; 
   }
    if(isSingleChat(data?.chatType)){
    const { nameToDisplay = "-" } =formatDisplayName(data?.fromUserId) || {};
    if(data?.fromUserId === data?.publisherId){  
      // if(!isLocalUser(data?.favouriteBy)){
      //   const { favByName } =formatDisplayName(data?.favouriteBy) || {};
      //   return favByName;
      // }
      return "You"
    }  
    return nameToDisplay;
  }
  
  //  if (isSingleChat(data?.chatType) || (isGroupChat(data?.chatType) && isLocalUser(data?.publisherId))) {
  //    return "You";
  //  }
  }

 const handleUnStarall = () => {
   setUnstarDrop(false);
   if (blockOfflineAction()) return;
   setUnstarConfirm(true);
 };
 
 const handleUnStarallAction = async () => {
   setUnstarConfirm(false);
   if (blockOfflineAction()) return;
   SDK.removeAllFavouriteMessages();
   Store.dispatch(RemoveAllStarredMessages());
   Store.dispatch(RemoveAllStarredMessagesHistory(starredMessages));
 };
 
 const getParentClass = (data) => (isLocalUser(data.publisherId) ? "starred-own" : "Starred-others");
 
 const getChildClass = (data) => (isLocalUser(data.publisherId) ? "receiver" : "sender");
 
 const singleFileClass = (data) =>
   (data.msgType === "video" || data.msgType === "image") && data?.msgBody?.media?.caption === "" ? " singleFile" : "";
 
 const singleFileClassLocation = (data) =>
   data.msgType === "location" ? " singleFile location-message image-block" : "";
 
 const captionFinderClass = (data) =>
   ((data.msgType === "image" || data.msgType === "video") && data?.msgBody?.media?.caption !== "") ? " has-caption " : "";
 
 const getProfileElement = (data) => {
   const userDetails = getUserDetails(data.publisherId);
   const iniTail = initialNameHandle(userDetails, userDetails.initialName);
   return (
     <div className="senderDetails">
       <span className="starred-time">{moment(data.createdAt).format("DD MMM YYYY")}</span>
       <div className="sender-info">
         <span className="sender-image">
           <ProfileImage
             name={iniTail}
             imageToken={userDetails.image}
             chatType="chat"
           />
         </span>
         <span className="sender-name">
           <span className="senderName">{getSenderName(data)}</span> <IconStaredArrow />{" "}
           <span className="receiverName">{getReceiverName(data)}</span>
         </span>
       </div>
     </div>
   );
 };
 
 const downloadAction = async (event, file_url, fileName, fileKey) => {
   downloadMediaFile(file_url, "file", fileName, fileKey, event);
 };
 
 const getMessageElement = (data) => {
   const isSender = isLocalUser(data.publisherId);
 
   switch (data.msgType) {
     case "text":
     case "auto_text":
       return <TextComponent messageObject={data} isSender={isSender} />;
 
     case "image":
       return <ImageComponent messageObject={data} isSender={isSender} uploadStatus={2} imageHeightAdjust={true} />;
 
     case "video":
       return <VideoComponent messageObject={data} isSender={isSender} uploadStatus={2} imageHeightAdjust={true} />;
 
     case "audio":
       return <AudioComponent pageType={"starPage"} messageObject={data} isSender={isSender} uploadStatus={2} />;
 
     case "file":
       return (
         <DocumentComponent
           messageObject={data}
           isSender={isSender}
           uploadStatus={2}
           downloadAction={downloadAction}
         />
       );
 
     case "contact":
       return <ContactComponent messageObject={data} />;
 
     case "location":
       return <LocationComponent messageObject={data} />;
 
     default:
       return "";
   }
 };
 
 const handleDropDown = (event, idx) => {
   event.stopPropagation();
   setDropDown(idx);
 };
 
 const unStarMessage = async (data) => {
   setDropDown(-1);
   if (blockOfflineAction()) return;
   SDK.updateFavouriteStatus(data.fromUserJid, [data.msgId], false);
   toast.success(`1 message unstarred`);
 };
 
 const noUnstarMessages = () => {
   toast.info("There is no starred message.");
   setUnstarDrop(false);
 };
 
 const scrollToMsg = async (msgId = "") => {
   setTimeout(() => {
     const container = document && document.getElementById(msgId);
     if (!container) return;
     container.scrollIntoView();
     container.classList.add("animatefinded");
     const activeTimer = setTimeout(() => {
       container.classList.remove("animatefinded");
     }, 3000);
     return (() => clearTimeout(activeTimer));
   }, 300);
 
 }
 
 const getMsgId = async (msgItem = {}) => {
   const storeData = Store.getState();
   const { recentChatData: { rosterData: { recentChatItems = [] } = {} } = {} } = storeData || {};
   const dataFind = recentChatItems.filter((ele) => ele.recent.fromUserId === msgItem.fromUserId);
   if (dataFind.length >= 1) {
     dataFind[0].chatId = msgItem.fromUserId;
     dataFind[0].chatType = msgItem.chatType;
     dataFind[0].chatJid = msgItem.fromUserJid;
     const dataMsgHistory = getChatMessageHistoryById(msgItem.fromUserId);
     if (dataMsgHistory.length === 0) {
       Store.dispatch(ActiveChatAction(dataFind[0]));//open recent chat
       setSeletedData(msgItem)
     } else {
       const findListMagId = dataMsgHistory.find((ele) => ele.msgId === msgItem.msgId);
       Store.dispatch(ActiveChatAction(dataFind[0]));
       if (findListMagId) {
         scrollToMsg(findListMagId.msgId);
       } else {
         Store.dispatch(callOriginStrMsgAction(
           { fromPage: "starPage", callOriginStrMsg: true, callOriginStrMsgId: msgItem, }
         ));
       }
     }
   }
 };
 
 const requestReplyMessage = (grmsgid, replyTo, chatType) => {
   if (isAppOnline()) {
     SDK.getReplyMessage(replyTo, chatType);
   } else {
     // When user try to reply in offline, at this time get the message
     // details from the local message history & set that message as reply message
     const message = getActiveConversationMessageByMsgId(replyTo, chatType);
     const replyMsgDetails = getReplyMessageFormat(message);
     if (replyMsgDetails) {
       Store.dispatch(ReplyMessageAction(replyMsgDetails));
     }
   }
 };
 
 const replayContentRender = (elememt = {}) => {
   const { fromUserJid = "", msgBody: { replyTo = "" } = {}, msgId = "", chatType = "" } = elememt;
   const newObj = getMessageFromHistoryById(fromUserJid, replyTo);
   if (_isEmpty(newObj)) {
     requestReplyMessage(msgId, replyTo, chatType);
   } else {
     offlineReplyHandle(newObj, replyTo);
   }
   const newArr = [...starredMessages];
   const findIndex = newArr.findIndex((ele) => _get(ele, "msgBody.replyTo") === _get(elememt, "msgBody.replyTo"));
   newArr[findIndex] = {
     ...newArr[findIndex],
     isReply: false,
   }
   // setStarredMessages(newArr);
 }
 
 return (
   <Fragment>
     <div id={"star-msgContent"} className="staredMessages">
       <div>
         <div className="contactlist">
           <div className="recent-chatlist-header">
             <div className="profile-img-name">
               <i onClick={handleBackToSetting} className="newchat-icon" title="Back">
                 <ArrowBack />
               </i>
               <span>Starred Messages</span>
             </div>
 
             <div className="starMenu">
               <IconStaredMenu onClick={() => setUnstarDrop(!unstarDrop)} />
               {unstarDrop && (
                 <OutsideClickHandler onOutsideClick={() => setUnstarDrop(false)}>
                   <ul className="menu-dropdown" style={{ padding: 0 }}>
                     <li
                       title="Starred Messages"
                       onClick={starredMessages.length > 0 ? handleUnStarall : noUnstarMessages}
                     >
                       <i>
                         <UnStar />
                       </i>
                       <span>Unstar all</span>
                     </li>
                   </ul>
                 </OutsideClickHandler>
               )}
             </div>
           </div>
 
           {starredMessages.length > 0 && (
             <ul className="staredContainer">
               {starredMessages.map(
                 (el, i) =>
                   Object.keys(el).length > 0 && (
                     <li
                       onClick={() => getMsgId(el)}
                       className={`${getParentClass(el)}`} key={el.msgId}>
                       {getProfileElement(el)}
                       <div
                         className={`${getChildClass(el)}-row ${singleFileClass(el)}  ${singleFileClassLocation(el)} ${captionFinderClass(el)}`}
                       >
                         {(_get(el, "isReply", false) === true) && replayContentRender(el)}
                         <div
                           className={`${getChildClass(el)} ${_get(el, "msgBody.replyTo", "") !== "" ? "reply-block" : ""} ${el.msgType}-message`}>
                           {_get(el, "msgBody.replyTo", "") !== "" &&
                             <>
                               <ReplyMessageBlock
                                 viewOriginalMessage={() => { }}
                                 msgId={_get(el, "msgBody.replyTo", "")}
                                 chatType={_get(el, "msgBody.chatType", "")}
                               />
                             </>}
                           {getMessageElement(el)}
                           {getMessageTimeElement(
                             getMsgStatusEle(el.msgStatus, el.publisherId),
                             el.createdAt,
                             1,
                             !isLocalUser(el.publisherId),
                             el.msgType
                           )}
                           <div className="message-dropdown-menu">
                             <span className="message-dropdown">
                               <span className="actionDrop" onClick={(e) => handleDropDown(e, i)}></span>
                               <i>
                                 <Menu />
                               </i>
                             </span>
                             {dropDownStatus === i && (
                               <OutsideClickHandler onOutsideClick={() => setDropDown(-1)}>
                                 <ul className={`menu-dropdown open`} style={{ padding: 0 }}>
                                   <Fragment>
                                     <li className="Starred" title="UnStarred" onClick={() => unStarMessage(el)}>
                                       <i>
                                         <UnStar />
                                       </i>
                                       <span>Unstar</span>
                                     </li>
                                   </Fragment>
                                 </ul>
                               </OutsideClickHandler>
                             )}
                           </div>
                         </div>
                       </div>
                     </li>
                   )
               )}
             </ul>
           )}
           {starredMessages.length === 0 && (
             <div className="box-center h-full w-full flex-auto noStarredMessage">
               <i>
                 <IconNoStaredMessage />
                 <IconNoStar className="star" />
               </i>
               <p>No Starred Messages</p>
             </div>
           )}
         </div>
       </div>
     </div>
     {unstarConfirm && (
       <Modal containerId="container">
         <div className="popup-wrapper deleteMessage">
           <div className="popup-container">
             <div className="popup-container-inner">
               <div className="popup-label">
                 <label>Are you sure you want to Unstar all messages?</label>
               </div>
               <div className="popup-noteinfo">
                 <Fragment>
                   <button type="button" onClick={() => setUnstarConfirm(false)} className="btn-cancel">
                     Cancel
                   </button>
                   <button type="button" onClick={handleUnStarallAction} className="btn-active danger">
                     Unstar all
                   </button>
                 </Fragment>
               </div>
             </div>
           </div>
         </div>
       </Modal>
     )}
   </Fragment>
 );
};
 
export default StarredMessages;
 














