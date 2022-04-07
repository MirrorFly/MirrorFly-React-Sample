import { CALL_INTERMEDIATE_SCREEN, RESET_CALL_INTERMEDIATE_SCREEN } from "../Actions/Constants";

const initialState = {
  id: null,
  data: {}
};

export function callIntermediateScreenReducer(state = initialState, action = {}) {
  if (action.type === CALL_INTERMEDIATE_SCREEN) {
    return {
      id: action.payload.id,
      data: {
        ...state.data,
        ...action.payload.data
      }
    };
  } else if (action.type === RESET_CALL_INTERMEDIATE_SCREEN) {
    return initialState;
  }
  return state;
}
