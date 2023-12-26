import uuidv4 from "uuid/v4";
import { CANCEL_MEDIA_DOWNLOAD, CANCEL_MEDIA_UPLOAD, DOWNLOADING_MEDIA, MEDIA_DROPDOWNSTATUS, MEDIA_IMG_THUMB } from "./Constants";

export const MediaUploadDataAction = (data) => {
  return {
    type: CANCEL_MEDIA_UPLOAD,
    payload: {
      id: uuidv4(),
      data
    }
  };
};

export const MediaDownloadDataAction = (data) => {
  return {
    type: CANCEL_MEDIA_DOWNLOAD,
    payload: {
      id: uuidv4(),
      data
    }
  };
};

export const DownloadingChatMedia = (data) => {
  return {
    type: DOWNLOADING_MEDIA,
    payload: {
      id: uuidv4(),
      data
    }
  };
};

export const MediaDropDownStatus = (data) => {
  return {
    type: MEDIA_DROPDOWNSTATUS,
    payload: {
      id: uuidv4(),
      data
    }
  };
};

export const MediaImageThumbData = (data) => {
  return {
    type: MEDIA_IMG_THUMB,
    payload: {
      id: uuidv4(),
      data
    }
  };
};
