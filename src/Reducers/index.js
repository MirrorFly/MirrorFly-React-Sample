import { combineReducers } from "redux";
import { BlockReducer, BlockStatusReducer, contactsWhoBlockedMeReducer } from "./BlockReducer";
import { BroadCastReducer } from "./BroadCastReducer";
import {
  CallConnectionStateReducer,
  callConversionReducer,
  pinUserReducer,
  largeVideoUserReducer,
  callDurationTimestampReducer,
  callQualityReducer,
  callQualityPopupReducer,
  callQualityIconReducer
} from "./CallReducer";
import { showConfrenceReducer } from "./confrenceReducer";
import { ConnectionStateReducer } from "./ConnectionStateReducer";
import { FeatureStateReducer } from "./FeatureStateReducer";
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
import { MessageEditedReducer, messageForwardReducer, messageInfoReducer, MessageReducer, ReplyMessageReducer , selectedMessageInfoReducer} from "./MessageReducer";
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
import { groupNotificationMsgCountReducer, UnreadCountReducer, UnreadUserObjReducer } from "./UnreadCountReducer";
import { VCardContactReducer, VCardReducer } from "./VCardReducer";
import { callLogReducer } from "./CallLogReducer";
import { browserNotifyReducer, browserTabReducer, appOnlineStatusReducer, webLocalStorageSettingReducer } from "./BrowserReducer";
import { scrollBottomChatHistoryReducer } from "./ScrollReducer";
import { ChatConversationHistoryReducer, EditStatusReducer, LoadMoreChatsMessagesReducer } from "./ChatHistory";
import { MediaDownloadStateReducer, MediaDropdownStatusReducer, MediaImageThumbDataReducer, UpdateMediaDownloadStateReducer, UpdateMediaUploadStateReducer } from "./Media";
import { starMsgPageTypeReducer, StarredMessagesReducer } from "./StarredReducer";
import { TranslateLanguage } from "./TranslateLanguage";
import { CommonDataReducer } from "./CommonReducer";
import { callIntermediateScreenReducer } from "./CallIntermediateScreen";
import { RosterPermissionReducer } from "./RosterPermissionReducer";
import { AdminBlockReducer } from "./AdminBlockReducer";

export default combineReducers({
  TranslateLanguage:TranslateLanguage,
  modalPopUpReducer: modalPopUpReducer,
  ConnectionStateData: ConnectionStateReducer,
  featureStateData: FeatureStateReducer,
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
  UnreadUserObjData: UnreadUserObjReducer,
  groupNotificationMsgCount: groupNotificationMsgCountReducer,
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
  chatEditStatus: EditStatusReducer,
  messageEditedData: MessageEditedReducer,
  mediaUploadData: UpdateMediaUploadStateReducer,
  mediaDownloadingData: UpdateMediaDownloadStateReducer,
  starredMessages: StarredMessagesReducer,
  webLocalStorageSetting : webLocalStorageSettingReducer,
  commonData: CommonDataReducer,
  callIntermediateScreen: callIntermediateScreenReducer,
  contactPermission: RosterPermissionReducer,
  adminBlockData: AdminBlockReducer,
  selectedMessageInfoReducer: selectedMessageInfoReducer,
  mediaDownloadData: MediaDownloadStateReducer,
  mediaDropDownData: MediaDropdownStatusReducer,
  mediaImageThumbData : MediaImageThumbDataReducer,
  LoadMoreChatsMessages: LoadMoreChatsMessagesReducer,
  callQualityData: callQualityReducer,
  callQualityPopup: callQualityPopupReducer,
  callQualityIcon: callQualityIconReducer,
  starMsgPageType: starMsgPageTypeReducer
});
