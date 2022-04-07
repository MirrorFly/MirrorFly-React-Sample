import { SHOW_MODAL, HIDE_MODAL } from '../Actions/Constants';

const initialState = {
    modalType: null,
    modalProps: {
      open: false
    }
  }

export function PopUp(state = initialState, action = {}) {
    switch (action.type) {
      case SHOW_MODAL:
        return {
          modalProps: {
             ...action.payload.data
          },
          type: action.type
        }
      case HIDE_MODAL:
        return initialState
      default:
        return state
    }
  }
