import { toast } from "react-toastify";
import Config from "../../../config";
import {
  ALLOWED_ALL_FILE_FORMATS,
  ALLOWED_AUDIO_FORMATS,
  ALLOWED_DOCUMENT_FORMATS,
  ALLOWED_IMAGE_VIDEO_FORMATS
} from "../../../Helpers/Constants";
import { getMessageType } from "../../../Helpers/Utility";

const { maxAllowedMediaCount, fileSize, imageFileSize, videoFileSize, audioFileSize, documentFileSize } = Config;
let connectionStatus = "";

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
    const message = `File size is too large. Try uploading file size below ${maxAllowedSize}MB`;
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
      var settings = JSON.parse(localStorage.getItem("settings"));
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
  const fileExtension = getExtension(file.name);
  const allowedFilescheck = new RegExp("([a-zA-Z0-9s_\\.-:])+(" + ALLOWED_ALL_FILE_FORMATS.join("|") + ")$", "i");
  let fileType = file.type;

  if (!allowedFilescheck.test(fileExtension) || fileType === "video/mpeg") {
    let message = "Unsupported file format. Files allowed: ";
    if (mediaType === "imagevideo") message = message + `${ALLOWED_IMAGE_VIDEO_FORMATS.join(", ")}`;
    else if (mediaType === "audio") message = message + `${ALLOWED_AUDIO_FORMATS.join(", ")}`;
    else if (mediaType === "file") message = message + `${ALLOWED_DOCUMENT_FORMATS.join(", ")}`;
    else message = message + `${ALLOWED_ALL_FILE_FORMATS.join(", ")}`;

    toast.error(message);
    return Promise.resolve(false);
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
