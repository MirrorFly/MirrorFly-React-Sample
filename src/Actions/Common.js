import uuidv4 from "uuid/v4";
import { UPDATE_ARCHIVE_CHAT } from "./Constants";

export const UpdateArchiveChatDataAction = (data) => {
  return {
    type: UPDATE_ARCHIVE_CHAT,
    payload: {
      id: uuidv4(),
      data
    }
  };
};
