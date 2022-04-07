import { CANCEL_MEDIA_UPLOAD } from "../Actions/Constants";

const initialState = {
  id: null,
  data: {}
};

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
