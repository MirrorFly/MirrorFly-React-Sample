import uuidv4 from "uuid/v4";
import {
  CANCEL_MEDIA_UPLOAD,
  RETRY_MEDIA_UPLOAD,
  CHAT_MESSAGE_HISTORY,
  CLEAR_CHAT_HISTORY,
  DELETE_CHAT_HISTORY,
  DELETE_MESSAGE_FOR_EVERYONE,
  DELETE_MESSAGE_FOR_ME,
  UPDATE_TYPED_MESSAGE,
  UPDATE_UPLOAD_STATUS,
  UPDATE_FAVOURITE_STATUS,
  REMOVE_ALL_FAVOURITE_STATUS,
  TRANSLATE_MESSAGE
} from "./Constants";

export const ChatMessageHistoryDataAction = (data) => {
  return {
    type: CHAT_MESSAGE_HISTORY,
    payload: {
      id: uuidv4(),
      data
    }
  };
};

export const ClearChatHistoryAction = (data) => {
  return {
    type: CLEAR_CHAT_HISTORY,
    payload: {
      id: uuidv4(),
      data
    }
  };
};

export const DeleteChatHistoryAction = (data) => {
  return {
    type: DELETE_CHAT_HISTORY,
    payload: {
      id: uuidv4(),
      data
    }
  };
};

export const DeleteMessageForMeAction = (data) => {
  return {
    type: DELETE_MESSAGE_FOR_ME,
    payload: {
      id: uuidv4(),
      data
    }
  };
};

export const DeleteMessageForEveryoneAction = (data) => {
  return {
    type: DELETE_MESSAGE_FOR_EVERYONE,
    payload: {
      id: uuidv4(),
      data
    }
  };
};

export const UpdateMediaUploadStatus = (data) => {
  return {
    type: UPDATE_UPLOAD_STATUS,
    payload: {
      id: uuidv4(),
      data
    }
  };
};

export const CancelMediaUpload = (data) => {
  return {
    type: CANCEL_MEDIA_UPLOAD,
    payload: {
      id: uuidv4(),
      data
    }
  };
};

export const RetryMediaUpload = (data) => {
  return {
    type: RETRY_MEDIA_UPLOAD,
    payload: {
      id: uuidv4(),
      data
    }
  };
};

export const UpdateTypedMessage = (data) => {
  return {
    type: UPDATE_TYPED_MESSAGE,
    payload: {
      id: uuidv4(),
      data
    }
  };
};

export const UpdateFavouriteStatus = (data) => {
  return {
    type: UPDATE_FAVOURITE_STATUS,
    payload: {
      id: uuidv4(),
      data
    }
  };
};

export const RemoveAllStarredMessagesHistory = (data) => {
  return {
    type: REMOVE_ALL_FAVOURITE_STATUS,
    payload: {
      id: uuidv4(),
      data
    }
  };
};

export const TranslateMessageHistory = (data) => {
  return {
    type: TRANSLATE_MESSAGE,
    payload: {
      id: uuidv4(),
      data
    }
  };
};

