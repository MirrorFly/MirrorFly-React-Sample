import localforage from "localforage";
import SDK from '../Components/SDK';
import { getFromLocalStorageAndDecrypt, encryptAndStoreInLocalStorage} from '../Components/WebChat/WebChatEncryptDecrypt';
import configureRefreshFetch from './refreshFetch'
import { REACT_APP_API_URL } from '../Components/processENV';
import { CHAT_AUDIOS, CHAT_IMAGES, INVALID_STORENAME } from "./Constants";
import { MediaDownloadDataAction } from "../Actions/Media";
import Store from "../Store";

const shouldRefreshToken = error => {
    return error.status === 401 && error.message === 'Token Expired'
}
const mediaUrl = `${REACT_APP_API_URL}/media/`;
const retrieveToken = () => getFromLocalStorageAndDecrypt('token')

const refreshToken = () =>{
    let decryptResponse = getFromLocalStorageAndDecrypt('auth_user');
    return SDK.getUserToken(decryptResponse.username, decryptResponse.password)
    .then(async resp => {
        if (resp.statusCode === 200) {
            SDK.setUserToken(resp.userToken); 
            encryptAndStoreInLocalStorage("token", resp.userToken);
        }
    }).catch((error) => {
        console.log("handleLogin error, ", error);
    });
}
 
const refreshFetch = configureRefreshFetch({
    shouldRefreshToken,
    refreshToken,
    fetch: fetch,
})

const substringBetween = (s, a, b) => {
    if(s.indexOf(b) === -1) {
       return s;
    }
    let p = s.indexOf(a) + a.length;
    return s.substring(p, s.indexOf(b, p));
}

class IndexedDb {
    constructor() {
        if (!!IndexedDb.instance) {
            return IndexedDb.instance;
        }
        this._localforage = localforage
        const dbName = 'mirrorflydb';
        this._localforage.profileimages = localforage.createInstance({
            name: dbName,
            storeName: 'profileimages',
            description: 'profile image store at offline'
        });
        this._localforage[CHAT_IMAGES] = localforage.createInstance({
            name: dbName,
            storeName: CHAT_IMAGES,
            description: 'chat image store at offline'
        });
        this._localforage[CHAT_AUDIOS] = localforage.createInstance({
            name: dbName,
            storeName: CHAT_AUDIOS,
            description: 'chat audio store at offline'
        });
        this._localforage.calllogs = localforage.createInstance({
            name: dbName,
            storeName: 'callLogs',
            description: 'maintaining the call logs'
        });
        this._localforage.groupMembers = localforage.createInstance({
            name: dbName,
            storeName: 'groupMembers',
            description: 'maintaining the groupMembers'
        });
        IndexedDb.instance = this
        return IndexedDb.instance;
    }

    checkStatus(response) {
        if (response.status >= 200 && response.status < 300) {
            return response
        }
        const error = new Error(response.statusText)
        error.response = response
        throw error;
    }

    parseBlob(response) {
        if (response.status === 204 || response.status === 205) {
            return null
        }
        return response.blob()
    }

    setImage(key, blobInstance, storeName) {
        if (!storeName) {
            throw new Error(INVALID_STORENAME)
        }
        return this._localforage[storeName].setItem(key, blobInstance)
    }

    removeImage(key, storeName) {
        if (!storeName) {
            throw new Error(INVALID_STORENAME)
        }
        return this._localforage[storeName].removeItem(key)
    }

    async removeAllItems(storeName) {
        let keys = await this._localforage[storeName].keys()
        let allImages = []
        for (let key of keys) {
            allImages.push(await this.removeImage(key, storeName))
        }
        return allImages
    }

    async makeHttpRequest(key, storeName, fileKey, msgId = "") {
        return new Promise(async(resolve, reject) => {
            const uniqueKey = substringBetween(key,mediaUrl,'?mf');
            if (msgId) {
                SDK.downloadMedia(msgId, (res) => {
                    Store.dispatch(MediaDownloadDataAction(res));
                }, (response) => {
                    return this.setImage(uniqueKey, response.blob, storeName).then(()=>{
                        resolve(this.getImageByKey(uniqueKey, storeName, fileKey, msgId));
                    });
                }, (error) => {
                    console.log("error occured in downloading media", error);
                });
            } else {
                const response = await SDK.getMediaURL(uniqueKey, fileKey, msgId);
                if (response.statusCode === 200) {
                    return this.setImage(uniqueKey, response.data.blob, storeName).then(()=>{
                        resolve(this.getImageByKey(uniqueKey, storeName, fileKey, msgId));
                    });
                }
            }
        });
    }        

    getImageByKey(keyString, storeName, fileKey, msgId = "") {
        if (!keyString) {
            return Promise.reject(null)
        }
        if (!storeName) {
            throw new Error(INVALID_STORENAME)
        }
        return this._localforage[storeName]?.getItem(keyString)
            .then(async(blob) => {
                if (!blob) {
                    let result = await this.makeHttpRequest(keyString, storeName, fileKey, msgId)
                    console.log("result", result);
                    return result;
                }
                return blob;
            })
    }

    async getCallLogs(){
        let callLogs = [];
        return await localforage.calllogs.length().then(async function(numberOfKeys) {
            if(numberOfKeys > 0) {
                return localforage.calllogs.iterate(function(value, key, iterationNumber) {
                    callLogs.push(value);
                }).then(function() {
                    return Promise.resolve(callLogs);
                }).catch(function(err) {
                    console.log(err);
                    return Promise.resolve(callLogs);
                });
            } else {
                return Promise.resolve(callLogs);
            } 
        }).catch(async function(err) {
            console.log("error occured", err);
            return Promise.resolve(callLogs);
        });       
    }

    async insertCallLogs(callLogs){
        callLogs.map(callLog => {
            return this._localforage.calllogs.setItem(callLog.roomId, callLog);
        });
    }

    getCallLogByRoomId(roomId) {
        if(!roomId) {
            return Promise.resolve(null)
        }
        return localforage.calllogs.getItem(roomId)
            .then(callLog => {                
                return callLog;
            })
    }

    async insertGroupMemberDetails(groupId, participants){
            return this._localforage.groupMembers.setItem(groupId, participants);
    }

    getGroupMembersByGroupId(groupId) {
        if(!groupId) {
            return Promise.resolve(null)
        }
        return localforage.groupMembers.getItem(groupId)
        .then(participants => {                
            return participants;
        })
    }
}

export default IndexedDb
