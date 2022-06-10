import { ADMIN_BLOCK_LIST } from "../Actions/Constants";

export function AdminBlockReducer(state = { data: [] }, action = {}) {
  if (action.type === ADMIN_BLOCK_LIST) {
    return action.payload;
  }
  return state;
}
