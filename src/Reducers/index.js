import { combineReducers } from "redux";
import { BlockReducer, BlockStatusReducer, contactsWhoBlockedMeReducer } from "./BlockReducer";
import { BroadCastReducer } from "./BroadCastReducer";
import {
  CallConnectionStateReducer,
  callConversionReducer,
  pinUserReducer,
  largeVideoUserReducer,
  callDurationTimestampReducer
} from "./CallReducer";
import { showConfrenceReducer } from "./confrenceReducer";
import { ConnectionStateReducer } from "./ConnectionStateReducer";
import { ConversationState } from "./ConversationState";
import {
  GroupChatMediaReducer,
  GroupChatMessageReducer,
  GroupChatSelectedMediaReducer
} from "./GroupChatMessageReducer";
import {
  GroupsMemberListReducer,
  GroupsReducer,
  currentCallGroupMembersReducer,
  GroupsMemberParticipantsListReducer
} from "./GroupsReducer";
import { LastActivityReducer } from "./LastActivityReducer";
import { messageForwardReducer, messageInfoReducer, MessageReducer, ReplyMessageReducer } from "./MessageReducer";
import { PopUp } from "./PopUp";
import { PresenceReducer } from "./PresenceReducer";
import {
  RecentChatReducer,
  ActiveChatReducer,
  WebChatProfileImageReducer,
  modalPopUpReducer
} from "./RecentChatReducer";
import { RecentChatStatusReducer } from "./RecentChatStatusReducer";
import RosterReducer from "./RosterReducer";
import {
  SingleChatMediaReducer,
  SingleChatMessageReducer,
  SingleChatSelectedMediaReducer,
  chatSeenPendingMsgReducer
} from "./SingleChatMessageReducer";
import { TypingReducer } from "./TypingReducer";
import { UnreadCountReducer } from "./UnreadCountReducer";
import { VCardContactReducer, VCardReducer } from "./VCardReducer";
import { callLogReducer } from "./CallLogReducer";
import { browserNotifyReducer, browserTabReducer, appOnlineStatusReducer, webLocalStorageSettingReducer } from "./BrowserReducer";
import { scrollBottomChatHistoryReducer } from "./ScrollReducer";
import { ChatConversationHistoryReducer } from "./ChatHistory";
import { UpdateMediaUploadStateReducer } from "./Media";
import { StarredMessagesReducer } from "./StarredReducer";
import { TranslateLanguage } from "./TranslateLanguage";
import { CommonDataReducer } from "./CommonReducer";

export default combineReducers({
  TranslateLanguage:TranslateLanguage,
  modalPopUpReducer: modalPopUpReducer,
  ConnectionStateData: ConnectionStateReducer,
  vCardData: VCardReducer,
  rosterData: RosterReducer,
  recentChatData: RecentChatReducer,
  recentChatStatus: RecentChatStatusReducer,
  conversationState: ConversationState,
  messageData: MessageReducer,
  activeChatData: ActiveChatReducer,
  WebChatProfileImageData: WebChatProfileImageReducer,
  VCardContactData: VCardContactReducer,
  groupsData: GroupsReducer,
  blockedContact: BlockReducer,
  blockStatus: BlockStatusReducer,
  lastActivityData: LastActivityReducer,
  singleChatMsgHistoryData: SingleChatMessageReducer,
  groupsMemberListData: GroupsMemberListReducer,
  groupsMemberParticipantsListData: GroupsMemberParticipantsListReducer,
  presenceData: PresenceReducer,
  typingData: TypingReducer,
  replyMessageData: ReplyMessageReducer,
  selectedMessageData: messageForwardReducer,
  messageInfoData: messageInfoReducer,
  groupChatMessage: GroupChatMessageReducer,
  callConnectionDate: CallConnectionStateReducer,
  showConfrenceData: showConfrenceReducer,
  SingleChatMediaData: SingleChatMediaReducer,
  GroupChatMediaData: GroupChatMediaReducer,
  SingleChatSelectedMediaData: SingleChatSelectedMediaReducer,
  GroupChatSelectedMediaData: GroupChatSelectedMediaReducer,
  unreadCountData: UnreadCountReducer,
  broadCastData: BroadCastReducer,
  popUpData: PopUp,
  currentCallGroupMembersData: currentCallGroupMembersReducer,
  callLogData: callLogReducer,
  callConversionData: callConversionReducer,
  pinUserData: pinUserReducer,
  largeVideoUserData: largeVideoUserReducer,
  callDurationTimestampData: callDurationTimestampReducer,
  browserNotifyData: browserNotifyReducer,
  contactsWhoBlockedMe: contactsWhoBlockedMeReducer,
  scrollBottomChatHistory: scrollBottomChatHistoryReducer,
  browserTabData: browserTabReducer,
  appOnlineStatus: appOnlineStatusReducer,
  chatSeenPendingMsgData: chatSeenPendingMsgReducer,
  chatConversationHistory: ChatConversationHistoryReducer,
  mediaUploadData: UpdateMediaUploadStateReducer,
  starredMessages: StarredMessagesReducer,
  webLocalStorageSetting : webLocalStorageSettingReducer,
  commonData: CommonDataReducer
});
