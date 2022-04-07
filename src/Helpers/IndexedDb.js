import localforage from "localforage";
import SDK from '../Components/SDK';
import { decryption } from '../Components/WebChat/WebChatEncryptDecrypt';
import configureRefreshFetch from './refreshFetch'
import { REACT_APP_API_URL } from '../Components/processENV';
import { CHAT_AUDIOS, CHAT_IMAGES, INVALID_STORENAME } from "./Constants";

const shouldRefreshToken = error => {
    return error.status === 401 && error.message === 'Token Expired'
}
const mediaUrl = `${REACT_APP_API_URL}/media/`;
const retrieveToken = () => localStorage.getItem('token')

const refreshToken = () =>{
    let decryptResponse = decryption('auth_user');
    return SDK.getUserToken(decryptResponse.username, decryptResponse.password)
    .then(async resp => {
        if (resp.statusCode === 200) {
            SDK.setUserToken(resp.userToken); 
            localStorage.setItem("token", resp.userToken);
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
    var p = s.indexOf(a) + a.length;
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

    
  makeHttpRequet(key, storeName, options = {}) {
    const uniqueKey = substringBetween(key,mediaUrl,'?mf')
    const responseURL = `${mediaUrl}${uniqueKey}?mf=${retrieveToken()}`;  
    return refreshFetch(responseURL, options, key)
        .then(async response => {
            const blob = await response.blob();
            return this.setImage(uniqueKey, blob, storeName).then(()=>{
                return this.getImageByKey(uniqueKey, storeName, options)
             })
        })
   }

    getImageByKey(keyString, storeName, options) {
        if (!keyString) {
            return Promise.reject(null)
        }
        if (!storeName) {
            throw new Error(INVALID_STORENAME)
        }
        return this._localforage[storeName]?.getItem(keyString)
            .then(blob => {
                if (!blob) {
                    return this.makeHttpRequet(keyString, storeName, options)
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
