import uuidv4 from "uuid/v4";
import { CANCEL_MEDIA_UPLOAD } from "./Constants";

export const MediaUploadDataAction = (data) => {
  return {
    type: CANCEL_MEDIA_UPLOAD,
    payload: {
      id: uuidv4(),
      data
    }
  };
};
