import uuidv4 from 'uuid/v4';
import { SHOW_MODAL, HIDE_MODAL } from './Constants';

export const showModal = (data) => dispatch => {
  dispatch({
    type: SHOW_MODAL,
    payload: {
        id: uuidv4(),
        data
    }
  })
}

export const hideModal = () => dispatch => {
  dispatch({
    type: HIDE_MODAL
  })
}
