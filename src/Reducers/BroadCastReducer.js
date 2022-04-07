import {
    CREATE_BROADCAST, UPDATE_BROADCAST, BROADCAST_RESET
} from '../Actions/Constants';

const initialState = {
    id: null,
    data: {}
}

const merge = (a, b, p) => a.filter( aa => ! b.find ( bb => aa[p] === bb[p]) ).concat(b);

export function BroadCastReducer(state = initialState, action) {
    const { id, data } = action.payload || {}
    switch (action.type) {
        case CREATE_BROADCAST:
            const { broadcastList } = data
            return {
                ...state,
                ...{
                    id: id,
                    data: {
                        ...state.data,
                        ...data, 
                        broadcastList: state?.data?.broadcastList ? merge(state?.data?.broadcastList,broadcastList,'jid') : broadcastList
                    }
                }
            };
        case UPDATE_BROADCAST:
            return {
                ...state,
                id,
                data: data
            }
        case BROADCAST_RESET:
            return {
                id: null,
                data: []
            }
        default:
            return state;
    }
}
