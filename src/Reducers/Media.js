import { CANCEL_MEDIA_DOWNLOAD, CANCEL_MEDIA_UPLOAD, DOWNLOADING_MEDIA, MEDIA_DROPDOWNSTATUS, MEDIA_IMG_THUMB } from "../Actions/Constants";

const initialState = {
  id: null,
  data: {},
  downloadingData:{},
  downloadingStatus:{}
};

const dropDownState = {}
const mediaImageThumb = {}

export function UpdateMediaUploadStateReducer(state = initialState, action = {}) {
  const { id, data } = action.payload || {};
  if (action.type === CANCEL_MEDIA_UPLOAD) {
    return {
      ...state,
      ...{
        id: id,
        data: {
          ...state.data,
          [data.msgId]: data
        }
      }
    };
  }
  return state;
}

export function UpdateMediaDownloadStateReducer(state = initialState, action = {}) {
  const { data } = action.payload || {};
  if (action.type === CANCEL_MEDIA_DOWNLOAD) {
    return {
      ...{
        downloadingData: {
          ...state.downloadingData,
          [data.msgId]: data
        }
      }
    };
  }
  return state;
}

export function MediaDownloadStateReducer(state = initialState, action = {}) {
  const { data } = action.payload || {};
  if (action.type === DOWNLOADING_MEDIA) {
    return {
      ...{
        downloadingStatus:{
          ...state.downloadingStatus,
          [data.downloadMediaMsgId]:data
        } 
      }
    };
  }
  return state;
}

export function MediaDropdownStatusReducer(state = dropDownState, action = {}) {
  const { data } = action.payload || {};
  if (action.type === MEDIA_DROPDOWNSTATUS) {
    return {
      ...{
          [data.msgId]:data
      }
    };
  }
  return state;
}

export function MediaImageThumbDataReducer(state = mediaImageThumb, action = {}) {
  const { data } = action.payload || {};
  if (action.type === MEDIA_IMG_THUMB) {
    return {
      ...state,
      [data.fileId]: data,
    };
  }
  return state;
}
