import { ls } from '../../Helpers/LocalStorage';
import Cryptlib from "cryptlib";
import { REACT_APP_ENCRYPT_KEY, REACT_APP_LICENSE_KEY } from '../processENV';

/**
 * Encrypt the json object and store into localstorage
 * @param {string} key Localstorage Key
 * @param {object} data Localstorage data - json object
 */
export function encryptAndStoreInLocalStorage(key, data) {
    let ecytData = encrypt(JSON.stringify(data), key);
    let encryptedKey = encrypt(key, REACT_APP_LICENSE_KEY);
    ls.setItem(encryptedKey, ecytData);
    return true;
}

/**
 * Decrypt the json object and retive data from localstorage
 * @param {string} key Localstorage Key
 */
export function getFromLocalStorageAndDecrypt(key) {
    let encryptedKey = encrypt(key, REACT_APP_LICENSE_KEY);
    let lsData = ls.getItem(encryptedKey);
    try {
        let dcypData = decrypt(lsData, key);
        return JSON.parse(dcypData);
    } catch (error){
        return lsData;
    }    
}

/**
 * Encrypt the json object and store into session storage
 * @param {string} key Session storage Key
 * @param {object} data Session storage data - json object
 */
 export function encryptAndStoreInSessionStorage(key, data) {
    let ecytData = encrypt(JSON.stringify(data), key);
    let encryptedKey = encrypt(key, REACT_APP_LICENSE_KEY);
    sessionStorage.setItem(encryptedKey, ecytData);
    return true;
}

/**
 * Decrypt the json object and retive data from session storage
 * @param {string} key Session storage Key
 */
export function getFromSessionStorageAndDecrypt(key) {
    let encryptedKey = encrypt(key, REACT_APP_LICENSE_KEY);
    let lsData = sessionStorage.getItem(encryptedKey);
    try {
        let dcypData = decrypt(lsData, key);
        return JSON.parse(dcypData);
    } catch (error){
        return lsData;
    }    
}

export function deleteItemFromLocalStorage(key) {
    let encryptedKey = encrypt(key, REACT_APP_LICENSE_KEY);
    localStorage.removeItem(encryptedKey);
}

export function deleteItemFromSessionStorage(key) {
    let encryptedKey = encrypt(key, REACT_APP_LICENSE_KEY);
    sessionStorage.removeItem(encryptedKey);
}

const encrypt = (data, key) => {
    const encryptKey = Cryptlib.getHashSha256(key, 32);
    return Cryptlib.encrypt(encodeURIComponent(data), encryptKey, REACT_APP_ENCRYPT_KEY);
};
  
const decrypt = (data, key) => {
    const decryptKey = Cryptlib.getHashSha256(key, 32);
    return decodeURIComponent(Cryptlib.decrypt(data, decryptKey, REACT_APP_ENCRYPT_KEY));
};
