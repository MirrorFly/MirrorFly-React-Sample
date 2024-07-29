import uuidv4 from 'uuid/v4';
import { REACT_APP_API_URL } from '../Components/processENV';
import SDK from '../Components/SDK';
import { getFromLocalStorageAndDecrypt, encryptAndStoreInLocalStorage} from '../Components/WebChat/WebChatEncryptDecrypt';
import { compare } from '../Helpers/Utility';
import { FETCHING_USER_LIST, ROSTER_DATA, ROSTER_DATA_ADD, ROSTER_DATA_UPSERT, ROSTER_PERMISSION } from './Constants';

const mapColorForTouser =  () => {
    const randomValues = new Uint8Array(3);
    window.crypto.getRandomValues(randomValues);
    return '#' + Array.from(randomValues).map((v) => v.toString(16).padStart(2, '0')).join('');
}

const createUserMessageColor = ( data = []) =>{
    return data.map(contact=>{
        return { 
            ...contact,
            userColor:mapColorForTouser()
        }
    })
}

export const RosterData = (data) => {
    return (dispatch, getState) => {
        const getcurrentState = getState()
        const promise = new Promise((resolve,reject) =>{
            dispatch({
                type: ROSTER_DATA,
                payload: {
                    id: uuidv4(),
                    data:createUserMessageColor(data)
                }
            });
           resolve(true) 
        })
        const rosterId = getcurrentState?.rosterData?.id
        if(rosterId) return
        promise.then(async (res)=> {});
    };    
}

export const RosterDataUpsert = (data, pageNumber) => {
    return (dispatch, getState) => {
        const getcurrentState = getState()
        const promise = new Promise((resolve,reject) =>{
            dispatch({
                type: ROSTER_DATA_UPSERT,
                payload: {
                    id: uuidv4(),
                    data:createUserMessageColor(data),
                    pageNumber: pageNumber
                }
            });
           resolve(true) 
        })
        const rosterId = getcurrentState?.rosterData?.id
        if(rosterId) return
        promise.then(async (res)=> {});
    };    
}


function settings(){
    let token = getFromLocalStorageAndDecrypt('token');
    let decryptResponse = getFromLocalStorageAndDecrypt('auth_user');
    fetch(`${REACT_APP_API_URL}/users/config`,{
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    }).then(response => response.json()).then(res=>{
       const {data} = res
       return SDK.getSettings(data, decryptResponse.username+decryptResponse.username+decryptResponse.username)
    }).then(response=>{
        encryptAndStoreInLocalStorage('settings',response)
    })
}

export const RosterDataAction = (data) => async dispatch => {
    let contacts = await data.sort(compare);
    dispatch(RosterData(contacts));
}

/**
 * Add new data into roster
 * @param {*} userObj 
 */
export const addNewRosterAction = (userObj) => {
    return {
        type: ROSTER_DATA_ADD,
        payload: {
            id: uuidv4(),
            data:userObj
        }
    }
}

export const RosterPermissionAction = (data) => {
    return {
      type: ROSTER_PERMISSION,
      payload: {
        id: uuidv4(),
        data
      }
    }
}

export const fetchingUserList = (isFetchingUserList) => {
    return {
        type: FETCHING_USER_LIST,
        payload: {
            id: uuidv4(),
            data: isFetchingUserList
        }
    }
}
