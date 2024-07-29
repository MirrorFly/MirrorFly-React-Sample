import { toast } from "react-toastify";
import Config from "../../../config";
import {
  ALLOWED_ALL_FILE_FORMATS,
  ALLOWED_AUDIO_FORMATS,
  ALLOWED_DOCUMENT_FORMATS,
  ALLOWED_IMAGE_VIDEO_FORMATS,
  ALLOWED_IMAGE_FORMATS,
  ALLOWED_VIDEO_FORMATS,
  IMAGE_FORMATS,
  VIDEO_FORMATS,
  IMAGE_VIDEO_FORMATS,
  AUDIO_FORMATS,
  DOCUMENT_FORMATS,
  FEATURE_RESTRICTION_ERROR_MESSAGE
} from "../../../Helpers/Constants";
import { getMessageType } from "../../../Helpers/Utility";
import {getFromLocalStorageAndDecrypt} from "../WebChatEncryptDecrypt";

const { maxAllowedMediaCount, fileSize, imageFileSize, videoFileSize, audioFileSize, documentFileSize } = Config;
let connectionStatus = "";

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}


const getMaxAllowedFileSize = (mediaType) => {
  if (mediaType === "image") return imageFileSize;
  else if (mediaType === "video") return videoFileSize;
  else if (mediaType === "audio") return audioFileSize;
  else if (mediaType === "file") return documentFileSize;
  return fileSize;
};
const validateFileSize = (file) => {
  const filemb = Math.round(file.size / 1024);
  const mediaType = getMessageType(file.type, file);
  const maxAllowedSize = getMaxAllowedFileSize(mediaType);
  if (filemb >= maxAllowedSize * 1024) {
    const fileSizeString = formatBytes(maxAllowedSize * 1024 * 1024);
    const message = `File size is too large. Try uploading file size below ${fileSizeString}`;
    toast.error(message);
    return Promise.resolve(false);
  }
  return Promise.resolve(true);
};

/**
 * @param  {string} name=""
 * find last "DOT" and get file Type
 */
export function getExtension(name = "") {
  if (!name) return "";
  const lastDot = name.substring(name.lastIndexOf(".") + 1, name.length);
  return "." + lastDot;
}

const durationValdation = (file, fileExtension) => {
  let htmlElement = document.createElement("audio");
  htmlElement.preload = "metadata";

  let promise = new Promise((resolve) => {
    htmlElement.addEventListener("loadedmetadata", () => {
      const settings = JSON.parse(getFromLocalStorageAndDecrypt("settings"));
      const { audioLimit = 300, videoLimit = 300 } = settings || {};
      const durationCheck = fileExtension === ".mp4" ? videoLimit : audioLimit;
      const fileType = fileExtension === ".mp4" ? "video" : "audio";

      if (parseInt(htmlElement.duration) > durationCheck) {
        const message = `Sorry, ${fileType} duration cannot be more than ${durationCheck} seconds`;
        toast.error(message);
        return resolve(false);
      }
      return resolve(true);
    });
  });
  const URL = window.URL || window.webkitURL;
  htmlElement.src = URL.createObjectURL(file);
  return promise;
};

const validateFileExtension = (file, mediaType) => {
  const featureFlags = getFromLocalStorageAndDecrypt("featureRestrictionFlags");
  const {
    isImageAttachmentEnabled = false,
    isVideoAttachmentEnabled = false,
    isAudioAttachmentEnabled = false,
    isDocumentAttachmentEnabled = false
  } = featureFlags;
  const fileExtension = getExtension(file.name);
  const allowedFilescheck = new RegExp("([a-zA-Z0-9s_\\.-:])+(" + ALLOWED_ALL_FILE_FORMATS.join("|") + ")$", "i");
  const allowedImageVideoFilescheck = new RegExp("([a-zA-Z0-9s_\\.-:])+(" + ALLOWED_IMAGE_VIDEO_FORMATS.join("|") + ")$", "i");
  const allowedImageFilescheck = new RegExp("([a-zA-Z0-9s_\\.-:])+(" + ALLOWED_IMAGE_FORMATS.join("|") + ")$", "i");
  const allowedVideoFilescheck = new RegExp("([a-zA-Z0-9s_\\.-:])+(" + ALLOWED_VIDEO_FORMATS.join("|") + ")$", "i");
  const allowedAudioFilescheck = new RegExp("([a-zA-Z0-9s_\\.-:])+(" + ALLOWED_AUDIO_FORMATS.join("|") + ")$", "i");
  const allowedDocFilescheck = new RegExp("([a-zA-Z0-9s_\\.-:])+(" + ALLOWED_DOCUMENT_FORMATS.join("|") + ")$", "i");
  let fileType = file.type;
  let message = "Unsupported file format. Files allowed: ";
  if (toast.error.length > 1) {
    toast.dismiss();
  }
  if (!allowedImageVideoFilescheck.test(fileExtension) && mediaType === "imagevideo") {
    message = message + `${ALLOWED_IMAGE_VIDEO_FORMATS.join(", ")}`;
    toast.error(message);
    return Promise.resolve(false);
  } else if (!allowedImageFilescheck.test(fileExtension) && mediaType === "image") {
    message = message + `${ALLOWED_IMAGE_FORMATS.join(", ")}`;
    toast.error(message);
    return Promise.resolve(false);
  } else if (!allowedVideoFilescheck.test(fileExtension) && mediaType === "video") {
    message = message + `${ALLOWED_VIDEO_FORMATS.join(", ")}`;
    toast.error(message);
    return Promise.resolve(false);
  } else if (!allowedAudioFilescheck.test(fileExtension) && mediaType === "audio") {
    message = message + `${ALLOWED_AUDIO_FORMATS.join(", ")}`;
    toast.error(message);
    return Promise.resolve(false);
  } else if (!allowedDocFilescheck.test(fileExtension) && mediaType === "file") {
    message = message + `${ALLOWED_DOCUMENT_FORMATS.join(", ")}`;
    toast.error(message);
    return Promise.resolve(false);
  } else if (mediaType === undefined || "") { //this case is works when drag & drop from Conversation Page
    if ((isImageAttachmentEnabled && isVideoAttachmentEnabled && isAudioAttachmentEnabled && isDocumentAttachmentEnabled) ||
     ((fileType === "" || null || undefined) &&
      (isImageAttachmentEnabled || isVideoAttachmentEnabled || isAudioAttachmentEnabled || isDocumentAttachmentEnabled )))
     {
        if (!allowedFilescheck.test(fileExtension)) {
          message = message + `${ALLOWED_ALL_FILE_FORMATS.join(", ")}`;
          toast.error(message);
          return Promise.resolve(false);
        }
      } 
    else if (IMAGE_VIDEO_FORMATS.includes(fileType) && isImageAttachmentEnabled && isVideoAttachmentEnabled) {
      if (!allowedImageVideoFilescheck.test(fileExtension)) {
          message = message + `${ALLOWED_IMAGE_VIDEO_FORMATS.join(", ")}`;
          toast.error(message);
          return Promise.resolve(false);
      }
    }
    else if (IMAGE_FORMATS.includes(fileType) && isImageAttachmentEnabled) {
      if (!allowedImageFilescheck.test(fileExtension)) {
          message = message + `${ALLOWED_IMAGE_FORMATS.join(", ")}`;
          toast.error(message);
          return Promise.resolve(false);
      }
    }
    else if (VIDEO_FORMATS.includes(fileType) && isVideoAttachmentEnabled) {
      if (!allowedVideoFilescheck.test(fileExtension)) {
          message = message + `${ALLOWED_VIDEO_FORMATS.join(", ")}`;
          toast.error(message);
          return Promise.resolve(false);
      }
    }
    else if (AUDIO_FORMATS.includes(fileType) && isAudioAttachmentEnabled) {
      if (!allowedAudioFilescheck.test(fileExtension)) {
          message = message + `${ALLOWED_AUDIO_FORMATS.join(", ")}`;
          toast.error(message);
          return Promise.resolve(false);
      }
    }
    else if (DOCUMENT_FORMATS.includes(fileType) && isDocumentAttachmentEnabled) {
      if (!allowedDocFilescheck.test(fileExtension)) {
          message = message + `${ALLOWED_DOCUMENT_FORMATS.join(", ")}`;
          toast.error(message);
          return Promise.resolve(false);
      }
    }
    else {
      message = FEATURE_RESTRICTION_ERROR_MESSAGE;
      toast.error(message);
      return Promise.resolve(false);
    }
    
  }
  return validateFileSize(file);
};

export const dispatchErrorMessage = () => {
  if (connectionStatus === "CONNECTED") return true;
  const message = `Please check your internet connection`;
  return toast.error(message);
};

export const setConnectionStatus = (status) => (connectionStatus = status);

export const sendErrorMessage = () => {
  const message = `Can't share more than ${maxAllowedMediaCount} media items.`;
  toast.error(message);
};

export const validateFile = (fileArray, mediaType) => {
  return Promise.all(fileArray.map((file) => validateFileExtension(file, mediaType)));
};

export const getConnectionStatus = () => connectionStatus;
